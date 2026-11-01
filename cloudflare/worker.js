// Arojen Tarinat link worker (Cloudflare Workers).
//
// https://dl.arojentarinat.com/ (also https://arojentarinat.juusohonkonen2004.workers.dev/)
//   /.well-known/assetlinks.json  Android App Links: lets the app open these links directly.
//   /join/ABC123                  A multiplayer room invite. With the game installed, Android opens the
//                                 game straight into that room; without it, this page shows the code
//                                 and the Google Play link.
//   anything else                 Redirects to the website.
//
// Deploy: Cloudflare dashboard > Workers & Pages > arojentarinat > Edit code > paste this file > Deploy.

const PLAY_URL = "https://play.google.com/store/apps/details?id=fi.bookish.creations.arojen.tarinat";

const WEBSITE = "https://www.arojentarinat.com";

// SHA-256 fingerprints of the keys that sign each build of the app.
const ASSET_LINKS = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "fi.bookish.creations.arojen.tarinat",
      sha256_cert_fingerprints: [
        // Google Play app signing key (what players install from Play).
        "8C:BD:C1:2A:4D:79:8E:BC:60:30:D1:3F:E0:44:1C:B6:3B:BC:CD:ED:74:33:9A:BE:8A:91:CF:B7:D0:C6:58:58",
        // Upload key (a release build installed outside Play).
        "C6:64:E2:65:C9:46:3D:6B:93:AD:CC:CA:26:7A:D1:5B:E7:53:04:BF:F9:59:9D:B2:32:2A:26:F2:67:18:6B:02",
      ],
    },
  },
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "fi.bookish.creations.arojen.tarinat.dev",
      // Debug builds (the developer's debug key).
      sha256_cert_fingerprints: ["CD:16:D9:06:C2:98:25:20:50:06:FB:C7:75:71:97:79:E3:AD:39:28:DF:DF:06:B2:17:13:09:21:DD:8E:2F:18"],
    },
  },
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "fi.bookish.creations.arojen.tarinat.preview",
      // Preview builds (the developer's preview key).
      sha256_cert_fingerprints: ["B7:E9:F8:D4:C8:8C:E6:87:EB:D0:CB:F5:48:47:B7:66:B9:85:13:BB:DA:36:73:20:BB:BB:3F:18:8D:B6:19:19"],
    },
  },
];

function page(title, body) {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #120f0c; color: #f4ead5;
         font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 420px; padding: 32px 24px; text-align: center; }
  h1 { color: #f5c96a; font-size: 26px; margin: 0 0 8px; letter-spacing: 0.04em; }
  p { color: #cdbf9f; margin: 8px 0; }
  .code { font-size: 34px; letter-spacing: 0.2em; color: #f5c96a; border: 1px solid #a8772a; border-radius: 12px;
          padding: 10px 16px; margin: 18px 0; display: inline-block; }
  a.button { display: inline-block; margin-top: 16px; padding: 12px 22px; border-radius: 10px; background: #e0a944;
             color: #120f0c; font-weight: 700; text-decoration: none; }
</style>
</head>
<body><main>${body}</main></body>
</html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/assetlinks.json") {
      return new Response(JSON.stringify(ASSET_LINKS, null, 2), {
        headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" },
      });
    }

    const join = url.pathname.match(/^\/join\/([A-Za-z0-9]{6})\/?$/);
    if (join) {
      const code = join[1].toUpperCase();
      return page(
        `Join game ${code} · Arojen Tarinat`,
        `<h1>AROJEN TARINAT</h1>
         <p>You are invited to a multiplayer game.</p>
         <div class="code">${code}</div>
         <p>Get the game, open <b>Multiplayer</b> and enter this room code.</p>
         <a class="button" href="${PLAY_URL}">Get it on Google Play</a>
         <p style="margin-top:22px"><a style="color:#f5c96a" href="${WEBSITE}">About the game</a></p>`,
      );
    }

    return Response.redirect(WEBSITE + "/", 302);
  },
};
