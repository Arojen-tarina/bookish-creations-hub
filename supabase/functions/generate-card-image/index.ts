// Supabase Edge Function for generating card images and storing them

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Convert base64 data URL to Uint8Array for upload
function base64ToUint8Array(base64: string): Uint8Array {
  // Remove data URL prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 50;
const RATE_WINDOW = 3600000; // 1 hour

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting
    const now = Date.now();
    const userLimit = rateLimitMap.get(user.id);
    if (userLimit && userLimit.resetAt > now) {
      if (userLimit.count >= RATE_LIMIT) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { cards } = await req.json() as { cards: CardRequest[] };
    
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      throw new Error("No cards provided");
    }

    // Update rate limit counter
    const rlNow = Date.now();
    const rl = rateLimitMap.get(user.id);
    if (rl && rl.resetAt > rlNow) {
      rl.count += cards.length;
    } else {
      rateLimitMap.set(user.id, { count: cards.length, resetAt: rlNow + RATE_WINDOW });
    }

    // Check which cards already exist in storage
    const { data: existingCards } = await supabase
      .from('generated_cards')
      .select('id, image_url')
      .in('id', cards.map(c => c.cardId));

    const existingCardIds = new Set(existingCards?.map(c => c.id) || []);
    const cardsToGenerate = cards.filter(c => !existingCardIds.has(c.cardId));

    // Return existing cards immediately
    const results: { cardId: string; imageUrl: string; success: boolean; error?: string; cached?: boolean }[] = [];
    
    existingCards?.forEach(card => {
      results.push({
        cardId: card.id,
        imageUrl: card.image_url,
        success: true,
        cached: true
      });
    });

    // Generate new cards
    for (const card of cardsToGenerate) {
      try {
        const prompt = generateArtPrompt(card);
        
        console.log(`Generating image for ${card.cardId}...`);
        
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
        const imageDataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (!imageDataUrl) {
          results.push({
            cardId: card.cardId,
            imageUrl: "",
            success: false,
            error: "No image generated"
          });
          continue;
        }

        // Upload image to storage
        const imageBytes = base64ToUint8Array(imageDataUrl);
        const fileName = `${card.cardId}.png`;
        
        const { error: uploadError } = await supabase.storage
          .from('card-images')
          .upload(fileName, imageBytes, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${card.cardId}:`, uploadError);
          results.push({
            cardId: card.cardId,
            imageUrl: "",
            success: false,
            error: `Upload error: ${uploadError.message}`
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('card-images')
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // Save to database
        const { error: dbError } = await supabase
          .from('generated_cards')
          .upsert({
            id: card.cardId,
            image_url: publicUrl,
            card_type: card.cardType
          });

        if (dbError) {
          console.error(`DB error for ${card.cardId}:`, dbError);
        }

        console.log(`Successfully generated and stored ${card.cardId}`);
        
        results.push({
          cardId: card.cardId,
          imageUrl: publicUrl,
          success: true
        });

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
        successful: results.filter(r => r.success).length,
        cached: results.filter(r => r.cached).length
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
