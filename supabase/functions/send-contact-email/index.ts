/**
 * send-contact-email/index.ts — Yhteydenottoviestin lähetys (Edge Function)
 *
 * Vastaanottaa nimen, sähköpostin ja viestin, ja lähettää sen
 * sähköpostina Resend-palvelun kautta.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Resend API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, message }: ContactEmailRequest = await req.json();

    // HTML escape utility to prevent XSS in email clients
    const escapeHtml = (unsafe: string): string => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Validate inputs
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Kaikki kentät ovat pakollisia" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send notification email to the business
    const notificationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Yhteydenotto <onboarding@resend.dev>",
        to: ["juuso5279@gmail.com"],
      subject: `Uusi yhteydenotto: ${escapeHtml(name)}`,
        html: `
          <h1>Uusi yhteydenotto verkkosivuilta</h1>
          <p><strong>Nimi:</strong> ${escapeHtml(name)}</p>
          <p><strong>Sähköposti:</strong> ${escapeHtml(email)}</p>
          <p><strong>Viesti:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      console.error("Resend notification email error:", errorText);
      throw new Error(`Failed to send notification email: ${notificationResponse.status}`);
    }

    console.log("Notification email sent successfully");

    // Send confirmation email to the sender
    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Honkosen Huoltopalvelut <onboarding@resend.dev>",
        to: [email],
        subject: "Kiitos yhteydenotostasi!",
        html: `
          <h1>Kiitos yhteydenotostasi, ${escapeHtml(name)}!</h1>
          <p>Olemme vastaanottaneet viestisi ja palaamme asiaan mahdollisimman pian.</p>
          <p><strong>Viestisi:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          <br>
          <p>Ystävällisin terveisin,<br>Honkosen Huoltopalvelut</p>
        `,
      }),
    });

    if (!confirmationResponse.ok) {
      const errorText = await confirmationResponse.text();
      console.error("Resend confirmation email error:", errorText);
      // Don't throw here - notification was sent successfully
    } else {
      console.log("Confirmation email sent successfully");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Viesti lähetetty onnistuneesti!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-contact-email function:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
