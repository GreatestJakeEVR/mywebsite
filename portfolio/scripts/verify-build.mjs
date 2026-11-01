import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const prototype = fileURLToPath(new URL('../../design-preview/', import.meta.url));
const approvedIntro = 'I help businesses and individuals bring their ideas to life—whether that means simplifying a business process, creating a website and building an online presence, or designing something you can hold. From the first conversation to the finished project, you’ll work directly with me.';
const pages = ['index.html', 'blog/welcome/index.html'];
let checked = 0;

for (const page of pages) {
  const fullPath = path.join(root, page);
  const html = await readFile(fullPath, 'utf8');
  assert.ok(html.includes(approvedIntro), `${page}: exact approved introductory wording`);
  assert.match(html, /name="robots" content="noindex,nofollow"/, `${page}: preview indexing policy`);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `${page}: one primary heading`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${page}: unique ids`);
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(value)) continue;
    const [pathname, fragment] = value.split('#');
    let destination = pathname
      ? pathname.startsWith('/')
        ? path.resolve(root, '.' + pathname)
        : path.resolve(path.dirname(fullPath), pathname)
      : fullPath;
    const relative = path.relative(root, destination);
    assert.ok(!relative.startsWith('..') && !path.isAbsolute(relative), `Asset outside output: ${value}`);
    if ((await stat(destination)).isDirectory()) destination = path.join(destination, 'index.html');
    assert.ok((await stat(destination)).isFile(), `${page}: ${value} exists`);
    if (fragment && destination.endsWith('.html')) {
      assert.ok((await readFile(destination, 'utf8')).includes(`id="${fragment}"`), `${page}: ${value} anchor exists`);
    }
    checked += 1;
  }
}

for (const asset of ['JA_logo.svg', 'jake-portrait.png']) {
  assert.deepEqual(await readFile(path.join(root, 'assets', asset)), await readFile(path.join(prototype, 'assets', asset)), `${asset}: original asset bytes preserved`);
}
assert.match(await readFile(path.join(root, 'robots.txt'), 'utf8'), /Disallow: \//);
assert.match(await readFile(path.join(root, '_headers'), 'utf8'), /X-Robots-Tag: noindex, nofollow/);
console.log(`PASS: ${pages.length} built pages; ${checked} local links/assets; exact introduction; heading/id checks; original logo and portrait; preview indexing protections.`);
