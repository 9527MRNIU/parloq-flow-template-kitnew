import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { build } from "esbuild";

const repoRoot = resolve(import.meta.dirname, "../../..");
const appLaunchEntry = resolve(repoRoot, "packages/runtime/src/app-launch.ts");

async function loadAppLaunchHelpers() {
  const result = await build({
    entryPoints: [appLaunchEntry],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    write: false,
  });
  const source = Buffer.from(result.outputFiles[0].contents).toString("base64");
  return import(`data:text/javascript;base64,${source}`);
}

test("Android WhatsApp launch intents open linked devices and never use a second scheme", async () => {
  const { createAppLaunchFallbackUrl, resolveAppLaunchUrls } = await loadAppLaunchHelpers();
  const currentUrl = "https://example.test/pair?attempt=123#instructions";
  const consumerFallback = createAppLaunchFallbackUrl("consumer", currentUrl);
  const businessFallback = createAppLaunchFallbackUrl("business", currentUrl);
  const options = { mobile: true, userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 4)" };

  assert.equal(consumerFallback, "https://example.test/pair?attempt=123#__account-link-consumer-app-not-opened");
  assert.equal(businessFallback, "https://example.test/pair?attempt=123#__account-link-business-app-not-opened");
  assert.deepEqual(
    resolveAppLaunchUrls("consumer", { ...options, browserFallbackUrl: consumerFallback }),
    [`intent://settings/linked_devices#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(consumerFallback)};end`],
  );
  assert.deepEqual(
    resolveAppLaunchUrls("business", { ...options, browserFallbackUrl: businessFallback }),
    [`intent://settings/linked_devices#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url=${encodeURIComponent(businessFallback)};end`],
  );
});

test("Samsung Internet adds a direct linked-devices scheme after the Android intent", async () => {
  const { createAppLaunchFallbackUrl, resolveAppLaunchUrls } = await loadAppLaunchHelpers();
  const fallback = createAppLaunchFallbackUrl("consumer", "https://example.test/pair");
  const options = {
    mobile: true,
    userAgent: "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/120.0.0.0 Mobile Safari/537.36",
    browserFallbackUrl: fallback,
  };

  assert.deepEqual(resolveAppLaunchUrls("consumer", options), [
    `intent://settings/linked_devices#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(fallback)};end`,
    "whatsapp://settings/linked_devices",
  ]);
  assert.deepEqual(resolveAppLaunchUrls("business", options), [
    `intent://settings/linked_devices#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url=${encodeURIComponent(fallback)};end`,
    "whatsapp-business://settings/linked_devices",
  ]);
});

test("Android WhatsApp launch intents require an explicit non-store fallback", async () => {
  const { resolveAppLaunchUrls } = await loadAppLaunchHelpers();
  assert.throws(
    () => resolveAppLaunchUrls("consumer", { mobile: true, userAgent: "Android" }),
    /requires a browser fallback URL/,
  );
});

test("iOS WhatsApp launch URLs target each app's linked devices page without an App Store fallback", async () => {
  const { resolveAppLaunchUrls } = await loadAppLaunchHelpers();
  const options = {
    mobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
  };

  assert.deepEqual(resolveAppLaunchUrls("consumer", options), ["whatsapp-consumer://settings/linked_devices"]);
  assert.deepEqual(resolveAppLaunchUrls("business", options), ["whatsapp-smb://settings/linked_devices"]);
});
