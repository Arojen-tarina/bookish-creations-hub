/**
 * moose-chat/index.ts — Hirvi-avustajan LLM-varajärjestelmä (Edge Function)
 *
 * Käytetään vain kun paikallinen avainsanahaku (mooseFaq.ts) ei löydä
 * riittävän hyvää vastausta. Julkinen funktio (ei kirjautumista vaadita) —
 * pelillä ei ole käyttäjätilejä. Käyttää OpenAI:n ChatGPT-mallia ja vaatii
 * palvelimeen asetetun OPENAI_API_KEY-salaisuuden.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  lang: "fi" | "en";
  history?: { role: "user" | "assistant"; content: string }[];
}

// Simple in-memory rate limiting per IP (no auth on this endpoint)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60000; // 1 minute

interface KnowledgeRow {
  category: "rules" | "lore";
  title_fi: string;
  title_en: string;
  content_fi: string;
  content_en: string;
  keywords: string[];
}

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function findKnowledge(message: string, lang: "fi" | "en"): Promise<string> {
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

  const words = normalize(message).split(/[^a-z0-9]+/).filter(word => word.length >= 3);
  const ranked = ((data ?? []) as KnowledgeRow[]).map(row => {
    const searchable = normalize(`${row[lang === "fi" ? "title_fi" : "title_en"]} ${row[lang === "fi" ? "content_fi" : "content_en"]} ${row.keywords.join(" ")}`);
    const score = words.reduce((total, word) => total + (searchable.includes(word) ? 1 : 0), 0);
    return { row, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);

  return ranked.map(({ row }) => {
    const title = row[lang === "fi" ? "title_fi" : "title_en"];
    const content = row[lang === "fi" ? "content_fi" : "content_en"];
    return `[${row.category}] ${title}: ${content}`;
  }).join("\n");
}

const SYSTEM_PROMPT_FI = `Olet "Hirvi" — iloinen, avulias hirvimaskotti pelissä "Arojen Tarinat" (Story of the Steppe, vuosi 1206, vuoropohjainen strategiapeli mongolien valloitusten ajasta).
Vastaa LYHYESTI (max 3-4 lausetta) ja ystävällisesti suomeksi. Vastaa vain pelin sääntöihin, mekaniikkoihin ja tarinaan liittyviin kysymyksiin.
Peli: 4 pelattavaa valtakuntaa (Mongolit, Song, Rus, Khwarezm), 6 vuoron vaihetta (Resurssit, Kortit, Liike, Taistelu, Rakenna, Lopeta), 5 voittotapaa (sotilaallinen, taloudellinen, teknologinen, diplomaattinen, kulttuurinen). Nykyiset pelin tavoitteet ovat 130 provinssia, 2000 kultaa ja 5 peräkkäistä kultarajavuoroa talousvoitossa; teknologiavoitto vaatii 5 teknologiakorttia, diplomaattivoitto 100 vaikutusvaltaa tai vähintään 2 liittolaista ja kulttuurivoitto 60 arvovaltaa.
 Jos et tiedä vastausta, sano se selvästi ja ohjaa pelaaja Sääntökirjaan (📖-kuvake) tai Kronikkaan (📜-kuvake). Älä keksi sääntöjä, kustannuksia, kynnysarvoja, sijainteja tai nykyistä pelitilannetta. Käytä vain yllä olevia tietoja ja pelaajan kysymystä.`;

const SYSTEM_PROMPT_EN = `You are "Moose" — a cheerful, helpful moose mascot in the game "Tales of the Steppe" (Arojen Tarinat, year 1206, a turn-based strategy game about the Mongol conquests).
Answer BRIEFLY (max 3-4 sentences) and in a friendly tone in English. Only answer questions about the game's rules, mechanics, and story.
The game: 4 playable realms (Mongol, Song, Rus, Khwarezm), 6 turn phases (Resources, Cards, Move, Battle, Build, End), 5 victory paths (military, economic, technology, diplomatic, cultural). Current game targets are 130 provinces, 2000 gold, and a 5-turn treasury streak for economic victory; technology requires 5 technology cards, diplomacy requires 100 influence or at least 2 allies, and culture requires 60 prestige.
If you don't know the answer, say so clearly and point the player to the Rulebook (📖 icon) or the Chronicle (📜 icon). Never invent rules, costs, thresholds, locations, or current game state. Use only the facts listed above and the player's question.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const limit = rateLimitMap.get(clientIp);
    if (limit && limit.resetAt > now) {
      if (limit.count >= RATE_LIMIT) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      limit.count += 1;
    } else {
      rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_WINDOW });
    }

    const { message, lang, history }: ChatRequest = await req.json();

    const safeHistory = Array.isArray(history)
      ? history
        .filter(item => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
        .slice(-6)
        .map(item => ({ role: item.role, content: item.content.slice(0, 500) }))
      : [];
    if (
      typeof message !== "string"
      || message.trim().length === 0
      || message.length > 500
      || (lang !== "fi" && lang !== "en")
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI assistant is not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const knowledge = await findKnowledge(message, lang);
    const systemPrompt = `${lang === "fi" ? SYSTEM_PROMPT_FI : SYSTEM_PROMPT_EN}
  ${knowledge ? `\nAuthoritative knowledge from the game's rulebook and codex:\n${knowledge}` : ""}
  Use the authoritative knowledge when it answers the question. If it does not, say that you do not know and point the player to the Rulebook or Chronicle. Do not invent missing facts.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: message.slice(0, 500) },
        ],
        temperature: 0.3,
        max_tokens: 220,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI assistant request failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const reply: string = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      console.error("AI gateway returned an empty response");
      return new Response(
        JSON.stringify({ error: "AI assistant returned an empty response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("moose-chat error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
