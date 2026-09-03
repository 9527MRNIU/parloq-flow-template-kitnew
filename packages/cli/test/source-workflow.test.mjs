import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import * as cli from "../src/index.mjs";

const repoRoot = resolve(import.meta.dirname, "../../..");
const cliPath = resolve(repoRoot, "packages/cli/src/index.mjs");

test("source workflow has no archive scripts, dependencies, or exports", async () => {
  const packageJson = JSON.parse(await readFile(resolve(repoRoot, "package.json"), "utf8"));
  for (const script of ["build", "pack", "verify:dist", "validate:integrations"]) {
    assert.equal(Object.hasOwn(packageJson.scripts, script), false);
  }
  assert.doesNotMatch(packageJson.scripts.ci, /build|pack|verify:dist/);
  assert.doesNotMatch(packageJson.scripts.preview, /build|dist/);
  assert.equal(Object.hasOwn(packageJson.devDependencies, "fflate"), false);
  for (const name of ["buildTemplate", "buildTheme", "packTemplate", "packIntegration", "packTheme"]) {
    assert.equal(Object.hasOwn(cli, name), false);
  }
  const workflow = await readFile(resolve(repoRoot, ".github/workflows/ci.yml"), "utf8");
  assert.doesNotMatch(workflow, /upload-artifact|gh release|dist\//);
  await assert.rejects(readFile(resolve(repoRoot, ".github/workflows/release.yml")), { code: "ENOENT" });
});

test("source catalog keeps permanent integration sequences on their current directories", async () => {
  const catalog = JSON.parse(await readFile(resolve(repoRoot, "artifacts/catalog.json"), "utf8"));
  const integrations = catalog.artifacts
    .filter((entry) => entry.kind === "integration")
    .map(({ sequence, slug, source, visibility }) => ({ sequence, slug, source, visibility }));
  assert.deepEqual(integrations, [
    {
      sequence: "0001",
      slug: "device-callback-18.4-18.6.2",
      source: "integrations/device-callback-18.4-18.6.2",
      visibility: "internal",
    },
    {
      sequence: "0002",
      slug: "device-callback-13.0-17.2.1",
      source: "integrations/device-callback-13.0-17.2.1",
      visibility: "internal",
    },
  ]);
  for (const entry of integrations) {
    assert.equal(basename(entry.source), entry.slug);
    await access(resolve(repoRoot, entry.source));
  }
});

test("removed CLI commands fail without reading inputs or creating output files", async (t) => {
  const root = await mkdtemp(resolve(tmpdir(), "promotion-source-command-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const args of [["template", "build"], ["template", "pack"], ["integration", "pack"], ["pack"]]) {
    const result = spawnSync(process.execPath, [cliPath, ...args, "missing-source"], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /Usage:.*validate/);
  }
  assert.deepEqual(await readdir(root), []);
});

test("CLI keeps source validation available", () => {
  for (const args of [["template", "validate"], ["validate"]]) {
    const result = spawnSync(process.execPath, [cliPath, ...args, "themes/white-label-account-link"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /valid promotion-template\/v3 template/);
  }
});
