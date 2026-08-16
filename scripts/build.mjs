import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import { buildTheme, packTheme } from "../packages/cli/src/index.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "runtime"), { recursive: true });
await mkdir(resolve(dist, "packages"), { recursive: true });
await mkdir(resolve(dist, "schemas"), { recursive: true });

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
  outfile: resolve(dist, "packages/template-contract.js"),
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: false,
});

for (const version of ["v1", "v2"]) {
  await copyFile(
    resolve(root, `packages/contract/schemas/promotion-template-${version}.schema.json`),
    resolve(dist, `schemas/promotion-template-${version}.schema.json`),
  );
}

const themeSource = resolve(root, "themes/white-label-account-link");
const themeOutput = resolve(dist, "themes/white-label-account-link");
const themeZip = resolve(dist, "themes/white-label-account-link.zip");
await buildTheme(themeSource, themeOutput);
await packTheme(themeOutput, themeZip);

const artifactPaths = [
  "runtime/account-link-elements.js",
  "packages/account-link-components.js",
  "packages/template-contract.js",
  "schemas/promotion-template-v1.schema.json",
  "schemas/promotion-template-v2.schema.json",
  "themes/white-label-account-link.zip",
];
const artifacts = [];
for (const path of artifactPaths) {
  const bytes = await readFile(resolve(dist, path));
  artifacts.push({ path, bytes: bytes.byteLength, sha256: createHash("sha256").update(bytes).digest("hex") });
}
await writeFile(resolve(dist, "artifacts.json"), `${JSON.stringify({ version: "0.1.0", artifacts }, null, 2)}\n`);

console.log(`built ${artifacts.length} versioned artifacts in ${dist}`);
