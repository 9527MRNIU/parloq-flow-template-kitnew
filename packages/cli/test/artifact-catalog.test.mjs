import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { loadPublicArtifactCatalog, numberedArtifactFilename } from "../../../scripts/artifact-catalog.mjs";

const repoRoot = resolve(import.meta.dirname, "../../..");

test("the artifact catalog preserves stable per-kind sequences and manifest versions", async () => {
  const artifacts = await loadPublicArtifactCatalog(repoRoot);
  assert.deepEqual(
    artifacts.map(({ kind, sequence, filename, version }) => ({ kind, sequence, filename, version })),
    [
      {
        kind: "template",
        sequence: "0001",
        filename: "0001-white-label-account-link-1.6.0.zip",
        version: "1.6.0",
      },
      {
        kind: "integration",
        sequence: "0001",
        filename: "0001-promotion-integration-script-demo-1.0.0.zip",
        version: "1.0.0",
      },
      {
        kind: "integration",
        sequence: "0002",
        filename: "0002-promotion-integration-feedback-demo-1.0.0.zip",
        version: "1.0.0",
      },
      {
        kind: "integration",
        sequence: "0003",
        filename: "0003-promotion-integration-iframe-demo-1.0.0.zip",
        version: "1.0.0",
      },
      {
        kind: "integration",
        sequence: "0004",
        filename: "0004-device-callback-adapter-1.0.0.zip",
        version: "1.0.0",
      },
      {
        kind: "template",
        sequence: "0002",
        filename: "0002-myloveday-demo-2.0.0.zip",
        version: "2.0.0",
      },
    ],
  );
  for (const artifact of artifacts) {
    assert.match(artifact.name, /[\u3400-\u9fff]/u);
    assert.match(artifact.description, /[\u3400-\u9fff]/u);
  }
});

test("numbered artifact filenames reject unstable catalog values", () => {
  assert.throws(
    () => numberedArtifactFilename({ sequence: "1", slug: "valid-slug" }, "1.0.0"),
    /invalid artifact sequence/,
  );
  assert.throws(
    () => numberedArtifactFilename({ sequence: "0004", slug: "Invalid_Slug" }, "1.0.0"),
    /invalid artifact slug/,
  );
});
