import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const approvedIntro = 'I help businesses and individuals bring their ideas to life—whether that means simplifying a business process, creating a website and building an online presence, or designing something you can hold. From the first conversation to the finished project, you’ll work directly with me.';
const pages = ['index.html','blog/welcome/index.html'];
let checked = 0;
for (const page of pages) {
  const fullPath = path.join(root,page);
  const html = await readFile(fullPath,'utf8');
  assert.ok(html.includes(approvedIntro), `${page}: approved introduction must be preserved exactly`);
  assert.ok(html.includes('noindex,nofollow'), `${page}: design preview must remain excluded from indexing`);
  assert.equal((html.match(/<h1[ >]/g) || []).length,1,`${page}: exactly one primary heading`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`${page}: unique HTML ids`);
  for (const [,attribute,value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(value)) continue;
    const [pathname,fragment] = value.split('#');
    let destination = pathname ? path.resolve(path.dirname(fullPath),pathname) : fullPath;
    const info = await stat(destination);
    if(info.isDirectory()) destination = path.join(destination,'index.html');
    assert.ok((await stat(destination)).isFile(), `${page}: ${attribute}=${value} must resolve`);
    if(fragment && destination.endsWith('.html')) {
      const target = await readFile(destination,'utf8');
      assert.ok(target.includes(`id="${fragment}"`),`${page}: missing anchor ${value}`);
    }
    checked++;
  }
}
const js = await readFile(path.join(root,'app.js'),'utf8');
assert.ok(js.includes('encodeURIComponent(subject)') && js.includes('encodeURIComponent(body)'), 'Contact email must encode user input');
assert.ok(!js.includes('innerHTML'), 'Project copy must be inserted as text');
console.log(`PASS: ${pages.length} pages; ${checked} local links/assets; exact approved introduction; heading/id checks; contact encoding.`);
