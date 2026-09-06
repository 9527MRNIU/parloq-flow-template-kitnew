import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadTemplateCatalog } from "../../../scripts/template-catalog.mjs";

const repoRoot = resolve(import.meta.dirname, "../../..");

async function startPreview(t) {
  const child = spawn(process.execPath, [resolve(repoRoot, "scripts/preview.mjs")], {
    cwd: repoRoot,
    env: { ...process.env, TEMPLATE_PREVIEW_PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const exited = once(child, "exit");
    child.kill();
    await exited;
  });
  return new Promise((resolveReady, reject) => {
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => reject(new Error(`Preview startup timed out: ${stderr}`)), 10000);
    const fail = (error) => {
      clearTimeout(timer);
      reject(error);
    };
    child.once("error", fail);
    child.once("exit", (code) => fail(new Error(`Preview exited with ${code}: ${stderr}`)));
    child.stderr.on("data", (data) => { stderr += data; });
    child.stdout.on("data", (data) => {
      stdout += data;
      const url = stdout.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (!url) return;
      clearTimeout(timer);
      resolveReady(url);
    });
  });
}

test("preview serves checked-in template sources without generated release output", async (t) => {
  const url = await startPreview(t);
  const request = (path) => fetch(`${url}${path}`, { signal: AbortSignal.timeout(5000) });
  const home = await request("/");
  assert.equal(home.status, 200);
  const homeHtml = await home.text();
  for (const template of await loadTemplateCatalog(repoRoot)) {
    assert.ok(homeHtml.includes(template.slug), template.slug);
    const page = await request(`/theme?template=${template.slug}`);
    assert.equal(page.status, 200, template.slug);
    assert.ok((await page.text()).includes(`/theme-assets/${template.slug}/`), template.slug);
  }
  for (const locale of ["ar", "fa", "ur"]) {
    const page = await request(`/theme?lang=${locale}&state=verified_ready`);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.ok(html.includes(`locale="${locale}"`));
    assert.ok(html.includes("['ar','fa','ur'].includes(locale)?'rtl':'ltr'"));
    assert.ok(html.includes('selected="verified_ready"'));
  }
  const assetPath = "assets/account-link-elements.js";
  const asset = await request(`/theme-assets/white-label-account-link/${assetPath}`);
  assert.equal(asset.status, 200);
  assert.deepEqual(
    Buffer.from(await asset.arrayBuffer()),
    await readFile(resolve(repoRoot, "themes/white-label-account-link", assetPath)),
  );
  for (const path of [
    "/theme-assets/white-label-account-link/README.md",
    "/theme-assets/white-label-account-link/%2e%2e%2fpackage.json",
    "/theme-assets/white-label-account-link/.git/config",
  ]) {
    assert.equal((await request(path)).status, 404, path);
  }
});
