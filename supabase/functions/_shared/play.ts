// Google Play Developer API access for the Premium subscription, shared by
// verify-premium and play-notifications. Needs the secret GOOGLE_SERVICE_ACCOUNT_JSON:
// the JSON key of a Google Cloud service account that Play Console lists under
// Users and permissions (with "View financial data" and "Manage orders and subscriptions").
import { createClient } from "jsr:@supabase/supabase-js@2";

export const PACKAGE_NAME = "fi.bookish.creations.arojen.tarinat";
export const PRODUCT_ID = "premium";

const SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

/** Google said this token is not a purchase of this app (forged, or from another app). */
export class UnknownPurchase extends Error {}

export function serviceAccount(): ServiceAccount | null {
  const raw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw);
    return sa.client_email && sa.private_key ? sa : null;
  } catch {
    return null;
  }
}

function base64Url(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let cached: { token: string; until: number } | null = null;

/** OAuth access token for the service account (signed JWT grant), reused until shortly before it expires. */
async function accessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.until > now + 60) return cached.token;
  const tokenUri = sa.token_uri ?? "https://oauth2.googleapis.com/token";
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claims}`)));
  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${base64Url(signature)}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  cached = { token: body.access_token, until: now + (body.expires_in ?? 3600) };
  return cached.token;
}

export interface Verdict {
  active: boolean;
  state: string;
  expiryTime: string | null;
}

/** States that still entitle the player: canceled means "will not renew", not "ended". */
function isActive(state: string, expiry: string | null): boolean {
  if (state === "ACTIVE" || state === "IN_GRACE_PERIOD") return true;
  if (state === "CANCELED") return expiry !== null && Date.parse(expiry) > Date.now();
  return false;
}

/** Asks Google about one purchase token, records the answer and acknowledges the purchase if needed. */
export async function verifyAndStore(purchaseToken: string): Promise<Verdict> {
  const sa = serviceAccount();
  if (!sa) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const auth = { Authorization: `Bearer ${await accessToken(sa)}` };
  const url = `${API}/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
  const res = await fetch(url, { headers: auth });
  if (res.status === 400 || res.status === 404 || res.status === 410) throw new UnknownPurchase(`Google: ${res.status}`);
  if (!res.ok) throw new Error(`Google subscriptionsv2: ${res.status} ${await res.text()}`);
  const sub = await res.json();

  const line = (sub.lineItems ?? []).find((l: { productId?: string }) => l.productId === PRODUCT_ID) ?? sub.lineItems?.[0] ?? {};
  if (line.productId !== PRODUCT_ID) throw new UnknownPurchase("not the premium product");
  const state = String(sub.subscriptionState ?? "SUBSCRIPTION_STATE_UNSPECIFIED").replace("SUBSCRIPTION_STATE_", "");
  const expiry: string | null = line.expiryTime ?? null;
  const acknowledged = sub.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";
  const verdict: Verdict = { active: isActive(state, expiry), state, expiryTime: expiry };

  // The app acknowledges too; doing it here as well keeps Play from refunding if the app was closed too early.
  let ackDone = acknowledged;
  if (!acknowledged && verdict.active) {
    const ack = await fetch(`${API}/${PACKAGE_NAME}/purchases/subscriptions/${PRODUCT_ID}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: "{}",
    });
    ackDone = ack.ok;
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await db.from("premium_subscriptions").upsert({
    purchase_token: purchaseToken,
    package_name: PACKAGE_NAME,
    product_id: PRODUCT_ID,
    base_plan_id: line.offerDetails?.basePlanId ?? null,
    state,
    active: verdict.active,
    expiry_time: expiry,
    auto_renewing: line.autoRenewingPlan?.autoRenewEnabled ?? null,
    latest_order_id: sub.latestOrderId ?? null,
    linked_token: sub.linkedPurchaseToken ?? null,
    region_code: sub.regionCode ?? null,
    test_purchase: sub.testPurchase !== undefined,
    acknowledged: ackDone,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("premium_subscriptions upsert failed", error);
  return verdict;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
