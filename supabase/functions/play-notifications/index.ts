// Google Play real-time developer notifications (Cloud Pub/Sub push subscription):
// renewals, cancellations, grace periods and expiries update
// public.premium_subscriptions without the player opening the app.
//
// Push endpoint: https://<project>.supabase.co/functions/v1/play-notifications?secret=<PLAY_RTDN_SECRET>
// Deployed with verify_jwt = false (Pub/Sub cannot send a Supabase key); the secret guards it.
import { PACKAGE_NAME, UnknownPurchase, verifyAndStore } from "../_shared/play.ts";

Deno.serve(async (req) => {
  const secret = Deno.env.get("PLAY_RTDN_SECRET");
  if (!secret || new URL(req.url).searchParams.get("secret") !== secret) return new Response("forbidden", { status: 403 });

  const body = await req.json().catch(() => null);
  const data = body?.message?.data;
  if (typeof data !== "string") return new Response("ignored");
  let note;
  try {
    note = JSON.parse(atob(data));
  } catch {
    return new Response("ignored");
  }
  const token = note?.subscriptionNotification?.purchaseToken;
  // Test notifications from Play Console and other apps' messages are acknowledged and dropped.
  if (note?.packageName !== PACKAGE_NAME || typeof token !== "string") return new Response("ok");

  try {
    await verifyAndStore(token);
    return new Response("ok");
  } catch (e) {
    if (e instanceof UnknownPurchase) return new Response("ok");
    console.error(e);
    // A failure status makes Pub/Sub deliver the message again later.
    return new Response("retry", { status: 500 });
  }
});
