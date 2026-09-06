import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { validateIntegration } from "../src/index.mjs";

async function temporaryDirectory(prefix) {
  return mkdtemp(resolve(tmpdir(), prefix));
}

async function createFeedbackFixture(prefix) {
  const root = await temporaryDirectory(prefix);
  const integration = resolve(root, "integration");
  await mkdir(integration);
  await Promise.all([
    writeFile(resolve(integration, "integration.json"), `${JSON.stringify({
      schemaVersion: 1,
      type: "iframe",
      version: "1.0.0",
      integrationKey: "feedback-frame-fixture",
      name: "内嵌框架回传测试",
      description: "用于验证兼容契约的动态测试夹具。",
      entry: "index.html",
      feedback: { enabled: true, events: ["ready", "completed", "failed"] },
    }, null, 2)}\n`),
    writeFile(resolve(integration, "index.html"), "<!doctype html><title>Fixture</title>\n"),
  ]);
  return integration;
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

test("the iframe feedback fixture matches the v1 integration contract", async () => {
  const result = await validateIntegration(await createFeedbackFixture("promotion-integration-feedback-contract-"));
  assert.equal(result.type, "iframe");
  assert.deepEqual(result.entries.map((entry) => entry.path), ["index.html"]);
  assert.deepEqual(result.feedback.events, ["page_view", "visit_end", "ready", "completed", "failed"]);
  assert.equal(result.manifest.integrationKey, "feedback-frame-fixture");
  assert.equal(result.manifest.name, "内嵌框架回传测试");
  assert.match(result.manifest.description, /[\u3400-\u9fff]/u);
});

test("a standalone iframe fixture does not require the feedback bridge", async () => {
  const integration = await createFeedbackFixture("promotion-integration-iframe-");
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

test("integration validation excludes author documentation", async () => {
  const integration = await createScriptFixture("promotion-integration-documentation-");
  await writeFile(resolve(integration, "README.md"), "author notes\n");
  const result = await validateIntegration(integration);
  assert.equal(result.version, "1.0.0");
  assert.equal(result.files.some((file) => file.path === "README.md"), false);
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
