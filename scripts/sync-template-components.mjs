import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { loadPublicArtifactCatalog } from "./artifact-catalog.mjs";

const root = resolve(import.meta.dirname, "..");

async function compiledRuntime() {
  const result = await build({
    entryPoints: [resolve(root, "packages/runtime/src/account-link-elements.ts")],
    bundle: true,
    format: "iife",
    target: "es2020",
    minify: true,
    legalComments: "none",
    write: false,
  });
  return result.outputFiles[0].contents;
}

async function componentTargets() {
  const catalog = await loadPublicArtifactCatalog(root);
  const templateSources = catalog
    .filter((artifact) => artifact.kind === "template")
    .map((artifact) => artifact.sourcePath);
  templateSources.push(resolve(root, "examples/promotion-template-minimal"));
  const targets = [];
  for (const source of new Set(templateSources)) {
    const manifest = JSON.parse(await readFile(resolve(source, "manifest.json"), "utf8"));
    if (manifest.schema !== "promotion-template/v3") continue;
    targets.push(resolve(source, manifest.components.entry));
  }
  return targets;
}

export async function syncTemplateComponents({ check = false } = {}) {
  const runtime = await compiledRuntime();
  const targets = await componentTargets();
  const stale = [];
  for (const target of targets) {
    let current;
    try {
      current = await readFile(target);
    } catch {
      current = null;
    }
    if (current && Buffer.compare(current, runtime) === 0) continue;
    if (check) {
      stale.push(target);
      continue;
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, runtime);
  }
  if (stale.length) {
    throw new Error(`template component bundles are missing or stale:\n${stale.join("\n")}\nRun npm run sync:components.`);
  }
  return targets;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  syncTemplateComponents({ check })
    .then((targets) => console.log(`${check ? "verified" : "synchronized"} ${targets.length} template component bundles`))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
