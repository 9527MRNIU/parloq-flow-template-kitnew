import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const themeRoot = resolve(root, process.argv[2] || process.env.TEMPLATE_PREVIEW_SOURCE || "dist/themes/white-label-account-link");
const port = Number.parseInt(process.env.TEMPLATE_PREVIEW_PORT || "4174", 10);
const states = ["input", "code_issued", "waiting_phone", "reconnecting", "verified_syncing", "verified_ready", "failed", "expired", "cancelled"];
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const manifest = JSON.parse(await readFile(resolve(themeRoot, "manifest.json"), "utf8"));
const locales = manifest.supportedLocales || ["en"];
const defaultLocale = manifest.defaultLocale || locales[0] || "en";
const themeLabel = manifest.name || themeRoot.split(/[/\\]/).at(-1);

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  response.end(body);
}

function safeSelection(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function pickSupportedLocale(language, supported) {
  const exact = supported.find((locale) => locale.toLowerCase() === String(language).toLowerCase());
  if (exact) return exact;
  const base = String(language).toLowerCase().split("-")[0];
  return supported.find((locale) => locale.toLowerCase().split("-")[0] === base);
}

function resolveRequestLocale(request, url, supported, fallback) {
  const param = url.searchParams.get("lang");
  if (param) return safeSelection(param, supported, fallback);
  const header = request.headers["accept-language"];
  if (typeof header === "string" && header.trim()) {
    for (const part of header.split(",")) {
      const language = part.trim().split(";")[0];
      const match = pickSupportedLocale(language, supported);
      if (match) return match;
    }
  }
  return fallback;
}

function previewHost() {
  const localeOptions = locales.map((locale) => `<option value="${locale}">${locale}</option>`).join("");
  const stateOptions = states.map((state) => `<option value="${state}">${state}</option>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Template kit preview</title><style>
:root{font-family:system-ui,sans-serif;color:#172033;background:#eef1f5}*{box-sizing:border-box}body{margin:0}.toolbar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;align-items:center;gap:.75rem;padding:.75rem 1rem;background:#fff;border-bottom:1px solid #d8dee9}.toolbar label{display:flex;align-items:center;gap:.4rem;font-size:.82rem;font-weight:700}.toolbar select,.toolbar button{min-height:2.25rem;border:1px solid #c6cedb;border-radius:.5rem;background:#fff;padding:.35rem .65rem}.toolbar button[data-active=true]{background:#172033;color:#fff}.toolbar .theme{font-size:.82rem;color:#475569}.stage{min-height:calc(100vh - 4rem);display:grid;place-items:start center;padding:1.5rem;overflow:auto}.frame-shell{overflow:hidden;background:#fff;border:1px solid #cfd6e2;border-radius:1rem;box-shadow:0 1rem 3rem #1720331f;transition:width .2s,height .2s}.frame-shell iframe{display:block;width:100%;height:100%;border:0}
</style></head><body>
<nav class="toolbar" aria-label="Preview controls">
<span class="theme">${themeLabel}</span>
<label>Locale <select id="locale">${localeOptions}</select></label>
<label>State <select id="state">${stateOptions}</select></label>
<span>Viewport</span>
<button data-size="1440,900">Desktop</button><button data-size="768,1024">Tablet</button><button data-size="390,844" data-active="true">Mobile</button>
</nav>
<main class="stage"><div class="frame-shell" id="shell" style="width:390px;height:844px"><iframe id="preview" title="Theme preview"></iframe></div></main>
<script>
const locale=document.querySelector('#locale'),state=document.querySelector('#state'),frame=document.querySelector('#preview'),shell=document.querySelector('#shell');
const supported=${JSON.stringify(locales)};
const fallback=${JSON.stringify(defaultLocale)};
const pickBrowserLocale=()=>{const candidates=navigator.languages?.length?[...navigator.languages]:[navigator.language||fallback];for(const language of candidates){const exact=supported.find(l=>l.toLowerCase()===String(language).toLowerCase());if(exact)return exact;const base=String(language).toLowerCase().split('-')[0];const partial=supported.find(l=>l.toLowerCase().split('-')[0]===base);if(partial)return partial}return fallback};
locale.value=pickBrowserLocale();
const load=()=>{frame.src='/theme?lang='+encodeURIComponent(locale.value)+'&state='+encodeURIComponent(state.value)};
locale.addEventListener('change',load);state.addEventListener('change',load);
document.querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-size]').forEach(item=>item.dataset.active='false');button.dataset.active='true';const [width,height]=button.dataset.size.split(',');shell.style.width=width+'px';shell.style.height=height+'px'}));
load();
</script></body></html>`;
}

function mockRuntime(locale, state, localizedCopy) {
  const runtimeConfig = {
    resolvedLocale: locale,
    defaultLocale,
    supportedLocales: locales,
    localizedCopy,
    previewMode: true,
    previewDevice: "mobile",
  };
  const configJson = JSON.stringify(runtimeConfig).replaceAll("<", "\\u003c");
  const localeJson = JSON.stringify(locale);
  const copyJson = JSON.stringify(localizedCopy).replaceAll("<", "\\u003c");
  const stateJson = JSON.stringify(state);
  return `<script id="promotion-runtime-config" type="application/json">${configJson}</script>
<script>
(()=>{const selected=${stateJson},locale=${localeJson},themeCopy=${copyJson};document.documentElement.lang=locale;document.documentElement.dir=['ar','fa','ur'].includes(locale)?'rtl':'ltr';
const applyThemeCopy=()=>{document.querySelectorAll('[data-copy]').forEach(node=>{const key=node.getAttribute('data-copy');if(key&&themeCopy[key])node.textContent=themeCopy[key]});document.querySelectorAll('[data-copy-content]').forEach(node=>{const key=node.getAttribute('data-copy-content');if(key&&themeCopy[key])node.setAttribute('content',themeCopy[key])});document.querySelectorAll('[data-copy-aria-label]').forEach(node=>{const key=node.getAttribute('data-copy-aria-label');if(key&&themeCopy[key])node.setAttribute('aria-label',themeCopy[key])});if(themeCopy.title)document.title=themeCopy.title};
document.addEventListener('DOMContentLoaded',()=>{applyThemeCopy();const linkOpen=document.getElementById('link-open');if(linkOpen&&selected!=='input')linkOpen.checked=true});
const pairing={pairingCode:'ABCD-EFGH',attemptId:'preview-attempt',pairingStatus:selected==='input'?'code_issued':selected,expiresAt:new Date(Date.now()+300000).toISOString()};
const data=()=>{if(selected==='verified_syncing')return{pairingStatus:'verified',verified:true,initializationStatus:'syncing',nextPollAfterMs:60000};if(selected==='verified_ready')return{pairingStatus:'verified',verified:true,initializationStatus:'ready'};return{pairingStatus:selected==='input'?'waiting_phone':selected,verified:false,nextPollAfterMs:60000}};
window.PromotionBridge={version:'promotion-browser-bridge/v2',submitPhone:async()=>new Response(JSON.stringify({data:{pairing}}),{status:200,headers:{'Content-Type':'application/json'}}),getPairingStatus:async()=>new Response(JSON.stringify({data:data()}),{status:200,headers:{'Content-Type':'application/json'}}),cancelPairing:async()=>new Response('',{status:204})};
if(selected!=='input')window.addEventListener('load',()=>setTimeout(()=>{const field=document.querySelector('phone-number-field'),input=field?.shadowRoot?.querySelector('input'),button=document.querySelector('account-link-submit')?.shadowRoot?.querySelector('button');if(input&&button){input.value='2025550123';input.dispatchEvent(new Event('input',{bubbles:true}));button.click()}},120));})();
</script>
<script src="/account-link-elements.js" defer></script>`;
}

async function serveFile(response, file) {
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    send(response, 200, await readFile(file), contentTypes[extname(file).toLowerCase()] || "application/octet-stream");
  } catch {
    send(response, 404, "Not found");
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
  if (url.pathname === "/") return send(response, 200, previewHost(), "text/html; charset=utf-8");
  if (url.pathname === "/account-link-elements.js") return serveFile(response, resolve(root, "dist/runtime/account-link-elements.js"));
  if (url.pathname === "/theme") {
    const locale = resolveRequestLocale(request, url, locales, defaultLocale);
    const state = safeSelection(url.searchParams.get("state"), states, "input");
    const localePath = resolve(themeRoot, `locales/${locale}.json`);
    let localizedCopy;
    try {
      localizedCopy = JSON.parse(await readFile(localePath, "utf8"));
    } catch {
      localizedCopy = JSON.parse(await readFile(resolve(themeRoot, `locales/${defaultLocale}.json`), "utf8"));
    }
    const html = await readFile(resolve(themeRoot, manifest.entry || "index.html"), "utf8");
    return send(response, 200, html.replace("</head>", `${mockRuntime(locale, state, localizedCopy)}</head>`), "text/html; charset=utf-8");
  }
  const relativePath = url.pathname.replace(/^\//, "");
  if (!relativePath || relativePath.includes("..")) return send(response, 404, "Not found");
  return serveFile(response, resolve(themeRoot, relativePath));
}).listen(port, "127.0.0.1", () => {
  console.log(`template preview (${themeLabel}): http://127.0.0.1:${port}`);
  console.log(`source: ${themeRoot}`);
});
