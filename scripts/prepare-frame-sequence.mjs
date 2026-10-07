import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const sourceDirectory = path.join(projectRoot, "source-assets", "frames-png");
// Full frames for landscape screens, and a full-height centre crop for
// portrait screens, which fill the screen (object-fit: cover) and would never
// show the sides anyway (picked in frame-sequence.tsx). Quality 72 at effort 6
// is visually identical to 84 under the scene shading and ~30% smaller.
const variants = [
  { directory: path.join(projectRoot, "public", "frames-webp"), width: 1280, height: 720 },
  {
    directory: path.join(projectRoot, "public", "frames-webp-portrait"),
    width: 576,
    height: 720,
    crop: { left: 352, top: 0, width: 576, height: 720 },
  },
];

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

for (const { directory } of variants) {
  await mkdir(directory, { recursive: true });
  for (const name of await readdir(directory)) {
    if (/^frame-\d+\.webp$/i.test(name) || name === "manifest.json") {
      await unlink(path.join(directory, name));
    }
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
    for (const { directory, width, height, crop } of variants) {
      // Sources are 1280x720; crop (if any) is in source pixels.
      const image = sharp(frame.sourcePath);
      await (crop ? image.extract(crop) : image.resize(width, height))
        .webp({ quality: 72, effort: 6, smartSubsample: true })
        .toFile(path.join(directory, outputName));
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const manifest = {
  count: frames.length,
  variants: variants.map(({ directory, width, height }) => ({ directory: path.basename(directory), width, height })),
  format: "webp",
  pattern: "frame-{index}.webp",
  sourceCount: sourceNames.length,
  deduplicatedCount: sourceNames.length - frames.length,
  sources: frames.map((frame) => frame.sourceName),
};

for (const { directory } of variants) {
  await writeFile(path.join(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

console.log(
  `Prepared ${frames.length} WebP frames from ${sourceNames.length} PNG sources (${manifest.deduplicatedCount} consecutive duplicates removed).`,
);
