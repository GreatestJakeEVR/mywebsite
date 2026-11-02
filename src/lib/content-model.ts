import { escapeHTML, toHTML } from '@portabletext/to-html';

export type RichBlock = { _type: string; [key: string]: unknown };
export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category?: string;
  author?: string;
  body: RichBlock[];
}

export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return undefined;
  try {
    const url = new URL(value);
    return url.username || url.password ? undefined : url.href;
  } catch { return undefined; }
}

export function text(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing content field: ${field}`);
  return value;
}

export function publicDocument(document: { _id: string }): boolean {
  return !document._id.startsWith('drafts.') && !document._id.startsWith('versions.');
}

export function publishedPosts(input: unknown[], now = new Date()): Post[] {
  const seen = new Set<string>();
  return input.filter(item => publicDocument(item as Post)).map(item => {
    const post = item as Post;
    text(post._id, '_id'); text(post.title, 'title'); text(post.excerpt, 'excerpt');
    if (typeof post.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) throw new Error('Invalid post slug');
    if (seen.has(post.slug)) throw new Error(`Duplicate post slug: ${post.slug}`);
    seen.add(post.slug);
    if (!Number.isFinite(Date.parse(post.publishedAt))) throw new Error('Invalid post publication date');
    if (!Array.isArray(post.body) || !post.body.length) throw new Error('Missing post body');
    return post;
  }).filter(post => Date.parse(post.publishedAt) <= now.getTime())
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function renderBody(body: RichBlock[]): string {
  return toHTML(body, {
    components: {
      marks: {
        link: ({ children, value }) => {
          const href = safeUrl(value?.href);
          return href ? `<a href="${escapeHTML(href)}" rel="noopener noreferrer">${children}</a>` : children;
        },
      },
      types: {
        image: ({ value }) => {
          const url = safeUrl(value?.url);
          if (!url || new URL(url).hostname !== 'cdn.sanity.io') return '';
          const alt = typeof value.alt === 'string' ? value.alt : '';
          const caption = typeof value.caption === 'string' ? `<figcaption>${escapeHTML(value.caption)}</figcaption>` : '';
          return `<figure><img src="${escapeHTML(url)}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async">${caption}</figure>`;
        },
      },
    },
  });
}
