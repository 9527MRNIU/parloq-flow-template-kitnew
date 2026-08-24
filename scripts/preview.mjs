import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { loadPublicArtifactCatalog } from "./artifact-catalog.mjs";

const root = resolve(import.meta.dirname, "..");
const port = Number.parseInt(process.env.TEMPLATE_PREVIEW_PORT || "4174", 10);
const states = [
  ["input", "输入手机号"],
  ["code_issued", "已生成绑定码"],
  ["waiting_phone", "等待手机确认"],
  ["reconnecting", "正在重新连接"],
  ["verified_syncing", "已验证，正在同步"],
  ["verified_ready", "已验证，可以使用"],
  ["failed", "关联失败"],
  ["expired", "绑定码已过期"],
  ["cancelled", "已取消"],
];
const stateValues = states.map(([value]) => value);
const localeNames = {
  en: "英语",
  "zh-CN": "简体中文",
  hi: "印地语",
  id: "印度尼西亚语",
  "pt-BR": "葡萄牙语（巴西）",
  es: "西班牙语",
  ru: "俄语",
  ur: "乌尔都语",
  de: "德语",
  tr: "土耳其语",
  ar: "阿拉伯语",
  fa: "波斯语",
  bn: "孟加拉语",
  it: "意大利语",
  fr: "法语",
};
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".enc": "application/octet-stream",
};

const catalog = await loadPublicArtifactCatalog(root);
const templates = await Promise.all(
  catalog
    .filter((artifact) => artifact.kind === "template")
    .map(async (artifact) => {
      const themeRoot = resolve(root, "dist", artifact.outputDirectory, artifact.slug);
      const manifest = JSON.parse(await readFile(resolve(themeRoot, "manifest.json"), "utf8"));
      return {
        slug: artifact.slug,
        name: String(manifest.name || artifact.name || artifact.slug),
        root: themeRoot,
        entry: String(manifest.entry || "index.html"),
        defaultLocale: String(manifest.defaultLocale || "en"),
        supportedLocales: Array.isArray(manifest.supportedLocales)
          ? manifest.supportedLocales.map(String)
          : ["en"],
        localePath: String(manifest.i18n?.path || "locales/{locale}.json"),
      };
    }),
);

if (templates.length === 0) {
  throw new Error("没有可预览的模板，请先在 artifacts/catalog.json 中登记模板并运行 npm run build");
}

const templateBySlug = new Map(templates.map((template) => [template.slug, template]));
const defaultTemplate = templates[0];

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  response.end(body);
}

