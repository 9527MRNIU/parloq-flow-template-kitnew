import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import { buildTemplate, packIntegration, packTemplate } from "../packages/cli/src/index.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "runtime"), { recursive: true });
await mkdir(resolve(dist, "packages"), { recursive: true });
await mkdir(resolve(dist, "schemas"), { recursive: true });
await mkdir(resolve(dist, "integrations"), { recursive: true });

await build({
  entryPoints: [resolve(root, "packages/runtime/src/account-link-elements.ts")],
  outfile: resolve(dist, "runtime/account-link-elements.js"),
  bundle: true,
  format: "iife",
  target: "es2020",
  minify: true,
  legalComments: "none",
});

await build({
  entryPoints: [resolve(root, "packages/components/src/index.ts")],
  outfile: resolve(dist, "packages/account-link-components.js"),
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: false,
});

await build({
  entryPoints: [resolve(root, "packages/contract/src/index.ts")],
  outfile: resolve(dist, "packages/promotion-contract.js"),
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: false,
});
await copyFile(
  resolve(dist, "packages/promotion-contract.js"),
  resolve(dist, "packages/template-contract.js"),
);

for (const filename of [
  "promotion-template-v1.schema.json",
  "promotion-template-v2.schema.json",
  "promotion-integration-v1.schema.json",
]) {
  await copyFile(
    resolve(root, "packages/contract/schemas", filename),
    resolve(dist, "schemas", filename),
  );
}

const themeSource = resolve(root, "themes/white-label-account-link");
const themeOutput = resolve(dist, "themes/white-label-account-link");
const themeZip = resolve(dist, "themes/white-label-account-link.zip");
await buildTemplate(themeSource, themeOutput);
await packTemplate(themeOutput, themeZip);

const integrationNames = [
  "promotion-integration-script-demo",
  "promotion-integration-feedback-demo",
];
for (const name of integrationNames) {
  await packIntegration(
    resolve(root, "examples", name),
    resolve(dist, "integrations", `${name}.zip`),
  );
}

const artifactPaths = [
  "runtime/account-link-elements.js",
  "packages/account-link-components.js",
  "packages/promotion-contract.js",
  "packages/template-contract.js",
  "schemas/promotion-template-v1.schema.json",
  "schemas/promotion-template-v2.schema.json",
  "schemas/promotion-integration-v1.schema.json",
  "themes/white-label-account-link.zip",
  ...integrationNames.map((name) => `integrations/${name}.zip`),
];
const artifacts = [];
for (const path of artifactPaths) {
  const bytes = await readFile(resolve(dist, path));
  artifacts.push({ path, bytes: bytes.byteLength, sha256: createHash("sha256").update(bytes).digest("hex") });
}
await writeFile(resolve(dist, "artifacts.json"), `${JSON.stringify({ version: "0.1.0", artifacts }, null, 2)}\n`);

console.log(`built ${artifacts.length} versioned artifacts in ${dist}`);
