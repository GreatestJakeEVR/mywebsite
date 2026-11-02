import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadEnvFile } from 'node:process';

for (const file of ['.env', '.env.local']) {
  try { loadEnvFile(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
assert.ok(process.env.SANITY_PROJECT_ID && process.env.SANITY_DATASET, 'Production requires a connected Sanity project and dataset.');
assert.ok(process.env.SANITY_STUDIO_URL, 'Production requires the deployed HTTPS Studio URL.');
const editor = new URL(process.env.SANITY_STUDIO_URL);
assert.equal(editor.protocol, 'https:', 'Production requires the deployed HTTPS Studio URL.');
assert.ok(!editor.username && !editor.password, 'Studio URL must not contain credentials.');
assert.ok(editor.hostname.endsWith('.sanity.studio'), 'Use the owner-controlled hosted Sanity Studio.');
execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { stdio: 'inherit', env: { ...process.env, PUBLISH_SITE: 'true', REQUIRE_SANITY: 'true', ASTRO_TELEMETRY_DISABLED: '1' } });

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const destination = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(destination);
    else if (entry.name === 'index.html') pages.push(path.relative(root, directory).replaceAll('\\', '/'));
  }
}
await collect(root);
const locations = pages.filter(page => page !== 'admin').map(page => `https://www.jakeardoin.com/${page ? page + '/' : ''}`);
await writeFile(path.join(root, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + locations.map(url => `<url><loc>${url}</loc></url>`).join('') + '</urlset>\n');
await writeFile(path.join(root, 'robots.txt'), 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://www.jakeardoin.com/sitemap.xml\n');
await writeFile(path.join(root, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/admin/*\n  X-Robots-Tag: noindex, nofollow\n');
// Scope redirects to the known legacy homepage alias; do not invent redirects for cookbook/admin apps.
await writeFile(path.join(root, '_redirects'), '/home/ / 301\n');
const manifest = { mode: 'production', sanityProjectId: process.env.SANITY_PROJECT_ID, dataset: process.env.SANITY_DATASET, routes: locations.length, studio: editor.origin };
await writeFile(path.join(root, 'build-info.json'), JSON.stringify(manifest, null, 2) + '\n');
assert.ok((await readFile(path.join(root, 'index.html'), 'utf8')).includes('content="index,follow"'));
console.log(`Production output ready: ${locations.length} public routes, connected published content, sitemap, and indexing policy.`);
