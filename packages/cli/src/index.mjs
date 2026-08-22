#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, rm, copyFile, lstat, readdir } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { zipSync } from "fflate";

const CLI_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(CLI_FILE), "../../..");
const MAX_ZIP_BYTES = 20 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 50 * 1024 * 1024;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 500;
const MAX_INTEGRATION_MANIFEST_BYTES = 64 * 1024;
const ZIP_MTIME = new Date(2000, 0, 1, 0, 0, 0);
const TEXT_EXTENSIONS = new Set([".css", ".html", ".htm", ".js", ".mjs", ".json", ".svg", ".txt"]);
const TEMPLATE_DISALLOWED_EXTENSIONS = new Set([".map", ".ts", ".tsx", ".jsx"]);
const INTEGRATION_ALLOWED_EXTENSIONS = new Set([
  ".html", ".htm", ".css", ".js", ".mjs", ".json", ".png", ".jpg", ".jpeg",
  ".gif", ".webp", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".txt", ".wasm", ".enc",
]);
const SCRIPT_EXTENSIONS = new Set([".js", ".mjs"]);
const HTML_EXTENSIONS = new Set([".html", ".htm"]);
const FEEDBACK_EVENT_PATTERN = /^[a-z][a-z0-9_.-]{0,63}$/;
const BUILTIN_FEEDBACK_EVENTS = new Set(["page_view", "visit_end"]);
const REQUIRED_COMPONENTS = [
  "account-link-flow",
  "phone-number-field",
  "account-link-submit",
  "pairing-code-panel",
  "app-launch-actions",
  "account-link-status",
  "account-initialization-status",
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function isPublicSourceFile(path) {
  const segments = path.split("/");
  if (segments.some((segment) => segment.startsWith("."))) return false;
  if (/^readme(?:\.|$)/i.test(segments.at(-1) || "")) return false;
  return true;
}

async function walk(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = resolve(current, entry.name);
    const path = relative(root, absolute).split(sep).join("/");
    if (entry.isSymbolicLink()) throw new Error(`symbolic links are not allowed: ${path}`);
    if (entry.isDirectory()) files.push(...await walk(root, absolute));
    if (entry.isFile() && isPublicSourceFile(path)) {
      const stats = await lstat(absolute);
      files.push({ absolute, path, size: stats.size });
    }
  }
  return files;
}

function resolveInside(root, path) {
  const value = resolve(root, path);
  invariant(value === root || value.startsWith(`${root}${sep}`), `path escapes bundle root: ${path}`);
  return value;
}

async function readJson(path, label) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function validateBundleLimits(files, label) {
  invariant(files.length > 0, `${label} cannot be empty`);
  invariant(files.length <= MAX_FILES, `${label} contains ${files.length} files; maximum is ${MAX_FILES}`);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  invariant(totalBytes <= MAX_EXPANDED_BYTES, `${label} exceeds ${MAX_EXPANDED_BYTES} expanded bytes`);
  for (const file of files) invariant(file.size <= MAX_FILE_BYTES, `${file.path} exceeds ${MAX_FILE_BYTES} bytes`);
  return totalBytes;
}

