import { getCliClient } from 'sanity/cli';
import { defaultContent } from '../src/data/default-content.ts';

const client = getCliClient({ apiVersion: '2026-11-01' });
let transaction = client.transaction();
for (const post of defaultContent.posts) transaction = transaction.createIfNotExists({ ...post, _type: 'post', slug: { _type: 'slug', current: post.slug } });
for (const project of defaultContent.projects) transaction = transaction.createIfNotExists({ ...project, _type: 'project', active: true });
for (const service of defaultContent.services) transaction = transaction.createIfNotExists({ ...service, _type: 'service', active: true });
await transaction.commit();
console.log('Imported reviewed welcome post, five work projects, and three services. Existing documents were not overwritten.');
