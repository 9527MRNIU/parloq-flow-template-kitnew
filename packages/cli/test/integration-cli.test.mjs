import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { packIntegration, validateIntegration } from "../src/index.mjs";

const repoRoot = resolve(import.meta.dirname, "../../..");
const feedbackExample = resolve(repoRoot, "integrations/promotion-integration-feedback-demo");

async function temporaryDirectory(prefix) {
  return mkdtemp(resolve(tmpdir(), prefix));
}

async function createScriptFixture(prefix) {
  const root = await temporaryDirectory(prefix);
  const integration = resolve(root, "integration");
  await mkdir(resolve(integration, "scripts"), { recursive: true });
  await Promise.all([
    writeFile(resolve(integration, "integration.json"), `${JSON.stringify({
      schemaVersion: 1,
      type: "script",
      version: "1.0.0",
      integrationKey: "script-fixture",
      name: "脚本集成测试",
      description: "用于验证脚本集成契约。",
      entries: [
        "scripts/bootstrap.js",
        { path: "scripts/runtime.mjs", scriptType: "module" },
      ],
    }, null, 2)}\n`),
    writeFile(resolve(integration, "scripts/bootstrap.js"), "globalThis.fixtureLoaded = true;\n"),
    writeFile(resolve(integration, "scripts/runtime.mjs"), "export const ready = true;\n"),
  ]);
  return integration;
}

test("the iframe feedback example matches the managed integration contract", async () => {
  const result = await validateIntegration(feedbackExample);
  assert.equal(result.type, "iframe");
  assert.deepEqual(result.entries.map((entry) => entry.path), ["index.html"]);
  assert.deepEqual(result.feedback.events, ["page_view", "visit_end", "ready", "completed", "failed"]);
  assert.equal(result.manifest.integrationKey, "promotion-integration-feedback-demo");
  assert.equal(result.manifest.name, "内嵌框架独立回传集成示例");
  assert.match(result.manifest.description, /[\u3400-\u9fff]/u);
});

test("the standalone iframe example does not require the feedback bridge", async () => {
  const root = await temporaryDirectory("promotion-integration-iframe-");
  const integration = resolve(root, "integration");
  await cp(feedbackExample, integration, { recursive: true });
  const manifestPath = resolve(integration, "integration.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  delete manifest.feedback;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const result = await validateIntegration(integration);
  assert.equal(result.type, "iframe");
  assert.deepEqual(result.entries.map((entry) => entry.path), ["index.html"]);
  assert.equal(result.feedback, null);
});

test("the ordered script example preserves its declared entry order", async () => {
  const integration = await createScriptFixture("promotion-integration-script-order-");
  const result = await validateIntegration(integration);
  assert.equal(result.type, "script");
  assert.deepEqual(result.entries, [
    { path: "scripts/bootstrap.js", scriptType: "classic" },
    { path: "scripts/runtime.mjs", scriptType: "module" },
  ]);
  assert.equal(result.manifest.integrationKey, "script-fixture");
});

test("integration import metadata remains optional in the v1 contract", async () => {
  const integration = await createScriptFixture("promotion-integration-optional-metadata-");
  const manifestPath = resolve(integration, "integration.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  delete manifest.integrationKey;
  delete manifest.name;
  delete manifest.description;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await validateIntegration(integration);
});

test("integrationKey accepts only the lowercase machine-readable contract", async () => {
  for (const validKey of ["a", "a.b_c-d", "a".repeat(80)]) {
    const integration = await createScriptFixture("promotion-integration-key-valid-");
    const manifestPath = resolve(integration, "integration.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.integrationKey = validKey;
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await validateIntegration(integration);
  }

  for (const invalidKey of ["Uppercase", "-leading", "trailing-", "with space", "含中文", "a".repeat(81)]) {
    const integration = await createScriptFixture("promotion-integration-key-");
    const manifestPath = resolve(integration, "integration.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.integrationKey = invalidKey;
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await assert.rejects(validateIntegration(integration), /integration.json validation failed/);
  }
});

test("integration import metadata respects its length limits", async () => {
  for (const metadata of [
    { name: "" },
    { name: "名".repeat(121) },
    { description: "说".repeat(2001) },
  ]) {
    const integration = await createScriptFixture("promotion-integration-metadata-");
    const manifestPath = resolve(integration, "integration.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    Object.assign(manifest, metadata);
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await assert.rejects(validateIntegration(integration), /integration.json validation failed/);
  }
});

test("integration packing is deterministic and excludes author documentation", async () => {
  const root = await temporaryDirectory("promotion-integration-pack-");
  const first = resolve(root, "first.zip");
  const second = resolve(root, "second.zip");
  const packed = await packIntegration(feedbackExample, first);
  await packIntegration(feedbackExample, second);
  assert.ok(packed.zipBytes > 0);
  assert.equal(packed.resolvedVersion, "1.0.0");
  assert.equal(packed.files.some((file) => file.path === "README.md"), false);
  assert.deepEqual(await readFile(first), await readFile(second));
});

test("feedback is rejected for a script integration", async () => {
  const integration = await createScriptFixture("promotion-integration-feedback-");
  const manifestPath = resolve(integration, "integration.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.feedback = { enabled: true, events: ["ready"] };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await assert.rejects(validateIntegration(integration), /only iframe integrations support/);
});

test("ambiguous iframe packages require an explicit entry", async () => {
  const root = await temporaryDirectory("promotion-integration-ambiguous-");
  await writeFile(resolve(root, "a.html"), "<!doctype html><title>A</title>");
  await writeFile(resolve(root, "b.html"), "<!doctype html><title>B</title>");
  await assert.rejects(validateIntegration(root), /multiple possible entries/);
});

test("public integration assets reject direct control-plane paths", async () => {
  const root = await temporaryDirectory("promotion-integration-leak-");
  await writeFile(resolve(root, "runtime.js"), "fetch('/api/private-runtime');\n");
  await assert.rejects(validateIntegration(root), /direct platform or gateway integration/);
});
