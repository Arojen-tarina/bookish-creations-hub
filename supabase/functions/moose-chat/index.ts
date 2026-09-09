/**
 * moose-chat/index.ts — Hirvi-avustajan LLM-varajärjestelmä (Edge Function)
 *
 * Käytetään vain kun paikallinen avainsanahaku (mooseFaq.ts) ei löydä
 * riittävän hyvää vastausta. Julkinen funktio (ei kirjautumista vaadita) —
 * pelillä ei ole käyttäjätilejä. Palauttaa selkeän virheen jos
 * LOVABLE_API_KEY-salaisuutta ei ole asetettu, jolloin asiakassovellus
 * näyttää paikallisen varavastauksen.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  lang: "fi" | "en";
}

// Simple in-memory rate limiting per IP (no auth on this endpoint)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60000; // 1 minute

const SYSTEM_PROMPT_FI = `Olet "Hirvi" — iloinen, avulias hirvimaskotti pelissä "Arojen Tarinat" (Story of the Steppe, vuosi 1206, vuoropohjainen strategiapeli mongolien valloitusten ajasta).
Vastaa LYHYESTI (max 3-4 lausetta) ja ystävällisesti suomeksi. Vastaa vain pelin sääntöihin, mekaniikkoihin ja tarinaan liittyviin kysymyksiin.
Peli: 4 pelattavaa valtakuntaa (Mongolit, Song, Rus, Khwarezm), 6 vuoron vaihetta (Resurssit, Kortit, Liike, Taistelu, Rakenna, Lopeta), 5 voittotapaa (sotilaallinen, taloudellinen, teknologinen, diplomaattinen, kulttuurinen).
 Jos et tiedä vastausta, sano se selvästi ja ohjaa pelaaja Sääntökirjaan (📖-kuvake) tai Kronikkaan (📜-kuvake). Älä keksi sääntöjä, kustannuksia, kynnysarvoja, sijainteja tai nykyistä pelitilannetta. Käytä vain yllä olevia tietoja ja pelaajan kysymystä.`;

const SYSTEM_PROMPT_EN = `You are "Moose" — a cheerful, helpful moose mascot in the game "Tales of the Steppe" (Arojen Tarinat, year 1206, a turn-based strategy game about the Mongol conquests).
Answer BRIEFLY (max 3-4 sentences) and in a friendly tone in English. Only answer questions about the game's rules, mechanics, and story.
The game: 4 playable realms (Mongol, Song, Rus, Khwarezm), 6 turn phases (Resources, Cards, Move, Battle, Build, End), 5 victory paths (military, economic, technology, diplomatic, cultural).
If you don't know the answer, say so clearly and point the player to the Rulebook (📖 icon) or the Chronicle (📜 icon). Never invent rules, costs, thresholds, locations, or current game state. Use only the facts listed above and the player's question.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    const { message, lang }: ChatRequest = await req.json();
    if (!message || typeof message !== "string" || message.length > 500) {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI assistant is not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = lang === "fi" ? SYSTEM_PROMPT_FI : SYSTEM_PROMPT_EN;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message.slice(0, 500) },
        ],
        max_tokens: 300,
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
