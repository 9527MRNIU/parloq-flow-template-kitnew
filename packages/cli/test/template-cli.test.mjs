import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { buildTheme, packTheme, validateTheme } from "../src/index.mjs";

const repoRoot = resolve(import.meta.dirname, "../../..");
const defaultTheme = resolve(repoRoot, "themes/white-label-account-link");
const minimalTemplate = resolve(repoRoot, "examples/promotion-template-minimal");

async function copiedTheme() {
  const root = await mkdtemp(resolve(tmpdir(), "promotion-template-test-"));
  const theme = resolve(root, "theme");
  await cp(defaultTheme, theme, { recursive: true });
  return { root, theme };
}

test("the default white-label theme satisfies the v2 contract", async () => {
  const result = await validateTheme(defaultTheme);
  assert.equal(result.manifest.schema, "promotion-template/v2");
  assert.equal(result.locales.length, 15);
  assert.equal(result.manifest.name, "白标账号关联模板");
  assert.match(result.manifest.description, /[\u3400-\u9fff]/u);
});

test("the minimal template example carries Chinese import metadata", async () => {
  const result = await validateTheme(minimalTemplate);
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
  await validateTheme(theme);
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
    await assert.rejects(validateTheme(theme), /manifest validation failed/);
  }
});

test("validation rejects control-plane branding in public copy", async () => {
  const { theme } = await copiedTheme();
  const index = resolve(theme, "index.html");
  await writeFile(index, `${await readFile(index, "utf8")}<p>Parloq</p>`);
  await assert.rejects(validateTheme(theme), /control-plane brand/);
});

test("validation rejects an incomplete bundled locale set", async () => {
  const { theme } = await copiedTheme();
  const manifestPath = resolve(theme, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.supportedLocales.push("ja");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await assert.rejects(validateTheme(theme), /locale ja is not valid JSON/);
});

test("build and pack create an importable ZIP without source documentation", async () => {
  const { root, theme } = await copiedTheme();
  await writeFile(resolve(theme, "README.md"), "author notes");
  const output = resolve(root, "built");
  const archive = resolve(root, "theme.zip");
  const secondArchive = resolve(root, "theme-second.zip");
  const built = await buildTheme(theme, output);
  const packed = await packTheme(output, archive);
  await packTheme(output, secondArchive);
  assert.equal(built.files.some((file) => file.path === "README.md"), false);
  assert.ok(packed.zipBytes > 0);
  assert.deepEqual([...new Uint8Array(await readFile(archive)).slice(0, 2)], [0x50, 0x4b]);
  assert.deepEqual(await readFile(archive), await readFile(secondArchive));
});
