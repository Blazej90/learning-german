/**
 * Rasterises `public/icons/icon.svg` into every PNG the app ships.
 *
 * Run after editing the SVG:  node scripts/generate-icons.mjs
 *
 * `sharp` is not a direct dependency — it arrives with Next for image
 * optimisation — so it is resolved from wherever the store put it rather than
 * added to package.json for a script that runs about once a year.
 */

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);

function loadSharp() {
  try {
    return require("sharp");
  } catch {
    const store = "node_modules/.pnpm";
    const dir = fs
      .readdirSync(store)
      .find((entry) => entry.startsWith("sharp@"));

    if (!dir) {
      throw new Error(
        "sharp not found. Install it once with: pnpm add -D sharp",
      );
    }

    return require(path.resolve(store, dir, "node_modules/sharp"));
  }
}

const sharp = loadSharp();
const source = fs.readFileSync("public/icons/icon.svg");

/** Every PNG the manifest, the browser tab and iOS ask for. */
const TARGETS = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "src/app/icon.png", size: 192 },
  { file: "src/app/apple-icon.png", size: 180 },
];

for (const { file, size } of TARGETS) {
  await sharp(source, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(file);

  console.log(`${file.padEnd(28)} ${size}x${size}`);
}
