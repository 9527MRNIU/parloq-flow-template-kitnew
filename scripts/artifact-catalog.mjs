import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

const SEQUENCE_PATTERN = /^\d{4}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,39})$/;
const HAN_PATTERN = /[\u3400-\u9fff]/u;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(path, label) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function resolveInside(root, path, label) {
  const value = resolve(root, path);
  invariant(value === root || value.startsWith(`${root}${sep}`), `${label} escapes repository root: ${path}`);
  return value;
}

export function numberedArtifactFilename(entry, version) {
  invariant(SEQUENCE_PATTERN.test(entry.sequence), `invalid artifact sequence: ${String(entry.sequence)}`);
  invariant(SLUG_PATTERN.test(entry.slug), `invalid artifact slug: ${String(entry.slug)}`);
  invariant(VERSION_PATTERN.test(version), `invalid artifact version: ${String(version)}`);
  return `${entry.sequence}-${entry.slug}-${version}.zip`;
}

export async function loadPublicArtifactCatalog(repositoryRoot) {
  const root = resolve(repositoryRoot);
  const catalog = await readJson(resolve(root, "artifacts/catalog.json"), "artifact catalog");
  invariant(catalog?.schemaVersion === 1, "artifact catalog schemaVersion must be 1");
  invariant(Array.isArray(catalog.artifacts) && catalog.artifacts.length > 0, "artifact catalog must contain artifacts");

  const nextSequenceByKind = {
    template: 1,
    integration: 1,
  };
  const seenKindSequences = new Set();
  const seenSlugs = new Set();
  const resolvedArtifacts = [];
  for (const entry of catalog.artifacts) {
    invariant(["template", "integration"].includes(entry.kind), `invalid artifact kind: ${String(entry.kind)}`);
    const expectedSequence = String(nextSequenceByKind[entry.kind]).padStart(4, "0");
    const kindSequence = `${entry.kind}:${entry.sequence}`;
    invariant(
      entry.sequence === expectedSequence,
      `${entry.kind} artifact sequence must be stable and contiguous: expected ${expectedSequence}`,
    );
    invariant(!seenKindSequences.has(kindSequence), `duplicate ${entry.kind} artifact sequence: ${entry.sequence}`);
    invariant(!seenSlugs.has(entry.slug), `duplicate artifact slug: ${entry.slug}`);
    const visibility = entry.visibility || "public";
    invariant(["public", "internal"].includes(visibility), `invalid artifact visibility: ${String(entry.visibility)}`);
    invariant(visibility !== "internal" || entry.kind === "integration", "only integration artifacts may be internal");
    invariant(
      entry.outputDirectory === (
        visibility === "internal"
          ? "internal-integrations"
          : entry.kind === "template" ? "themes" : "integrations"
      ),
      `artifact ${entry.sequence} output directory does not match its kind`,
    );
    const sourcePath = resolveInside(root, entry.source, "artifact source");
    const manifestPath = resolveInside(sourcePath, entry.manifest, "artifact manifest");
    const manifest = await readJson(manifestPath, `${entry.sequence} manifest`);
    invariant((manifest.visibility || "public") === visibility, `${entry.sequence} catalog and manifest visibility must match`);
    const version = String(manifest.version || "");
    invariant(VERSION_PATTERN.test(version), `${entry.sequence} manifest version is required and must be filename-safe`);
    invariant(typeof manifest.name === "string" && manifest.name.length >= 1 && manifest.name.length <= 120, `${entry.sequence} manifest name is required`);
    invariant(typeof manifest.description === "string" && manifest.description.length >= 1 && manifest.description.length <= 2000, `${entry.sequence} manifest description is required`);
    invariant(HAN_PATTERN.test(manifest.name), `${entry.sequence} manifest name must be natural Chinese`);
    invariant(HAN_PATTERN.test(manifest.description), `${entry.sequence} manifest description must be natural Chinese`);
    if (entry.kind === "integration") {
      invariant(manifest.integrationKey === entry.slug, `${entry.sequence} integrationKey must match catalog slug`);
    }
    seenKindSequences.add(kindSequence);
    seenSlugs.add(entry.slug);
    nextSequenceByKind[entry.kind] += 1;
    resolvedArtifacts.push({
      ...entry,
      version,
      name: manifest.name,
      description: manifest.description,
      integrationKey: manifest.integrationKey || null,
      filename: numberedArtifactFilename(entry, version),
      sourcePath,
      manifestPath,
    });
  }
  return resolvedArtifacts;
}
