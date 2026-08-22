import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { build as bundle } from "esbuild";
import { buildTheme, packTheme, validateTheme } from "../src/index.mjs";

const repoRoot = resolve(import.meta.dirname, "../../..");
const defaultTheme = resolve(repoRoot, "themes/white-label-account-link");
const minimalTemplate = resolve(repoRoot, "examples/promotion-template-minimal");
const runtimeEntry = resolve(repoRoot, "packages/runtime/src/account-link-elements.ts");
const validateSourceTheme = (path) => validateTheme(path);

async function copiedTheme() {
  const root = await mkdtemp(resolve(tmpdir(), "promotion-template-test-"));
  const theme = resolve(root, "theme");
  await cp(defaultTheme, theme, { recursive: true });
  return { root, theme };
}

test("the default white-label theme satisfies the self-contained v3 contract", async () => {
  const result = await validateSourceTheme(defaultTheme);
  assert.equal(result.manifest.schema, "promotion-template/v3");
  assert.equal(result.manifest.components.entry, "assets/account-link-elements.js");
  assert.equal(result.locales.length, 15);
  assert.equal(result.manifest.name, "白标账号关联模板");
  assert.match(result.manifest.description, /[\u3400-\u9fff]/u);
});

test("the minimal template example carries Chinese import metadata", async () => {
  const result = await validateSourceTheme(minimalTemplate);
  assert.equal(result.manifest.name, "最小推广模板示例");
  assert.match(result.manifest.description, /[\u3400-\u9fff]/u);
});

test("template import metadata remains optional in the public contract", async () => {
  const { theme } = await copiedTheme();
  const manifestPath = resolve(theme, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  delete manifest.name;
  delete manifest.description;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await validateSourceTheme(theme);
});

test("template import metadata respects its length limits", async () => {
  for (const metadata of [
    { name: "" },
    { name: "名".repeat(121) },
    { description: "说".repeat(2001) },
  ]) {
    const { theme } = await copiedTheme();
    const manifestPath = resolve(theme, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    Object.assign(manifest, metadata);
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await assert.rejects(validateSourceTheme(theme), /manifest validation failed/);
  }
});

test("validation rejects control-plane branding in public copy", async () => {
  const { theme } = await copiedTheme();
  const index = resolve(theme, "index.html");
  await writeFile(index, `${await readFile(index, "utf8")}<p>Parloq</p>`);
  await assert.rejects(validateSourceTheme(theme), /control-plane brand/);
});

test("validation rejects an incomplete bundled locale set", async () => {
  const { theme } = await copiedTheme();
  const manifestPath = resolve(theme, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.supportedLocales.push("ja");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await assert.rejects(validateSourceTheme(theme), /locale ja is not valid JSON/);
});

test("build and pack create an importable ZIP without source documentation", async () => {
  const { root, theme } = await copiedTheme();
  await writeFile(resolve(theme, "README.md"), "author notes");
  const output = resolve(root, "built");
  const runtime = resolve(root, "account-link-elements.js");
  const archive = resolve(root, "theme.zip");
  const secondArchive = resolve(root, "theme-second.zip");
  await bundle({
    entryPoints: [runtimeEntry],
    outfile: runtime,
    bundle: true,
    format: "iife",
    target: "es2020",
    minify: true,
    legalComments: "none",
  });
  const built = await buildTheme(theme, output, {
    generatedAssets: [{ source: runtime, path: "assets/account-link-elements.js" }],
  });
  const packed = await packTheme(output, archive);
  await packTheme(output, secondArchive);
  assert.equal(built.files.some((file) => file.path === "README.md"), false);
  assert.equal(built.files.some((file) => file.path === "assets/account-link-elements.js"), true);
  assert.match(await readFile(resolve(output, "index.html"), "utf8"), /assets\/account-link-elements\.js/);
  assert.ok(packed.zipBytes > 0);
  assert.deepEqual([...new Uint8Array(await readFile(archive)).slice(0, 2)], [0x50, 0x4b]);
  assert.deepEqual(await readFile(archive), await readFile(secondArchive));
});

test("packing rejects a v3 source tree before its component bundle is generated", async () => {
  const { root, theme } = await copiedTheme();
  await rm(resolve(theme, "assets/account-link-elements.js"));
  await assert.rejects(
    packTheme(theme, resolve(root, "invalid.zip")),
    /bundled component entry does not exist/,
  );
});