function safeSelection(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function resolveAutomaticLocale(acceptLanguage, supportedLocales, fallback) {
  const requested = String(acceptLanguage || "")
    .split(",")
    .map((part, index) => {
      const [tag, ...parameters] = part.trim().split(";");
      const quality = parameters
        .map((parameter) => parameter.trim().match(/^q=([0-9.]+)$/i)?.[1])
        .find(Boolean);
      return { tag: tag.toLowerCase(), quality: quality ? Number(quality) : 1, index };
    })
    .filter(({ tag, quality }) => tag && tag !== "*" && Number.isFinite(quality) && quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index);
  for (const { tag } of requested) {
    const exact = supportedLocales.find((locale) => locale.toLowerCase() === tag);
    if (exact) return exact;
    const language = tag.split("-")[0];
    const languageMatch = supportedLocales.find(
      (locale) => locale.toLowerCase().split("-")[0] === language,
    );
    if (languageMatch) return languageMatch;
  }
  return fallback;
}

function previewHost() {
  const clientTemplates = JSON.stringify(
    templates.map(({ slug, name, defaultLocale, supportedLocales }) => ({
      slug,
      name,
      defaultLocale,
      supportedLocales,
    })),
  ).replaceAll("<", "\\u003c");
  const clientLocaleNames = JSON.stringify(localeNames).replaceAll("<", "\\u003c");
  const clientStates = JSON.stringify(states).replaceAll("<", "\\u003c");
  const picker = (id, label, className) => `<div class="control ${className}">
<span class="control-label" id="${id}-label">${label}</span>
<div class="picker" id="${id}-picker">
<button class="picker-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-label ${id}-value"><span class="picker-value" id="${id}-value"></span><svg class="picker-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
<div class="picker-popover" hidden><div class="picker-options" role="listbox" aria-labelledby="${id}-label"></div></div>
</div></div>`;
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>推广模板预览</title><style>
:root{font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#172033;background:#eef1f5}*{box-sizing:border-box}body{margin:0}.toolbar{position:sticky;top:0;z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .75rem;padding:.55rem .75rem;background:#ffffffed;border-bottom:1px solid #dce3ed;box-shadow:0 .35rem 1.2rem #1720330d;backdrop-filter:blur(16px)}.control{display:flex;align-items:center;gap:.35rem}.control-label,.viewport-label{font-size:.76rem;font-weight:750;white-space:nowrap;color:#334155}.picker{position:relative}.control-template .picker{width:14rem}.control-locale .picker{width:8.5rem}.control-state .picker{width:10rem}.picker-trigger,.viewport-button{font:inherit;color:inherit}.picker-trigger{width:100%;min-height:2.25rem;display:flex;align-items:center;justify-content:space-between;gap:.45rem;padding:.35rem .55rem .35rem .65rem;border:1px solid #cbd5e1;border-radius:.62rem;background:linear-gradient(180deg,#fff,#f8fafc);box-shadow:0 1px 2px #0f172a0a;cursor:pointer;transition:border-color .16s ease,box-shadow .16s ease,background .16s ease}.picker-trigger:hover{border-color:#94a3b8;background:#fff}.picker-trigger:focus-visible,.picker-trigger[aria-expanded=true]{outline:0;border-color:#64748b;box-shadow:0 0 0 3px #cbd5e166}.picker-value{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:start;font-size:.82rem;font-weight:650}.picker-chevron{width:.85rem;height:.85rem;flex:0 0 auto;color:#64748b;transition:transform .16s ease}.picker-trigger[aria-expanded=true] .picker-chevron{transform:rotate(180deg)}.picker-popover{position:absolute;top:calc(100% + .4rem);inset-inline:0;z-index:40;min-width:max(100%,11.5rem);padding:.3rem;border:1px solid #dbe3ef;border-radius:.75rem;background:#fff;box-shadow:0 1rem 2.5rem #0f172a24,0 .2rem .7rem #0f172a12}.picker-popover[hidden]{display:none}.picker-options{max-height:min(24rem,calc(100vh - 7rem));overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}.picker-option{width:100%;display:grid;grid-template-columns:minmax(0,1fr) 1.25rem;align-items:center;gap:.5rem;padding:.5rem .58rem;border:0;border-radius:.55rem;background:transparent;color:#334155;text-align:start;cursor:pointer}.picker-option:hover,.picker-option:focus-visible{outline:0;background:#f1f5f9}.picker-option[aria-selected=true]{background:#eef2ff;color:#3730a3}.picker-option-copy{display:grid;gap:.08rem;min-width:0}.picker-option-label{font-size:.82rem;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.picker-option-meta{font-size:.66rem;color:#94a3b8}.picker-option[aria-selected=true] .picker-option-meta{color:#6366f1}.picker-check{display:grid;place-items:center;width:1.1rem;height:1.1rem;border-radius:999px;font-size:.7rem;font-weight:900;color:transparent}.picker-option[aria-selected=true] .picker-check{color:#fff;background:#4f46e5}.viewport-buttons{display:flex;gap:.3rem}.viewport-button{min-height:2.25rem;border:1px solid #cbd5e1;border-radius:.62rem;background:#fff;padding:.32rem .62rem;font-size:.82rem;cursor:pointer;transition:.16s ease}.viewport-button:hover{border-color:#94a3b8;background:#f8fafc}.viewport-button:focus-visible{outline:0;box-shadow:0 0 0 3px #cbd5e166}.viewport-button[data-active=true]{border-color:#172033;background:#172033;color:#fff;box-shadow:0 .35rem .9rem #17203326}.stage{min-height:calc(100vh - 3.4rem);display:grid;place-items:start center;padding:1.25rem;overflow:auto}.frame-shell{overflow:hidden;background:#fff;border:1px solid #cfd6e2;border-radius:1rem;box-shadow:0 1rem 3rem #1720331f;transition:width .2s,height .2s}.frame-shell iframe{display:block;width:100%;height:100%;border:0}@media(max-width:860px){.toolbar{align-items:flex-start}.control{flex:1 1 12rem}.control .picker{width:auto;flex:1}.viewport-buttons{flex-wrap:wrap}}@media(max-width:540px){.toolbar{gap:.5rem;padding:.55rem}.control{flex-basis:100%}.stage{padding:.75rem}.viewport-label{align-self:center}}
.viewport-control{display:flex;align-items:center;gap:.35rem}
</style></head><body>
<nav class="toolbar" aria-label="模板预览控制栏">
${picker("template", "模板", "control-template")}
${picker("locale", "语言", "control-locale")}
${picker("state", "状态", "control-state")}
<div class="viewport-control"><span class="viewport-label" id="viewport-label">视口</span><div class="viewport-buttons" role="group" aria-labelledby="viewport-label"><button class="viewport-button" data-device="desktop" data-size="1440,900">桌面</button><button class="viewport-button" data-device="tablet" data-size="768,1024">平板</button><button class="viewport-button" data-device="mobile" data-size="390,844" data-active="true">手机</button></div></div>
</nav>
<main class="stage"><div class="frame-shell" id="shell" style="width:390px;height:844px"><iframe id="preview" title="模板预览内容"></iframe></div></main>
<script>
const templates=${clientTemplates},localeNames=${clientLocaleNames},states=${clientStates};
const frame=document.querySelector('#preview'),shell=document.querySelector('#shell'),pickers=[];
const closePickers=(except)=>pickers.forEach(picker=>{if(picker.root!==except)picker.close()});
const createPicker=(root,options,initialValue,onChange)=>{
  const trigger=root.querySelector('.picker-trigger'),valueNode=root.querySelector('.picker-value'),popover=root.querySelector('.picker-popover'),list=root.querySelector('.picker-options');
  let items=[],value='';
  const close=()=>{popover.hidden=true;trigger.setAttribute('aria-expanded','false')};
  const focusOption=(offset)=>{
    const available=Array.from(list.querySelectorAll('.picker-option'));if(!available.length)return;
    const current=Math.max(0,available.indexOf(document.activeElement));available[(current+offset+available.length)%available.length].focus();
  };
  const open=()=>{closePickers(root);popover.hidden=false;trigger.setAttribute('aria-expanded','true');requestAnimationFrame(()=>{const selected=list.querySelector('[aria-selected=true]')||list.querySelector('.picker-option');selected?.focus();selected?.scrollIntoView({block:'nearest'})})};
  const syncSelection=()=>{valueNode.textContent=items.find(item=>item.value===value)?.label||'';list.querySelectorAll('.picker-option').forEach(option=>option.setAttribute('aria-selected',String(option.dataset.value===value)))};
  const setValue=(next,emit=true)=>{const selected=items.find(item=>item.value===next)||items[0];if(!selected)return;const changed=value!==selected.value;value=selected.value;syncSelection();if(emit&&changed)onChange(value)};
  const render=()=>{list.replaceChildren(...items.map(item=>{const option=document.createElement('button');option.type='button';option.className='picker-option';option.dataset.value=item.value;option.setAttribute('role','option');const copy=document.createElement('span');copy.className='picker-option-copy';const label=document.createElement('span');label.className='picker-option-label';label.textContent=item.label;copy.append(label);if(item.meta){const meta=document.createElement('span');meta.className='picker-option-meta';meta.textContent=item.meta;copy.append(meta)}const check=document.createElement('span');check.className='picker-check';check.setAttribute('aria-hidden','true');check.textContent='✓';option.append(copy,check);option.addEventListener('click',()=>{setValue(item.value);close();trigger.focus()});option.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();focusOption(event.key==='ArrowDown'?1:-1)}else if(event.key==='Home'||event.key==='End'){event.preventDefault();const available=list.querySelectorAll('.picker-option');available[event.key==='Home'?0:available.length-1]?.focus()}else if(event.key==='Escape'){event.preventDefault();close();trigger.focus()}});return option}));syncSelection()};
  const setOptions=(next,preferred)=>{items=next;value=items.some(item=>item.value===preferred)?preferred:items[0]?.value||'';render()};
  trigger.addEventListener('click',()=>popover.hidden?open():close());
  trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open()}else if(event.key==='Escape'){close()}});
  const api={root,close,setOptions,setValue,get value(){return value}};pickers.push(api);setOptions(options,initialValue);return api;
};
const requestedTemplate=new URL(location.href).searchParams.get('template');
let localePicker,statePicker;
const templatePicker=createPicker(document.querySelector('#template-picker'),templates.map(item=>({value:item.slug,label:item.name})),templates.some(item=>item.slug===requestedTemplate)?requestedTemplate:templates[0].slug,()=>{syncLocales();load()});
localePicker=createPicker(document.querySelector('#locale-picker'),[],'auto',()=>load());
statePicker=createPicker(document.querySelector('#state-picker'),states.map(([value,label])=>({value,label})),'input',()=>load());
let device='mobile';
const selectedTemplate=()=>templates.find(item=>item.slug===templatePicker.value)||templates[0];
const syncLocales=()=>{const selected=selectedTemplate(),current=localePicker.value;localePicker.setOptions([{value:'auto',label:'自动识别',meta:'跟随浏览器或系统语言'},...selected.supportedLocales.map(locale=>({value:locale,label:localeNames[locale]||locale,meta:locale}))],current==='auto'||selected.supportedLocales.includes(current)?current:'auto')};
const load=()=>{const pageUrl=new URL(location.href);pageUrl.searchParams.set('template',templatePicker.value);history.replaceState(null,'',pageUrl);frame.src='/theme?template='+encodeURIComponent(templatePicker.value)+'&lang='+encodeURIComponent(localePicker.value)+'&state='+encodeURIComponent(statePicker.value)+'&device='+encodeURIComponent(device)};
document.querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-size]').forEach(item=>item.dataset.active='false');button.dataset.active='true';device=button.dataset.device;const [width,height]=button.dataset.size.split(',');shell.style.width=width+'px';shell.style.height=height+'px';load()}));
document.addEventListener('pointerdown',event=>pickers.forEach(picker=>{if(!picker.root.contains(event.target))picker.close()}));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePickers()});
syncLocales();load();
</script></body></html>`;
}

function mockRuntime(template, locale, state, device, localizedCopy) {
  const runtimeConfig = {
    resolvedLocale: locale,
    defaultLocale: template.defaultLocale,
    supportedLocales: template.supportedLocales,
    localizedCopy,
    previewMode: true,
    previewDevice: device,
  };
  const configJson = JSON.stringify(runtimeConfig).replaceAll("<", "\\u003c");
  const localeJson = JSON.stringify(locale);
  const copyJson = JSON.stringify(localizedCopy).replaceAll("<", "\\u003c");
  const stateJson = JSON.stringify(state);
  return `<script id="promotion-runtime-config" type="application/json">${configJson}</script>