async function scanControlPlaneLeaks(files, label) {
  const errors = [];
  for (const file of files) {
    if (!TEXT_EXTENSIONS.has(extname(file.path).toLowerCase())) continue;
    const text = await readFile(file.absolute, "utf8");
    if (/parloq/i.test(text)) errors.push(`${file.path}: control-plane brand is not allowed in a public ${label}`);
    if (/(?:\/api\/|pairingStartUrl|statusToken|X-Parloq|Authorization\s*:|protocolId|gatewayAccountId)/i.test(text)) {
      errors.push(`${file.path}: direct platform or gateway integration is not allowed`);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
}

function schemaFilename(schema) {
  if (schema === "promotion-template/v3") return "promotion-template-v3.schema.json";
  if (schema === "promotion-template/v2") return "promotion-template-v2.schema.json";
  if (schema === "promotion-template/v1") return "promotion-template-v1.schema.json";
  throw new Error(`unsupported template schema: ${String(schema || "missing")}`);
}

async function validateTemplateManifest(manifest) {
  const schemaPath = resolve(REPO_ROOT, "packages/contract/schemas", schemaFilename(manifest.schema));
  const schema = await readJson(schemaPath, "template schema");
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  if (!validate(manifest)) {
    const details = (validate.errors || [])
      .map((error) => `${error.instancePath || "/"} ${error.message || "is invalid"}`)
      .join("; ");
    throw new Error(`manifest validation failed: ${details}`);
  }
}

async function validateLocales(root, manifest) {
  const locales = manifest.supportedLocales || [];
  invariant(locales.includes(manifest.defaultLocale), "defaultLocale must be included in supportedLocales");
  invariant(locales.includes(manifest.i18n?.fallbackLocale), "fallbackLocale must be included in supportedLocales");
  if (manifest.i18n?.mode !== "bundled") return locales;
  for (const locale of locales) {
    const localePath = String(manifest.i18n.path || "").replace("{locale}", locale);
    invariant(localePath.includes(locale), `locale path does not resolve locale ${locale}`);
    const value = await readJson(resolveInside(root, localePath), `locale ${locale}`);
    invariant(value && typeof value === "object" && !Array.isArray(value), `locale ${locale} must contain an object`);
  }
  return locales;
}

async function validateComponentComposition(root, manifest, files, options = {}) {
  const componentContract = manifest.schema === "promotion-template/v3"
    ? manifest.components?.contract
    : manifest.requirements?.componentKit;
  if (componentContract !== "account-link-elements/v1") return;
  const html = await readFile(resolveInside(root, manifest.entry), "utf8");
  const missing = REQUIRED_COMPONENTS.filter((tag) => !new RegExp(`<${tag}(?:\\s|>)`, "i").test(html));
  invariant(!missing.length, `standard component composition is incomplete: ${missing.join(", ")}`);
  if (manifest.schema !== "promotion-template/v3") return;
  const componentEntry = normalizeBundlePath(manifest.components?.entry, "components.entry");
  invariant(
    new RegExp(`<script\\b[^>]+src=["']${componentEntry.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`, "i").test(html),
    `index.html must load bundled component entry: ${componentEntry}`,
  );
  invariant(
    files.some((file) => file.path === componentEntry) || options.allowGeneratedComponents === true,
    `bundled component entry does not exist: ${componentEntry}`,
  );
}

export async function validateTemplate(templateDirectory, options = {}) {
  const root = resolve(templateDirectory);
  const manifest = await readJson(resolve(root, "manifest.json"), "manifest.json");
  await validateTemplateManifest(manifest);
  const files = await walk(root);
  const totalBytes = validateBundleLimits(files, "template");
  for (const file of files) {
    invariant(!TEMPLATE_DISALLOWED_EXTENSIONS.has(extname(file.path).toLowerCase()), `${file.path}: source files and source maps cannot be bundled`);
  }
  invariant(files.some((file) => file.path === "manifest.json"), "manifest.json is required");
  invariant(files.some((file) => file.path === manifest.entry), `${manifest.entry} is required`);
  const locales = await validateLocales(root, manifest);
  await validateComponentComposition(root, manifest, files, options);
  await scanControlPlaneLeaks(files, "template");
  for (const file of files) {
    if (!TEXT_EXTENSIONS.has(extname(file.path).toLowerCase())) continue;
    const text = await readFile(file.absolute, "utf8");
    invariant(
      !(/<(?:script|link)\b[^>]+(?:src|href)=["']https?:/i.test(text) || /url\(\s*["']?https?:/i.test(text)),
      `${file.path}: external scripts, styles, fonts, and CSS assets are not allowed`,
    );
  }
  return { kind: "template", root, manifest, files, totalBytes, locales };
}

function normalizeBundlePath(value, label = "integration entry") {
  invariant(typeof value === "string" && value.trim(), `${label} path is required`);
  const path = value.trim().replaceAll("\\", "/");
  invariant(!path.startsWith("/") && !/[\u0000-\u001f]/.test(path), `${label} contains an unsafe path`);
  const segments = path.split("/");
  invariant(!segments.includes(".."), `${label} contains an unsafe path`);
  const normalized = segments.filter((segment) => segment && segment !== ".").join("/");
  invariant(normalized, `${label} path is required`);
  return normalized;
}

function inferredEntrypoints(files, requestedType) {
  const htmlPaths = files.filter((file) => HTML_EXTENSIONS.has(extname(file.path).toLowerCase())).map((file) => file.path).sort();
  const indexPaths = htmlPaths.filter((path) => path === "index.html" || path.endsWith("/index.html"));
  const scriptPaths = files.filter((file) => SCRIPT_EXTENSIONS.has(extname(file.path).toLowerCase())).map((file) => file.path).sort();
  if (requestedType === "iframe" && !htmlPaths.length) {
    invariant(scriptPaths.length > 0, "iframe integration has no recognizable HTML or JavaScript entry");
    return {
      type: "iframe",
      entries: scriptPaths.map((path) => ({
        path,
        scriptType: extname(path).toLowerCase() === ".mjs" ? "module" : "classic",
      })),
    };
  }
  if (requestedType === "iframe" || (!requestedType && htmlPaths.length)) {
    const candidates = indexPaths.length ? indexPaths : htmlPaths;
    invariant(candidates.length === 1, "iframe integration has multiple possible entries; specify entry in integration.json");
    return { type: "iframe", entries: [{ path: candidates[0], scriptType: "classic" }] };
  }
  invariant(!requestedType || requestedType === "script", "integration type must be script or iframe");
  invariant(scriptPaths.length > 0, "integration has no recognizable HTML or JavaScript entry");
  return {
    type: "script",
    entries: scriptPaths.map((path) => ({
      path,
      scriptType: extname(path).toLowerCase() === ".mjs" ? "module" : "classic",
    })),
  };
}

function configuredEntrypoints(manifest, files, type) {
  let configured = manifest.entries;
  if (configured === undefined && manifest.entry !== undefined) configured = [manifest.entry];
  if (configured === undefined) return inferredEntrypoints(files, type).entries;
  invariant(Array.isArray(configured) && configured.length > 0, "integration entries must be a non-empty array");
  const paths = new Set(files.map((file) => file.path));
  const seen = new Set();
  return configured.map((value) => {
    invariant(typeof value === "string" || (value && typeof value === "object" && !Array.isArray(value)), "integration entry format is invalid");
    const path = normalizeBundlePath(typeof value === "string" ? value : value.path);
    invariant(!seen.has(path), `integration entry is duplicated: ${path}`);
    invariant(path !== "integration.json" && paths.has(path), `integration entry does not exist: ${path}`);
    const suffix = extname(path).toLowerCase();
    let scriptType = "classic";
    if (type === "iframe") {
      invariant(
        HTML_EXTENSIONS.has(suffix) || SCRIPT_EXTENSIONS.has(suffix),
        "iframe integration entry must be HTML, JS, or MJS",
      );
      if (SCRIPT_EXTENSIONS.has(suffix)) {
        scriptType = (typeof value === "object" && value.scriptType) || (suffix === ".mjs" ? "module" : "classic");
        invariant(["classic", "module"].includes(scriptType), "scriptType must be classic or module");
      }
    } else {
      invariant(SCRIPT_EXTENSIONS.has(suffix), "script integration entry must be .js or .mjs");
      scriptType = (typeof value === "object" && value.scriptType) || (suffix === ".mjs" ? "module" : "classic");
      invariant(["classic", "module"].includes(scriptType), "scriptType must be classic or module");
    }
    seen.add(path);
    return { path, scriptType };
  });
}

async function validateIntegrationManifest(manifest) {
  const schema = await readJson(resolve(REPO_ROOT, "packages/contract/schemas/promotion-integration-v1.schema.json"), "integration schema");
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  if (!validate(manifest)) {
    const details = (validate.errors || [])
      .map((error) => `${error.instancePath || "/"} ${error.message || "is invalid"}`)
      .join("; ");
    throw new Error(`integration.json validation failed: ${details}`);
  }
}

export async function validateIntegration(integrationDirectory) {
  const root = resolve(integrationDirectory);
  const files = await walk(root);
  const totalBytes = validateBundleLimits(files, "integration");
  for (const file of files) {
    invariant(INTEGRATION_ALLOWED_EXTENSIONS.has(extname(file.path).toLowerCase()), `integration file type is not allowed: ${file.path}`);
  }
  const manifestFile = files.find((file) => file.path === "integration.json");
  invariant(!manifestFile || manifestFile.size <= MAX_INTEGRATION_MANIFEST_BYTES, "integration.json exceeds 64KB");
  const manifest = manifestFile ? await readJson(manifestFile.absolute, "integration.json") : {};
  invariant(manifest && typeof manifest === "object" && !Array.isArray(manifest), "integration.json must contain an object");
  await validateIntegrationManifest(manifest);
  const requestedType = String(manifest.type || "").trim().toLowerCase() || undefined;
  invariant(!requestedType || ["script", "iframe"].includes(requestedType), "integration type must be script or iframe");
  const inferred = requestedType ? { type: requestedType } : inferredEntrypoints(files);
  const type = inferred.type;
  const entries = configuredEntrypoints(manifest, files, type);
  if (type === "iframe") {
    const entryKinds = new Set(entries.map((entry) => (
      HTML_EXTENSIONS.has(extname(entry.path).toLowerCase()) ? "html" : "script"
    )));
    invariant(entryKinds.size === 1, "iframe integration entries cannot mix HTML and JavaScript");
    invariant(!entryKinds.has("html") || entries.length === 1, "iframe integration must have exactly one HTML entry");
  }
  if (manifest.feedback !== undefined) {
    invariant(type === "iframe", "only iframe integrations support independent feedback");
    for (const event of manifest.feedback.events || []) {
      invariant(FEEDBACK_EVENT_PATTERN.test(event), `integration feedback event name is invalid: ${event}`);
    }
    if (
      manifest.feedback.enabled !== false
      && HTML_EXTENSIONS.has(extname(entries[0].path).toLowerCase())
    ) {
      const entryFile = files.find((file) => file.path === entries[0].path);
      try {
        new TextDecoder("utf-8", { fatal: true }).decode(await readFile(entryFile.absolute));
      } catch {
        throw new Error("feedback-enabled iframe entry must be UTF-8 HTML");
      }
    }
  }
  if (manifest.visibility !== "internal") {
    await scanControlPlaneLeaks(files.filter((file) => file.path !== "integration.json"), "integration");
  }
  const customEvents = (manifest.feedback?.events || []).filter((event) => !BUILTIN_FEEDBACK_EVENTS.has(event));
  const feedbackEnabled = manifest.feedback !== undefined && manifest.feedback.enabled !== false;
  return {
    kind: "integration",
    root,
    manifest,
    type,
    entries,
    files,
    assets: files.filter((file) => file.path !== "integration.json"),
    totalBytes,
    version: manifest.version || null,
    feedback: manifest.feedback === undefined
      ? null
      : { enabled: feedbackEnabled, events: feedbackEnabled ? [...BUILTIN_FEEDBACK_EVENTS, ...new Set(customEvents)] : [] },
  };
}

async function copyBundle(source, outputDirectory, validator, generatedAssets = []) {
  const output = resolve(outputDirectory);
  invariant(output !== source.root, "build output must differ from the source directory");
  await rm(output, { recursive: true, force: true });
  for (const file of source.files) {
    const destination = resolveInside(output, file.path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(file.absolute, destination);
  }
  for (const asset of generatedAssets) {
    const path = normalizeBundlePath(asset.path, "generated asset");
    const destination = resolveInside(output, path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(resolve(asset.source), destination);
  }
  return validator(output);
}

function archiveFiles(files) {
  return Promise.all(files.map(async (file) => [
    file.path,
    [new Uint8Array(await readFile(file.absolute)), { mtime: ZIP_MTIME }],
  ])).then((entries) => zipSync(Object.fromEntries(entries), { level: 9 }));
}

async function writeArchive(source, outputFile) {
  const archive = await archiveFiles(source.files);
  invariant(archive.byteLength <= MAX_ZIP_BYTES, `${source.kind} ZIP exceeds ${MAX_ZIP_BYTES} bytes`);
  const output = resolve(outputFile);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, archive);
  return {
    ...source,
    output,
    zipBytes: archive.byteLength,
    sha256: createHash("sha256").update(archive).digest("hex"),
  };
}

export async function buildTemplate(templateDirectory, outputDirectory, options = {}) {
  const generatedAssets = options.generatedAssets || [];
  const source = await validateTemplate(templateDirectory, {
    allowGeneratedComponents: generatedAssets.length > 0,
  });
  return copyBundle(source, outputDirectory, validateTemplate, generatedAssets);
}

export async function packTemplate(templateDirectory, outputFile) {
  return writeArchive(await validateTemplate(templateDirectory), outputFile);
}

export async function packIntegration(integrationDirectory, outputFile) {
  const result = await writeArchive(await validateIntegration(integrationDirectory), outputFile);
  return { ...result, resolvedVersion: result.version || result.sha256.slice(0, 12) };
}

export const validateTheme = validateTemplate;
export const buildTheme = buildTemplate;
export const packTheme = packTemplate;

function option(args, name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function baseName(path) {
  return path.split(/[\\/]/).filter(Boolean).at(-1);
}

async function main() {
  const argv = process.argv.slice(2);
  const explicitKind = ["template", "integration"].includes(argv[0]);
  const kind = explicitKind ? argv.shift() : "template";
  const [command, input, ...args] = argv;
  const commands = kind === "integration" ? ["validate", "pack"] : ["validate", "build", "pack"];
  if (!command || !input || !commands.includes(command)) {
    console.error("Usage: promotion-kit <template|integration> <validate|build|pack> <directory> [--out path]");
    console.error("Legacy template form remains supported: promotion-kit <validate|build|pack> <directory> [--out path]");
    process.exitCode = 2;
    return;
  }
  if (kind === "integration") {
    if (command === "validate") {
      const result = await validateIntegration(input);
      console.log(`valid ${result.type} integration: ${result.assets.length} assets, ${result.entries.length} entries`);
      return;
    }
    const output = option(args, "--out", resolve("dist/integrations", `${baseName(input)}.zip`));
    const result = await packIntegration(input, output);
    console.log(`packed ${result.assets.length} integration assets (${result.zipBytes} bytes) at ${result.output}`);
    return;
  }
    if (command === "validate") {
      const result = await validateTemplate(input);
    console.log(`valid ${result.manifest.schema} template: ${result.files.length} files, ${result.locales.length} locales`);
    return;
  }
  if (command === "build") {
    const output = option(args, "--out", resolve("dist/themes", baseName(input)));
    const result = await buildTemplate(input, output);
    console.log(`built ${result.files.length} files at ${output}`);
    return;
  }
  const output = option(args, "--out", `${resolve(input)}.zip`);
  const result = await packTemplate(input, output);
  console.log(`packed ${result.files.length} files (${result.zipBytes} bytes) at ${result.output}`);
}

if (process.argv[1] && resolve(process.argv[1]) === CLI_FILE) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
