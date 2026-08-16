#!/usr/bin/env node

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
const ZIP_MTIME = new Date(2000, 0, 1, 0, 0, 0);
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".svg", ".txt"]);
const DISALLOWED_EXTENSIONS = new Set([".map", ".ts", ".tsx", ".jsx"]);
const REQUIRED_COMPONENTS = [
  "account-link-flow",
  "account-link-locale-switcher",
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
  if (/^readme(?:\.|$)/i.test(path)) return false;
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
  invariant(value === root || value.startsWith(`${root}${sep}`), `path escapes template root: ${path}`);
  return value;
}

async function readJson(path, label) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function schemaFilename(schema) {
  if (schema === "promotion-template/v2") return "promotion-template-v2.schema.json";
  if (schema === "promotion-template/v1") return "promotion-template-v1.schema.json";
  throw new Error(`unsupported template schema: ${String(schema || "missing")}`);
}

async function validateManifest(manifest) {
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

async function scanPublicText(files) {
  const errors = [];
  for (const file of files) {
    if (!TEXT_EXTENSIONS.has(extname(file.path).toLowerCase())) continue;
    const text = await readFile(file.absolute, "utf8");
    if (/parloq/i.test(text)) errors.push(`${file.path}: control-plane brand is not allowed in a public theme`);
    if (/(?:\/api\/|pairingStartUrl|statusToken|X-Parloq|Authorization\s*:|protocolId|gatewayAccountId)/i.test(text)) {
      errors.push(`${file.path}: direct platform or gateway integration is not allowed`);
    }
    if (/<(?:script|link)\b[^>]+(?:src|href)=["']https?:/i.test(text) || /url\(\s*["']?https?:/i.test(text)) {
      errors.push(`${file.path}: external scripts, styles, fonts, and CSS assets are not allowed`);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
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

async function validateComponentComposition(root, manifest) {
  if (manifest.requirements?.componentKit !== "account-link-elements/v1") return;
  const html = await readFile(resolveInside(root, manifest.entry), "utf8");
  const missing = REQUIRED_COMPONENTS.filter((tag) => !new RegExp(`<${tag}(?:\\s|>)`, "i").test(html));
  invariant(!missing.length, `standard component composition is incomplete: ${missing.join(", ")}`);
}

export async function validateTheme(themeDirectory) {
  const root = resolve(themeDirectory);
  const manifest = await readJson(resolve(root, "manifest.json"), "manifest.json");
  await validateManifest(manifest);
  const files = await walk(root);
  invariant(files.length <= MAX_FILES, `template contains ${files.length} files; maximum is ${MAX_FILES}`);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  invariant(totalBytes <= MAX_EXPANDED_BYTES, `expanded template exceeds ${MAX_EXPANDED_BYTES} bytes`);
  for (const file of files) {
    invariant(file.size <= MAX_FILE_BYTES, `${file.path} exceeds ${MAX_FILE_BYTES} bytes`);
    invariant(!DISALLOWED_EXTENSIONS.has(extname(file.path).toLowerCase()), `${file.path}: source files and source maps cannot be bundled`);
  }
  invariant(files.some((file) => file.path === "manifest.json"), "manifest.json is required");
  invariant(files.some((file) => file.path === manifest.entry), `${manifest.entry} is required`);
  const locales = await validateLocales(root, manifest);
  await validateComponentComposition(root, manifest);
  await scanPublicText(files);
  return { root, manifest, files, totalBytes, locales };
}

export async function buildTheme(themeDirectory, outputDirectory) {
  const source = await validateTheme(themeDirectory);
  const output = resolve(outputDirectory);
  invariant(output !== source.root, "build output must differ from the source directory");
  await rm(output, { recursive: true, force: true });
  for (const file of source.files) {
    const destination = resolveInside(output, file.path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(file.absolute, destination);
  }
  return validateTheme(output);
}

export async function packTheme(themeDirectory, outputFile) {
  const source = await validateTheme(themeDirectory);
  const entries = {};
  for (const file of source.files) {
    entries[file.path] = [new Uint8Array(await readFile(file.absolute)), { mtime: ZIP_MTIME }];
  }
  const archive = zipSync(entries, { level: 9 });
  invariant(archive.byteLength <= MAX_ZIP_BYTES, `template ZIP exceeds ${MAX_ZIP_BYTES} bytes`);
  const output = resolve(outputFile);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, archive);
  return { ...source, output, zipBytes: archive.byteLength };
}

function option(args, name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

async function main() {
  const [command, input, ...args] = process.argv.slice(2);
  if (!command || !input || !["validate", "build", "pack"].includes(command)) {
    console.error("Usage: promotion-template <validate|build|pack> <theme-directory> [--out path]");
    process.exitCode = 2;
    return;
  }
  if (command === "validate") {
    const result = await validateTheme(input);
    console.log(`valid ${result.manifest.schema} theme: ${result.files.length} files, ${result.locales.length} locales`);
    return;
  }
  if (command === "build") {
    const output = option(args, "--out", resolve("dist/themes", input.split(/[\\/]/).filter(Boolean).at(-1)));
    const result = await buildTheme(input, output);
    console.log(`built ${result.files.length} files at ${output}`);
    return;
  }
  const output = option(args, "--out", `${resolve(input)}.zip`);
  const result = await packTheme(input, output);
  console.log(`packed ${result.files.length} files (${result.zipBytes} bytes) at ${result.output}`);
}

if (process.argv[1] && resolve(process.argv[1]) === CLI_FILE) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