<script>
(()=>{const selected=${stateJson},locale=${localeJson},themeCopy=${copyJson};document.documentElement.lang=locale;document.documentElement.dir=['ar','fa','ur'].includes(locale)?'rtl':'ltr';document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-copy]').forEach(node=>{const key=node.getAttribute('data-copy');if(key&&themeCopy[key])node.textContent=themeCopy[key]}));const pairing={pairingCode:'ABCD-EFGH',attemptId:'preview-attempt',pairingStatus:selected==='input'?'code_issued':selected,expiresAt:new Date(Date.now()+300000).toISOString()};
const data=()=>{if(selected==='verified_syncing')return{pairingStatus:'verified',verified:true,initializationStatus:'syncing',nextPollAfterMs:60000};if(selected==='verified_ready')return{pairingStatus:'verified',verified:true,initializationStatus:'ready'};return{pairingStatus:selected==='input'?'waiting_phone':selected,verified:false,nextPollAfterMs:60000}};
window.PromotionBridge={version:'promotion-browser-bridge/v2',submitPhone:async()=>new Response(JSON.stringify({data:{pairing}}),{status:200,headers:{'Content-Type':'application/json'}}),getPairingStatus:async()=>new Response(JSON.stringify({data:data()}),{status:200,headers:{'Content-Type':'application/json'}}),cancelPairing:async()=>new Response('',{status:204})};
if(selected!=='input')window.addEventListener('load',()=>setTimeout(()=>{const field=document.querySelector('phone-number-field'),country=field?.shadowRoot?.querySelector('[data-country="US"]'),input=field?.shadowRoot?.querySelector('input[type="tel"]'),button=document.querySelector('account-link-submit')?.shadowRoot?.querySelector('button');if(country&&input&&button){country.click();input.value='2025550123';input.dispatchEvent(new Event('input',{bubbles:true}));button.click()}},50));})();
</script>`;
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
  if (url.pathname === "/theme") {
    const template = templateBySlug.get(url.searchParams.get("template")) || defaultTemplate;
    const requestedLocale = url.searchParams.get("lang");
    const locale = requestedLocale && requestedLocale !== "auto"
      ? safeSelection(requestedLocale, template.supportedLocales, template.defaultLocale)
      : resolveAutomaticLocale(
        request.headers["accept-language"],
        template.supportedLocales,
        template.defaultLocale,
      );
    const state = safeSelection(url.searchParams.get("state"), stateValues, "input");
    const device = safeSelection(
      url.searchParams.get("device"),
      ["desktop", "tablet", "mobile"],
      "mobile",
    );
    const localeFile = template.localePath.replace("{locale}", locale);
    const localizedCopy = JSON.parse(await readFile(resolve(template.root, localeFile), "utf8"));
    const html = await readFile(resolve(template.root, template.entry), "utf8");
    const base = `<base href="/theme-assets/${encodeURIComponent(template.slug)}/">`;
    const withBase = html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
    return send(
      response,
      200,
      withBase.replace(/<\/head>/i, `${mockRuntime(template, locale, state, device, localizedCopy)}</head>`),
      "text/html; charset=utf-8",
    );
  }
  if (url.pathname.startsWith("/theme-assets/")) {
    let relativePath;
    try {
      relativePath = decodeURIComponent(url.pathname.slice("/theme-assets/".length));
    } catch {
      return send(response, 404, "Not found");
    }
    const [slug, ...parts] = relativePath.split("/");
    const template = templateBySlug.get(slug);
    if (
      !template
      || parts.length === 0
      || parts.some((part) => !part || part === "." || part === ".." || part.startsWith("."))
    ) {
      return send(response, 404, "Not found");
    }
    const file = resolve(template.root, ...parts);
    if (!file.startsWith(`${template.root}${sep}`)) return send(response, 404, "Not found");
    return serveFile(response, file);
  }
  return send(response, 404, "Not found");
}).listen(port, "127.0.0.1", () => {
  console.log(`模板预览：http://127.0.0.1:${port}`);
});
