import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loadPublicArtifactCatalog } from "./artifact-catalog.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

const rootPackage = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const manifest = JSON.parse(await readFile(resolve(dist, "artifacts.json"), "utf8"));
const publicArtifacts = await loadPublicArtifactCatalog(root);

invariant(manifest.schemaVersion === 1, "dist/artifacts.json schemaVersion must be 1");
invariant(manifest.version === rootPackage.version, "dist/artifacts.json kit version does not match package.json");
invariant(Array.isArray(manifest.artifacts), "dist/artifacts.json artifacts must be an array");

for (const artifact of manifest.artifacts) {
  invariant(Object.hasOwn(artifact, "sequence"), `${artifact.path} is missing sequence`);
  invariant(typeof artifact.version === "string" && artifact.version, `${artifact.path} is missing version`);
  const bytes = await readFile(resolve(dist, artifact.path));
  invariant(bytes.byteLength === artifact.bytes, `${artifact.path} byte count does not match`);
  invariant(
    createHash("sha256").update(bytes).digest("hex") === artifact.sha256,
    `${artifact.path} SHA-256 does not match`,
  );
}

const expectedPublicPaths = publicArtifacts.map((artifact) => `${artifact.outputDirectory}/${artifact.filename}`);
const actualPublicPaths = [];
for (const directory of ["themes", "integrations"]) {
  for (const filename of (await readdir(resolve(dist, directory))).filter((value) => value.endsWith(".zip")).sort()) {
    actualPublicPaths.push(`${directory}/${filename}`);
  }
}
assertSameValues(actualPublicPaths, expectedPublicPaths, "public ZIP filenames");

for (const expected of publicArtifacts) {
  const path = `${expected.outputDirectory}/${expected.filename}`;
  const artifact = manifest.artifacts.find((value) => value.path === path);
  invariant(artifact, `${path} is missing from dist/artifacts.json`);
  invariant(artifact.sequence === expected.sequence, `${path} sequence does not match catalog`);
  invariant(artifact.version === expected.version, `${path} version does not match package manifest`);
  invariant(artifact.name === expected.name, `${path} name does not match package manifest`);
  invariant(artifact.description === expected.description, `${path} description does not match package manifest`);
  if (expected.kind === "integration") {
    invariant(artifact.integrationKey === expected.integrationKey, `${path} integrationKey does not match package manifest`);
  }
}

function assertSameValues(actual, expected, label) {
  const left = [...actual].sort();
  const right = [...expected].sort();
  invariant(JSON.stringify(left) === JSON.stringify(right), `${label} do not match catalog`);
}

console.log(`verified ${manifest.artifacts.length} artifacts and ${publicArtifacts.length} numbered ZIPs`);
