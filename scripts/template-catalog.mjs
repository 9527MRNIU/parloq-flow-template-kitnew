import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

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
  invariant(typeof path === "string" && path.length > 0, `${label} is required`);
  const value = resolve(root, path);
  invariant(value === root || value.startsWith(`${root}${sep}`), `${label} escapes its source directory: ${path}`);
  return value;
}

export async function loadTemplateCatalog(repositoryRoot) {
  const root = resolve(repositoryRoot);
  const catalog = await readJson(resolve(root, "artifacts/catalog.json"), "source catalog");
  invariant(catalog?.schemaVersion === 1, "source catalog schemaVersion must be 1");
  invariant(Array.isArray(catalog.artifacts), "source catalog must contain entries");

  // Integrations are imported by the platform. Template tools must not open
  // their manifests or apply legacy integration validation to them.
  const entries = catalog.artifacts.filter((entry) => entry?.kind === "template");
  invariant(entries.length > 0, "source catalog must contain templates");
  const seenSlugs = new Set();
  const templates = [];
  for (const [index, entry] of entries.entries()) {
    const expectedSequence = String(index + 1).padStart(4, "0");
    invariant(entry.sequence === expectedSequence, `template sequence must be stable and contiguous: expected ${expectedSequence}`);
    invariant(typeof entry.slug === "string" && SLUG_PATTERN.test(entry.slug), `invalid template slug: ${String(entry.slug)}`);
    invariant(!seenSlugs.has(entry.slug), `duplicate template slug: ${entry.slug}`);
    const sourcePath = resolveInside(root, entry.source, "template source");
    const manifestPath = resolveInside(sourcePath, entry.manifest, "template manifest");
    const manifest = await readJson(manifestPath, `${entry.sequence} template manifest`);
    const version = String(manifest.version || "");
    invariant(VERSION_PATTERN.test(version), `${entry.sequence} template version is required and must be valid`);
    invariant(typeof manifest.name === "string" && manifest.name.length >= 1 && manifest.name.length <= 120, `${entry.sequence} template name is required`);
    invariant(typeof manifest.description === "string" && manifest.description.length >= 1 && manifest.description.length <= 2000, `${entry.sequence} template description is required`);
    invariant(HAN_PATTERN.test(manifest.name), `${entry.sequence} template name must be natural Chinese`);
    invariant(HAN_PATTERN.test(manifest.description), `${entry.sequence} template description must be natural Chinese`);
    seenSlugs.add(entry.slug);
    templates.push({
      ...entry,
      version,
      name: manifest.name,
      description: manifest.description,
      sourcePath,
      manifestPath,
    });
  }
  return templates;
}
