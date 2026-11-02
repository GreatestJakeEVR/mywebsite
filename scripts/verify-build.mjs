import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const prototype = fileURLToPath(new URL('../design-preview/', import.meta.url));
const approvedIntro = 'I help businesses and individuals bring their ideas to life—whether that means simplifying a business process, creating a website and building an online presence, or designing something you can hold. From the first conversation to the finished project, you’ll work directly with me.';
const production = process.argv.includes('--production');
const pages = [];
async function findPages(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const destination = path.join(directory, entry.name);
    if (entry.isDirectory()) await findPages(destination);
    else if (entry.name.endsWith('.html')) pages.push(path.relative(root, destination).replaceAll('\\', '/'));
  }
}
await findPages(root);
let checked = 0;

for (const page of pages) {
  const fullPath = path.join(root, page);
  const html = await readFile(fullPath, 'utf8');
  if (page === 'index.html') {
    assert.match(html, /<form[^>]*id="contact-form"[^>]*action="\/api\/contact"[^>]*method="POST"/, 'Homepage: form submits to server delivery endpoint');
    assert.match(html, /Send message/, 'Homepage: direct send action');
    assert.match(html, /id="contact-status"[^>]*role="status"/, 'Homepage: accessible submission feedback');
    assert.doesNotMatch(html, /Prepare project email|id="email-draft"|Opens a draft in your email app/, 'Homepage: no email-app requirement');
    assert.doesNotMatch(html, /id="journal"|NOTES FROM THE WORKBENCH/, 'Homepage: workbench notes section removed');
    assert.doesNotMatch(html, /class="eyebrow">\d+\s*\//, 'Homepage: section titles have no numeric prefix');
    assert.doesNotMatch(html, /data-project=|id="project-dialog"|id="work"/, 'Homepage: project gallery and dialog moved to Work');
    assert.match(html, /href="\/work\/"/, 'Homepage: link to the separate Work page');
  }
  if (page !== 'admin/index.html') {
    const navigation = html.match(/<nav\b[^>]*id="main-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
    assert.ok(navigation, `${page}: main navigation exists`);
    assert.doesNotMatch(navigation, />Services<|href="[^"]*#services"/, `${page}: Services link removed from navbar`);
  }
  if (page === 'work/index.html') {
    const count = (html.match(/data-project="/g) ?? []).length;
    const data = JSON.parse(html.match(/<script type="application\/json" id="project-data">([\s\S]*?)<\/script>/)?.[1] || '{}');
    assert.ok(count > 0 && count === Object.keys(data).length, 'Work: every published card has matching detail content');
    assert.match(html, /id="project-dialog"/, 'Work: accessible project dialog');
    assert.match(html, /href="\/#contact" id="dialog-contact"/, 'Work: inquiry returns to homepage contact');
    assert.match(html, /href="\/work\/" aria-current="page"/, 'Work: current navigation item');
  }
  if (page === 'creations/index.html') {
    for (const id of ['trash-bag-dispenser', 'printed-business-card', 'mario-block-lights', 'geometric-tiger', 'heygears', 'custom-shirts']) {
      assert.ok(html.includes(`id="${id}"`), `Creations: ${id} section exists`);
    }
    assert.equal((html.match(/<img src="\/assets\/creations\//g) ?? []).length, 6, 'Creations: six supplied project photos');
    assert.match(html, /COMING LATER/, 'Future services retain their planned status');
    assert.match(html, /LSU pride/);
    assert.match(html, /full-color 3D/);
    assert.match(html, /plan to make for myself/);
  }
  const visibleText = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, '').replace(/<[^>]*>/g, '');
  assert.doesNotMatch(visibleText, /[\w.+-]+@gmail\.com/i, `${page}: no owner email address displayed`);
  for (const [, recipient] of html.matchAll(/href="mailto:([^"?]+)[^"]*"/g)) {
    assert.equal(recipient, 'jakedevworks@gmail.com', `${page}: business contact recipient`);
  }
  if (page === 'index.html') assert.ok(html.includes(approvedIntro), `${page}: exact approved introductory wording`);
  const publicPage = production && page !== 'admin/index.html';
  assert.ok(html.includes(`name="robots" content="${publicPage ? 'index,follow' : 'noindex,nofollow'}"`), `${page}: indexing policy`);
  if (publicPage) assert.match(html, /rel="canonical" href="https:\/\/www\.jakeardoin\.com\//, `${page}: canonical production URL`);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `${page}: one primary heading`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${page}: unique ids`);
  for (const [, value] of html.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)) {
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
if (production) {
  assert.match(await readFile(path.join(root, 'robots.txt'), 'utf8'), /Allow: \//);
  assert.ok(!(await readFile(path.join(root, 'sitemap.xml'), 'utf8')).includes('/admin/'));
  assert.equal(JSON.parse(await readFile(path.join(root, 'build-info.json'), 'utf8')).mode, 'production');
} else {
  assert.match(await readFile(path.join(root, 'robots.txt'), 'utf8'), /Disallow: \//);
  assert.match(await readFile(path.join(root, '_headers'), 'utf8'), /X-Robots-Tag: noindex, nofollow/);
}
const routes = JSON.parse(await readFile(path.join(root, '_routes.json'), 'utf8'));
assert.deepEqual(routes.include, ['/api/contact', '/api/contact/'], 'Only contact delivery invokes the server function');
console.log(`PASS: ${pages.length} built pages; ${checked} local links/assets; exact introduction; heading/id checks; original logo and portrait; ${production ? 'production' : 'preview'} indexing policy.`);
