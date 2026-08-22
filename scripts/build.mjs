import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import { buildTemplate, packIntegration, packTemplate } from "../packages/cli/src/index.mjs";
import { loadPublicArtifactCatalog } from "./artifact-catalog.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const rootPackage = await readJson(resolve(root, "package.json"));
const runtimePackage = await readJson(resolve(root, "packages/runtime/package.json"));
const componentsPackage = await readJson(resolve(root, "packages/components/package.json"));
const contractPackage = await readJson(resolve(root, "packages/contract/package.json"));
const publicArtifacts = await loadPublicArtifactCatalog(root);

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "runtime"), { recursive: true });
await mkdir(resolve(dist, "packages"), { recursive: true });
await mkdir(resolve(dist, "schemas"), { recursive: true });
await mkdir(resolve(dist, "themes"), { recursive: true });
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
  "promotion-template-v3.schema.json",
  "promotion-integration-v1.schema.json",
]) {
  await copyFile(
    resolve(root, "packages/contract/schemas", filename),
    resolve(dist, "schemas", filename),
  );
}

for (const artifact of publicArtifacts) {
  const output = resolve(dist, artifact.outputDirectory, artifact.filename);
  if (artifact.kind === "template") {
    const builtTemplate = resolve(dist, artifact.outputDirectory, artifact.slug);
    const manifest = await readJson(artifact.manifestPath);
    const generatedAssets = manifest.schema === "promotion-template/v3"
      ? [{
          source: resolve(dist, "runtime/account-link-elements.js"),
          path: manifest.components.entry,
        }]
      : [];
    await buildTemplate(artifact.sourcePath, builtTemplate, { generatedAssets });
    await packTemplate(builtTemplate, output);
  } else {
    await packIntegration(artifact.sourcePath, output);
  }
}

const artifactSpecs = [
  { path: "runtime/account-link-elements.js", kind: "runtime", sequence: null, version: runtimePackage.version },
  { path: "packages/account-link-components.js", kind: "components", sequence: null, version: componentsPackage.version },
  { path: "packages/promotion-contract.js", kind: "contract", sequence: null, version: contractPackage.version },
  { path: "packages/template-contract.js", kind: "contract-alias", sequence: null, version: contractPackage.version },
  { path: "schemas/promotion-template-v1.schema.json", kind: "schema", sequence: null, version: "1" },
  { path: "schemas/promotion-template-v2.schema.json", kind: "schema", sequence: null, version: "2" },
  { path: "schemas/promotion-template-v3.schema.json", kind: "schema", sequence: null, version: "3" },
  { path: "schemas/promotion-integration-v1.schema.json", kind: "schema", sequence: null, version: "1" },
  ...publicArtifacts.map((artifact) => ({
    path: `${artifact.outputDirectory}/${artifact.filename}`,
    kind: artifact.kind,
    sequence: artifact.sequence,
    slug: artifact.slug,
    version: artifact.version,
    name: artifact.name,
    description: artifact.description,
    ...(artifact.integrationKey ? { integrationKey: artifact.integrationKey } : {}),
  })),
];

const artifacts = [];
for (const spec of artifactSpecs) {
  const bytes = await readFile(resolve(dist, spec.path));
  artifacts.push({
    ...spec,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}
await writeFile(
  resolve(dist, "artifacts.json"),
  `${JSON.stringify({ schemaVersion: 1, version: rootPackage.version, artifacts }, null, 2)}\n`,
);

console.log(`built ${artifacts.length} versioned artifacts in ${dist}`);
