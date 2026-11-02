import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const requireFromAstro = createRequire(import.meta.resolve('astro'));
const sharp = requireFromAstro('sharp');
const [sourceDirectory, originalOutputDirectory, shirtConceptPath] = process.argv.slice(2);
assert.ok(sourceDirectory && originalOutputDirectory && shirtConceptPath, 'Usage: node scripts/convert-creation-photos.mjs SOURCE_DIRECTORY FULL_SIZE_PNG_DIRECTORY SHIRT_CONCEPT_PATH');
const websiteDirectory = fileURLToPath(new URL('../public/assets/creations/', import.meta.url));
const prototypeDirectory = fileURLToPath(new URL('../../design-preview/assets/creations/', import.meta.url));
const photos = [
  ['mario nightlight question mark block.jpg', 'mario-question-block.png'],
  ['mario light.jpg', 'mario-question-block-room.png'],
  ['trash bag dispenser.jpg', 'trash-bag-dispenser.png'],
  ['my business card.jpg', 'printed-business-card.png'],
  ['geometric_tiger_image.jpg', 'geometric-tiger-magnet.png'],
];

for (const directory of [originalOutputDirectory, websiteDirectory, prototypeDirectory]) {
  await mkdir(directory, { recursive: true });
}
const results = [];
for (const [sourceName, outputName] of photos) {
  const source = await readFile(path.join(sourceDirectory, sourceName));
  const original = await sharp(source).rotate().toColourspace('srgb').png({ compressionLevel: 9, palette: false }).toBuffer();
  const sourcePixels = await sharp(source).rotate().toColourspace('srgb').removeAlpha().raw().toBuffer();
  const pngPixels = await sharp(original).toColourspace('srgb').removeAlpha().raw().toBuffer();
  assert.ok(sourcePixels.equals(pngPixels), `${sourceName}: decoded pixels must be preserved`);
  await writeFile(path.join(originalOutputDirectory, outputName), original);

  const web = await sharp(original).resize({ width: 1600, height: 1800, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9, palette: false }).toBuffer();
  await writeFile(path.join(websiteDirectory, outputName), web);
  await writeFile(path.join(prototypeDirectory, outputName), web);
  const webp = await sharp(web).webp({ quality: 85 }).toBuffer();
  for (const directory of [websiteDirectory, prototypeDirectory]) await writeFile(path.join(directory, outputName.replace('.png', '.webp')), webp);
  const originalInfo = await sharp(original).metadata();
  const webInfo = await sharp(web).metadata();
  results.push({ file: outputName, originalWidth: originalInfo.width, originalHeight: originalInfo.height, webWidth: webInfo.width, webHeight: webInfo.height, originalBytes: original.length, webBytes: web.length, pixelVerified: true });
}
// The owner requested only the shirt mockup on the right, retaining the artwork as supplied.
const shirtSource = await readFile(shirtConceptPath);
const shirtInfo = await sharp(shirtSource).metadata();
assert.equal(shirtInfo.width, 1536, 'Crop is calibrated to the supplied 1536 × 1024 concept');
assert.equal(shirtInfo.height, 1024);
const shirt = await sharp(shirtSource).extract({ left: 770, top: 0, width: 766, height: 1024 }).png({ compressionLevel: 9 }).toBuffer();
for (const directory of [websiteDirectory, prototypeDirectory, originalOutputDirectory]) await writeFile(path.join(directory, 'team-albedo-shirt-concept.png'), shirt);
const shirtWebp = await sharp(shirt).webp({ quality: 85 }).toBuffer();
for (const directory of [websiteDirectory, prototypeDirectory]) await writeFile(path.join(directory, 'team-albedo-shirt-concept.webp'), shirtWebp);
results.push({ file: 'team-albedo-shirt-concept.png', width: 766, height: 1024, operation: 'right-side shirt crop only', bytes: shirt.length });
await writeFile(path.join(originalOutputDirectory, 'conversion-results.json'), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
