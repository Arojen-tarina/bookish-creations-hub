// Supabase Edge Function for generating card images

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CardRequest {
  cardName: string;
  cardType: 'strategy' | 'diplomacy' | 'technology' | 'resource';
  cardDescription: string;
  cardId: string;
}

// Mapping card types to specific visual themes
const typeThemes: Record<string, string> = {
  strategy: "battle scene, warriors, military tactics, dynamic action",
  diplomacy: "royal court, diplomatic meeting, treaties, ornate palace",
  technology: "craftsmen, inventions, workshops, engineering",
  resource: "trade goods, landscapes, caravans, natural resources"
};

// Enhanced prompt generator for historical Mongolian-Persian art style
function generateArtPrompt(card: CardRequest): string {
  const baseStyle = "Historical Persian miniature painting style, realistic oil painting, 13th century Mongolian empire era, intricate details, rich warm colors, gold leaf accents, illuminated manuscript aesthetic";
  
  const typeContext = typeThemes[card.cardType] || "";
  
  // Create a context-aware prompt based on the card name and description
  const sceneDescription = `${card.cardName}: ${card.cardDescription}`;
  
  return `${baseStyle}. Scene depicting ${sceneDescription}. ${typeContext}. Mongolian and Persian artistic influences, traditional Central Asian elements, detailed borders with geometric patterns, museum quality artwork, dramatic lighting, professional illustration.`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { cards } = await req.json() as { cards: CardRequest[] };
    
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      throw new Error("No cards provided");
    }

    // Process cards in smaller batches to avoid timeouts
    const results: { cardId: string; imageUrl: string; success: boolean; error?: string }[] = [];
    
    for (const card of cards) {
      try {
        const prompt = generateArtPrompt(card);
        
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            modalities: ["image", "text"]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error for ${card.cardId}:`, errorText);
          results.push({
            cardId: card.cardId,
            imageUrl: "",
            success: false,
            error: `API error: ${response.status}`
          });
          continue;
        }

        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageUrl) {
          results.push({
            cardId: card.cardId,
            imageUrl: imageUrl,
            success: true
          });
        } else {
          results.push({
            cardId: card.cardId,
            imageUrl: "",
            success: false,
            error: "No image generated"
          });
        }
      } catch (cardError: unknown) {
        const errorMessage = cardError instanceof Error ? cardError.message : 'Unknown error';
        console.error(`Error processing card ${card.cardId}:`, cardError);
        results.push({
          cardId: card.cardId,
          imageUrl: "",
          success: false,
          error: errorMessage
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        results,
        processed: results.length,
        successful: results.filter(r => r.success).length
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in generate-card-image:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
