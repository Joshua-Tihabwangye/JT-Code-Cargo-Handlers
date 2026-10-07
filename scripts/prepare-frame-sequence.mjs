import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const sourceDirectory = path.join(projectRoot, "source-assets", "frames-png");
const outputDirectory = path.join(projectRoot, "public", "frames-webp");

await mkdir(outputDirectory, { recursive: true });

const sourceNames = (await readdir(sourceDirectory))
  .filter((name) => /^ezgif-frame-\d+\.png$/i.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (!sourceNames.length) {
  throw new Error(`No PNG frames were found in ${sourceDirectory}`);
}

const frames = [];
let previousHash = "";

for (const sourceName of sourceNames) {
  const sourcePath = path.join(sourceDirectory, sourceName);
  const buffer = await readFile(sourcePath);
  const hash = createHash("sha256").update(buffer).digest("hex");
  if (hash === previousHash) continue;
  previousHash = hash;
  frames.push({ sourceName, sourcePath });
}

for (const name of await readdir(outputDirectory)) {
  if (/^frame-\d+\.webp$/i.test(name) || name === "manifest.json") {
    await unlink(path.join(outputDirectory, name));
  }
}

const concurrency = 6;
let cursor = 0;

async function worker() {
  while (cursor < frames.length) {
    const frameIndex = cursor;
    cursor += 1;
    const frame = frames[frameIndex];
    const outputName = `frame-${String(frameIndex + 1).padStart(4, "0")}.webp`;
    await sharp(frame.sourcePath)
      .webp({ quality: 84, effort: 4, smartSubsample: true })
      .toFile(path.join(outputDirectory, outputName));
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const manifest = {
  count: frames.length,
  width: 1280,
  height: 720,
  format: "webp",
  pattern: "frame-{index}.webp",
  sourceCount: sourceNames.length,
  deduplicatedCount: sourceNames.length - frames.length,
  sources: frames.map((frame) => frame.sourceName),
};

await writeFile(
  path.join(outputDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(
  `Prepared ${frames.length} WebP frames from ${sourceNames.length} PNG sources (${manifest.deduplicatedCount} consecutive duplicates removed).`,
);
