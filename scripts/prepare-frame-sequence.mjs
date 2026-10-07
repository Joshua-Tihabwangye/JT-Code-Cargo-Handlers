import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const sourceDirectory = path.join(projectRoot, "source-assets", "frames-png");
const outputDirectory = path.join(projectRoot, "public", "frames-webp");
const anchorDirectory = path.join(projectRoot, "public", "frames-anchor");
const anchorStride = 1;

await mkdir(outputDirectory, { recursive: true });
await mkdir(anchorDirectory, { recursive: true });

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

for (const name of await readdir(anchorDirectory)) {
  if (/^anchor-\d+\.webp$/i.test(name) || name === "manifest.json") {
    await unlink(path.join(anchorDirectory, name));
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

const anchors = frames.filter((_, index) => index % anchorStride === 0 || index === frames.length - 1);
let anchorCursor = 0;

async function anchorWorker() {
  while (anchorCursor < anchors.length) {
    const anchor = anchors[anchorCursor];
    const sourceIndex = frames.indexOf(anchor);
    anchorCursor += 1;
    const outputName = `anchor-${String(sourceIndex + 1).padStart(4, "0")}.webp`;
    await sharp(anchor.sourcePath)
      .resize(384, 216, { fit: "fill" })
      .webp({ quality: 76, effort: 4, smartSubsample: true })
      .toFile(path.join(anchorDirectory, outputName));
  }
}

await Promise.all(Array.from({ length: 4 }, () => anchorWorker()));

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

await writeFile(
  path.join(anchorDirectory, "manifest.json"),
  `${JSON.stringify({
    count: anchors.length,
    stride: anchorStride,
    width: 384,
    height: 216,
    format: "webp",
    indices: anchors.map((anchor) => frames.indexOf(anchor)),
  }, null, 2)}\n`,
  "utf8",
);

console.log(
  `Prepared ${frames.length} WebP frames and ${anchors.length} lightweight anchors from ${sourceNames.length} PNG sources (${manifest.deduplicatedCount} consecutive duplicates removed).`,
);
