// Converts the Android strings*.xml resources into web/src/i18n/generated/<locale>.json.
// Output shape: { key: "text" | { one: "..", other: ".." } }, with Android escapes resolved.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const res = path.resolve(here, '../../ArojenTarinat-Source-Code/ArojenTarinat/app/src/main/res');
const out = path.resolve(here, '../src/i18n/generated');
fs.mkdirSync(out, { recursive: true });

const unescapeXml = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const unescapeAndroid = (s) => {
  let t = s.trim();
  if (t.startsWith('"') && t.endsWith('"') && t.length > 1) t = t.slice(1, -1);
  return unescapeXml(t).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\(['"@?\\])/g, '$1').replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
};

const dirs = fs.readdirSync(res).filter((d) => d === 'values' || /^values-[a-z]{2}$/.test(d));
for (const d of dirs) {
  const locale = d === 'values' ? 'en' : d === 'values-in' ? 'id' : d.slice(7);
  const data = {};
  for (const f of fs.readdirSync(path.join(res, d)).filter((f) => f.startsWith('strings') && f.endsWith('.xml'))) {
    const xml = fs.readFileSync(path.join(res, d, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    for (const m of xml.matchAll(/<string\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/string>/g)) data[m[1]] = unescapeAndroid(m[2]);
    for (const m of xml.matchAll(/<plurals\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/plurals>/g)) {
      const forms = {};
      for (const i of m[2].matchAll(/<item\s+quantity="([^"]+)"[^>]*>([\s\S]*?)<\/item>/g)) forms[i[1]] = unescapeAndroid(i[2]);
      data[m[1]] = forms;
    }
  }
  fs.writeFileSync(path.join(out, `${locale}.json`), JSON.stringify(data));
  console.log(locale, Object.keys(data).length);
}
