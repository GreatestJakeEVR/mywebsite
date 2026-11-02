import { defineArrayMember, defineField, defineType } from 'sanity';

const requiredString = (name: string, title = name) => defineField({ name, title, type: 'string', validation: rule => rule.required() });
const strings = (name: string, title = name) => defineField({ name, title, type: 'array', of: [{ type: 'string' }], validation: rule => rule.required().min(1) });
const active = defineField({ name: 'active', title: 'Show on website', type: 'boolean', initialValue: true });
const order = defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0, validation: rule => rule.required().integer().min(0) });
const key = defineField({ name: 'key', title: 'Stable project/service key', type: 'string', description: 'Keep existing keys unchanged. New keys use lowercase letters, numbers, and hyphens.', validation: rule => rule.required().regex(/^[a-z0-9-]+$/) });
const webUrl = (name: string, title: string) => defineField({ name, title, type: 'url', validation: rule => rule.uri({ scheme: ['https', 'http'], allowRelative: false }) });

export const post = defineType({
  name: 'post', title: 'Blog posts', type: 'document',
  fields: [
    requiredString('title', 'Title'),
    defineField({ name: 'slug', title: 'URL slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: rule => rule.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || 'Use lowercase letters, numbers, and hyphens.') }),
    defineField({ name: 'excerpt', title: 'Short introduction', type: 'text', rows: 3, validation: rule => rule.required().max(300) }),
    defineField({ name: 'publishedAt', title: 'Publication date', type: 'datetime', initialValue: () => new Date().toISOString(), description: 'Future dates remain hidden until that date and the next website rebuild.', validation: rule => rule.required() }),
    defineField({ name: 'category', title: 'Category', type: 'string', initialValue: 'FROM THE WORKBENCH' }),
    defineField({ name: 'author', title: 'Author', type: 'string', initialValue: 'Jake DevWorks' }),
    defineField({ name: 'body', title: 'Post content', type: 'array', validation: rule => rule.required().min(1), of: [
      defineArrayMember({ type: 'block', styles: [{ title: 'Normal', value: 'normal' }, { title: 'Heading', value: 'h2' }, { title: 'Subheading', value: 'h3' }, { title: 'Quote', value: 'blockquote' }], lists: [{ title: 'Bullets', value: 'bullet' }, { title: 'Numbered', value: 'number' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }, { title: 'Code', value: 'code' }], annotations: [{ name: 'link', type: 'object', title: 'Link', fields: [webUrl('href', 'Web address')] }] } }),
      defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Describe this image', type: 'string', validation: rule => rule.required() }), defineField({ name: 'caption', title: 'Caption', type: 'string' })] }),
    ] }),
  ],
  orderings: [{ title: 'Newest first', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publishedAt' } },
});

export const project = defineType({
  name: 'project', title: 'Work projects', type: 'document',
  fields: [key, requiredString('title', 'Title'), requiredString('summary', 'Card summary'),
    defineField({ name: 'filter', title: 'Project category', type: 'string', options: { list: ['websites', 'software', 'personal'] }, validation: rule => rule.required() }),
    strings('labels', 'Short card labels'), requiredString('category', 'Detail heading'),
    strings('paragraphs', 'Project description paragraphs'), strings('skills', 'What the work involved'),
    webUrl('url', 'Project link'), defineField({ name: 'note', title: 'Additional note', type: 'text' }),
    defineField({ name: 'visual', title: 'Card artwork', type: 'string', options: { list: [{ title: 'Compact / monogram', value: 'compact' }, { title: 'Electronics wordmark', value: 'electronics' }, { title: 'RFID illustration', value: 'nasa' }] }, initialValue: 'compact', validation: rule => rule.required() }),
    defineField({ name: 'symbol', title: 'Compact card monogram', type: 'string', validation: rule => rule.max(8) }),
    defineField({ name: 'wide', title: 'Use full row for compact card', type: 'boolean', initialValue: false }), order, active,
  ],
  orderings: [{ title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});

export const service = defineType({
  name: 'service', title: 'Services', type: 'document',
  fields: [key, requiredString('title', 'Title (line breaks supported)'),
    defineField({ name: 'description', title: 'Description', type: 'text', validation: rule => rule.required() }),
    strings('features', 'Service features'), requiredString('cta', 'Contact link label'),
    defineField({ name: 'selection', title: 'Contact form category', type: 'string', options: { list: ['Software & apps', 'Websites & online presence', '3D design & printing'] }, validation: rule => rule.required() }),
    defineField({ name: 'icon', title: 'Icon', type: 'string', options: { list: ['</>', '↗', '◇'] }, validation: rule => rule.required() }), order, active,
  ],
  orderings: [{ title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});

export const schemaTypes = [post, project, service];
