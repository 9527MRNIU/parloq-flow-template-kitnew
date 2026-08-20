import { readFile, readdir, lstat, mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { zipSync } from "fflate";

const ZIP_MTIME = new Date(2000, 0, 1, 0, 0, 0);

async function walk(root, current = root) {
  const files = [];
  for (const entry of (await readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = resolve(current, entry.name);
    const path = relative(root, absolute).split(sep).join("/");
    if (entry.isSymbolicLink()) throw new Error(`release archive cannot contain symbolic links: ${path}`);
    if (entry.isDirectory()) files.push(...await walk(root, absolute));
    if (entry.isFile()) {
      const stats = await lstat(absolute);
      files.push({ absolute, path, size: stats.size });
    }
  }
  return files;
}

const [inputDirectory, outputFile] = process.argv.slice(2);
if (!inputDirectory || !outputFile) {
  console.error("Usage: node scripts/pack-release.mjs <input-directory> <output.zip>");
  process.exitCode = 2;
} else {
  const root = resolve(inputDirectory);
  const output = resolve(outputFile);
  if (output === root || output.startsWith(`${root}${sep}`)) {
    throw new Error("release archive output must be outside its input directory");
  }
  const files = await walk(root);
  const entries = {};
  for (const file of files) {
    entries[file.path] = [new Uint8Array(await readFile(file.absolute)), { mtime: ZIP_MTIME }];
  }
  const archive = zipSync(entries, { level: 9 });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, archive);
  console.log(`packed ${files.length} release files (${archive.byteLength} bytes) at ${output}`);
}
