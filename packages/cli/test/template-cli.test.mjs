import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { validateTheme } from "../src/index.mjs";

const repoRoot = resolve(import.meta.dirname, "../../..");
const defaultTheme = resolve(repoRoot, "themes/white-label-account-link");
const minimalTemplate = resolve(repoRoot, "themes/promotion-template-minimal");
const mylovedayTemplate = resolve(repoRoot, "themes/myloveday-demo");
const shortTaglineTemplate = resolve(repoRoot, "themes/short-tagline-demo");
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

test("the numbered campaign templates satisfy the self-contained v3 contract", async () => {
  const myloveday = await validateSourceTheme(mylovedayTemplate);
  const shortTagline = await validateSourceTheme(shortTaglineTemplate);
  assert.equal(myloveday.manifest.version, "2.0.7");
  assert.equal(shortTagline.manifest.version, "1.3.4");
  assert.equal(myloveday.locales.length, 15);
  assert.equal(shortTagline.locales.length, 15);
  assert.match(myloveday.manifest.name, /[\u3400-\u9fff]/u);
  assert.match(shortTagline.manifest.name, /[\u3400-\u9fff]/u);
  assert.ok(shortTagline.files.some((file) => file.path === "assets/images/poster.mp4"));
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

test("template validation includes runtime assets and excludes author documentation", async () => {
  const { theme } = await copiedTheme();
  await writeFile(resolve(theme, "README.md"), "author notes");
  const result = await validateTheme(theme);
  assert.equal(result.files.some((file) => file.path === "README.md"), false);
  assert.equal(result.files.some((file) => file.path === "assets/account-link-elements.js"), true);
  assert.match(await readFile(resolve(theme, "index.html"), "utf8"), /assets\/account-link-elements\.js/);
});

test("validation rejects a v3 source tree before its component bundle is generated", async () => {
  const { theme } = await copiedTheme();
  await rm(resolve(theme, "assets/account-link-elements.js"));
  await assert.rejects(
    validateTheme(theme),
    /bundled component entry does not exist/,
  );
});
