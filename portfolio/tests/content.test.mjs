import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedPosts, safeUrl, renderBody } from '../src/lib/content-model.ts';
import { validateContent } from '../src/lib/content.ts';
import { defaultContent } from '../src/data/default-content.ts';

const post = { _id: 'post-example', title: 'A test post', slug: 'example', excerpt: 'A short introduction.', publishedAt: '2026-01-01T12:00:00Z', body: [{ _type: 'block', _key: 'p1', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's1', text: 'Hello', marks: [] }] }] };

test('public content excludes drafts, releases, and future-dated posts', () => {
  const posts = publishedPosts([post, { ...post, _id: 'drafts.post-example', slug: 'draft' }, { ...post, _id: 'versions.release.post-example', slug: 'release' }, { ...post, _id: 'future', slug: 'future', publishedAt: '2099-01-01T00:00:00Z' }], new Date('2026-11-02T12:00:00Z'));
  assert.deepEqual(posts.map(p => p.slug), ['example']);
});

test('rejects duplicate or unsafe slugs instead of generating ambiguous routes', () => {
  assert.throws(() => publishedPosts([post, { ...post, _id: 'other' }]), /Duplicate/);
  for (const slug of ['../admin', 'a/b', '', 'UPPER', '%2f', undefined, null, 42]) assert.throws(() => publishedPosts([{ ...post, slug }]), /slug/);
});

test('rich text escapes markup and strips unsafe links', () => {
  const body = [{ ...post.body[0], markDefs: [{ _key: 'bad', _type: 'link', href: 'javascript:alert(1)' }], children: [{ _type: 'span', _key: 's', text: '<script>alert(1)</script>', marks: ['bad'] }] }];
  const html = renderBody(body);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script') && !html.includes('javascript:'));
  assert.equal(safeUrl('https://example.com/path'), 'https://example.com/path');
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '//evil.test', '/relative', 'https://user:pass@example.com']) assert.equal(safeUrl(url), undefined);
});

test('rejects missing, non-string, and duplicate project/service keys', () => {
  for (const collection of ['projects', 'services']) {
    for (const key of [undefined, null, 42]) {
      const input = structuredClone(defaultContent);
      input[collection][0].key = key;
      assert.throws(() => validateContent(input), /key/);
    }
    const input = structuredClone(defaultContent);
    input[collection][1].key = input[collection][0].key;
    assert.throws(() => validateContent(input), /key/);
  }
});
