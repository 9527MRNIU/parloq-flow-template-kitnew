import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = join(root, "examples/myloveday-demo");
const cssPath = join(templateDir, "assets/phone-flags/sprite-positions.css");
const indexPath = join(templateDir, "index.html");
const marker = "<!-- phone-flag-sprite -->";
const css = readFileSync(cssPath, "utf8");
const payload = JSON.stringify({
  sheet: "assets/phone-flags/sprite-positions.css",
  css,
});
const embed = `${marker}\n    <script type="application/json" id="phone-flag-sprite">${payload}</script>`;
let html = readFileSync(indexPath, "utf8");
if (html.includes(marker)) {
  html = html.replace(
    new RegExp(`${marker}[\\s\\S]*?(?=\\n\\s*<\\/head>|\\n\\s*<!-- phone-flag-sprite-end -->|$)`),
    embed,
  );
} else {
  throw new Error(`Missing ${marker} in ${indexPath}`);
}
writeFileSync(indexPath, html, "utf8");
console.log(`Embedded phone flag sprite CSS (${css.length} bytes) into ${indexPath}`);
