/**
 * moose-chat/index.ts — Hirvi-avustajan LLM-varajärjestelmä (Edge Function)
 *
 * Käytetään vain kun paikallinen avainsanahaku (mooseFaq.ts) ei löydä
 * riittävän hyvää vastausta. Julkinen funktio (ei kirjautumista vaadita) —
 * pelillä ei ole käyttäjätilejä. Käyttää OpenAI:n ChatGPT-mallia ja vaatii
 * palvelimeen asetetun LOVABLE_API_KEY-salaisuuden.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

type Lang = "fi" | "en";

/* ------------------------------------------------------------------ */
/* Rate limiting (in-memory, per instance)                             */
/* ------------------------------------------------------------------ */

const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (now > value.resetAt) hits.delete(key);
    }
  }

  return false;
}

/* ------------------------------------------------------------------ */
/* Knowledge base lookup (rulebook/lore grounding)                     */
/* ------------------------------------------------------------------ */

interface KnowledgeRow {
  category: "rules" | "lore";
  title_fi: string;
  title_en: string;
  content_fi: string;
  content_en: string;
  keywords: string[];
}

const normalize = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function findKnowledge(message: string, lang: Lang): Promise<string> {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return "";

  const db = createClient(url, serviceKey);
  const { data, error } = await db
    .from("moose_knowledge")
    .select("category, title_fi, title_en, content_fi, content_en, keywords")
    .limit(100);
  if (error) {
    console.error("Moose knowledge lookup failed:", error.message);
    return "";
  }

  const words = normalize(message).split(/[^a-z0-9]+/).filter((word) => word.length >= 3);
  const ranked = ((data ?? []) as KnowledgeRow[])
    .map((row) => {
      const searchable = normalize(
        `${row[lang === "fi" ? "title_fi" : "title_en"]} ${row[lang === "fi" ? "content_fi" : "content_en"]} ${row.keywords.join(" ")}`,
      );
      const score = words.reduce((total, word) => total + (searchable.includes(word) ? 1 : 0), 0);
      return { row, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return ranked
    .map(({ row }) => {
      const title = row[lang === "fi" ? "title_fi" : "title_en"];
      const content = row[lang === "fi" ? "content_fi" : "content_en"];
      return `[${row.category}] ${title}: ${content}`;
    })
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* Prompts & localized messages                                        */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPTS: Record<Lang, string> = {
  fi: `Olet "Hirvi" — iloinen, avulias hirvimaskotti pelissä "Arojen Tarinat" (Story of the Steppe, vuosi 1206, vuoropohjainen strategiapeli mongolien valloitusten ajasta).
Vastaa LYHYESTI (max 3-4 lausetta) ja ystävällisesti suomeksi. Vastaa vain pelin sääntöihin, mekaniikkoihin ja tarinaan liittyviin kysymyksiin.
Peli: 4 pelattavaa valtakuntaa (Mongolit, Song, Rus, Khwarezm), 6 vuoron vaihetta (Resurssit, Kortit, Liike, Taistelu, Rakenna, Lopeta), 5 voittotapaa (sotilaallinen, taloudellinen, teknologinen, diplomaattinen, kulttuurinen).
 Jos et tiedä vastausta, sano se selvästi ja ohjaa pelaaja Sääntökirjaan (📖-kuvake) tai Kronikkaan (📜-kuvake). Älä keksi sääntöjä, kustannuksia, kynnysarvoja, sijainteja tai nykyistä pelitilannetta. Käytä vain yllä olevia tietoja ja pelaajan kysymystä.`,
  en: `You are "Moose" — a cheerful, helpful moose mascot in the game "Tales of the Steppe" (Arojen Tarinat, year 1206, a turn-based strategy game about the Mongol conquests).
Answer BRIEFLY (max 3-4 sentences) and in a friendly tone in English. Only answer questions about the game's rules, mechanics, and story.
The game: 4 playable realms (Mongol, Song, Rus, Khwarezm), 6 turn phases (Resources, Cards, Move, Battle, Build, End), 5 victory paths (military, economic, technology, diplomatic, cultural).
If you don't know the answer, say so clearly and point the player to the Rulebook (📖 icon) or the Chronicle (📜 icon). Never invent rules, costs, thresholds, locations, or current game state. Use only the facts listed above and the player's question.`,
};

const MESSAGES = {
  invalidInput: {
    fi: "Hups, en saanut kysymystäsi selville. Kokeile kirjoittaa se uudelleen.",
    en: "Oops, I couldn't read your question. Try typing it again.",
  },
  tooLong: {
    fi: `Kysymys on liian pitkä. Pidä se alle ${MAX_MESSAGE_LENGTH} merkissä.`,
    en: `That question is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
  },
  rateLimited: {
    fi: "Hetkinen, kysyit aika monta kysymystä nopeasti. Odota hetki ja kysy uudelleen.",
    en: "Whoa, that's a lot of questions at once. Wait a moment and ask again.",
  },
  unavailable: {
    fi: "En saa juuri nyt yhteyttä ajatuksiini. Kysy kohta uudelleen tai kokeile Sääntökirjaa (📖).",
    en: "I can't reach my thoughts right now. Ask again shortly or try the Rulebook (📖).",
  },
  paymentRequired: {
    fi: "Tekoälyapuni on tauolla. Kysy minulta pelin perusasioista Sääntökirjan (📖) avulla sillä välin.",
    en: "My AI helper is on a break. Try the Rulebook (📖) for the game basics in the meantime.",
  },
} as const;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function reply(text: string, status = 200): Response {
  return json({ reply: text }, status);
}

/* ------------------------------------------------------------------ */
/* Lovable AI call — streamed and consumed server-side                 */
/* ------------------------------------------------------------------ */

async function askLovableAi(
  message: string,
  lang: Lang,
  apiKey: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number }> {
  const knowledge = await findKnowledge(message, lang);
  const systemPrompt = knowledge
    ? `${SYSTEM_PROMPTS[lang]}\n\nAuthoritative knowledge from the game's rulebook and codex:\n${knowledge}\nUse the authoritative knowledge when it answers the question. If it does not, say that you do not know and point the player to the Rulebook or Chronicle. Do not invent missing facts.`
    : SYSTEM_PROMPTS[lang];

  const response = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    console.error(`AI gateway HTTP ${response.status}: ${await response.text().catch(() => "")}`);
    return { ok: false, status: response.status || 502 };
  }

  // Streaming keeps bytes flowing so long answers can't hit a gateway timeout,
  // but the client only ever sees one { reply } payload.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") text += delta;
      } catch {
        // Ignore partial or non-JSON keep-alive chunks.
      }
    }
  }

  const trimmedText = text.trim();
  if (!trimmedText) return { ok: false, status: 502 };
  return { ok: true, text: trimmedText };
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return reply(MESSAGES.invalidInput.fi, 405);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return reply(MESSAGES.invalidInput.fi, 400);
  }

  const raw = body as { message?: unknown; lang?: unknown } | null;
  const lang: Lang = raw?.lang === "en" ? "en" : "fi";

  if (isRateLimited(ip)) {
    return reply(MESSAGES.rateLimited[lang], 429);
  }

  if (typeof raw?.message !== "string") {
    return reply(MESSAGES.invalidInput[lang], 400);
  }

  const message = raw.message.trim();
  if (!message) {
    return reply(MESSAGES.invalidInput[lang], 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return reply(MESSAGES.tooLong[lang], 400);
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    console.error("LOVABLE_API_KEY is not configured for this function.");
    return reply(MESSAGES.unavailable[lang], 503);
  }

  try {
    const result = await askLovableAi(message, lang, apiKey);

    if (result.ok) {
      return reply(result.text);
    }

    // 402/403 are terminal: no credits or blocked by policy — don't retry.
    if (result.status === 402 || result.status === 403) {
      console.error(`Lovable AI blocked the request (${result.status}).`);
      return reply(MESSAGES.paymentRequired[lang], result.status);
    }

    console.error(`Lovable AI returned status ${result.status}.`);
    return reply(MESSAGES.unavailable[lang], 502);
  } catch (error) {
    console.error("Lovable AI request failed:", error);
    return reply(MESSAGES.unavailable[lang], 502);
  }
});
