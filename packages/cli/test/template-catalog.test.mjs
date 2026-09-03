import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { loadTemplateCatalog } from "../../../scripts/template-catalog.mjs";
import { validateTemplate } from "../src/index.mjs";

const repoRoot = resolve(import.meta.dirname, "../../..");

async function catalogFixture(t, overrides = {}) {
  const root = await mkdtemp(resolve(tmpdir(), "promotion-source-catalog-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(resolve(root, "artifacts"));
  await mkdir(resolve(root, "themes/example"), { recursive: true });
  const template = {
    kind: "template",
    sequence: "0001",
    slug: "example",
    source: "themes/example",
    manifest: "manifest.json",
    ...overrides,
  };
  await writeFile(resolve(root, "artifacts/catalog.json"), JSON.stringify({
    schemaVersion: 1,
    artifacts: [
      // No integration directory or manifest exists. Template tooling must
      // ignore this platform-owned source instead of trying to open it.
      { kind: "integration", source: "integrations/platform-owned", manifest: "integration.json" },
      template,
    ],
  }));
  await writeFile(resolve(root, "themes/example/manifest.json"), JSON.stringify({
    version: "1.0.0",
    name: "模板示例",
    description: "用于测试源码目录索引。",
  }));
  return root;
}

test("template source catalog preserves permanent template sequences", async () => {
  const templates = await loadTemplateCatalog(repoRoot);
  assert.deepEqual(
    templates.map(({ sequence, source }) => ({ sequence, source })),
    [
      { sequence: "0001", source: "themes/white-label-account-link" },
      { sequence: "0002", source: "themes/myloveday-demo" },
      { sequence: "0003", source: "themes/short-tagline-demo" },
      { sequence: "0004", source: "themes/myloveday-showcase-demo" },
      { sequence: "0005", source: "themes/short-tagline-showcase-demo" },
      { sequence: "0006", source: "themes/myloveday-hotdates-demo" },
    ],
  );
  for (const template of templates) {
    const manifest = JSON.parse(await readFile(template.manifestPath, "utf8"));
    assert.equal(template.version, manifest.version);
    assert.equal(Object.hasOwn(template, "filename"), false);
  }
});

test("all registered template sources satisfy their contracts and baseline locales", async () => {
  for (const template of await loadTemplateCatalog(repoRoot)) {
    const result = await validateTemplate(template.sourcePath);
    assert.equal(result.locales.length, 15, template.slug);
    for (const locale of ["ar", "fa", "ur"]) assert.ok(result.locales.includes(locale), template.slug);
  }
});

test("template catalog does not open managed integration manifests", async (t) => {
  const templates = await loadTemplateCatalog(await catalogFixture(t));
  assert.equal(templates.length, 1);
  assert.equal(templates[0].slug, "example");
});

test("template catalog rejects unstable identifiers and escaping paths", async (t) => {
  for (const [overrides, message] of [
    [{ sequence: "0002" }, /template sequence must be stable/],
    [{ slug: "Invalid_Slug" }, /invalid template slug/],
    [{ source: "../outside" }, /template source escapes/],
    [{ manifest: "../outside.json" }, /template manifest escapes/],
  ]) {
    const root = await catalogFixture(t, overrides);
    await assert.rejects(loadTemplateCatalog(root), message);
  }
});
