import { createClient } from '@sanity/client';
import { defaultContent } from '../data/default-content.ts';
import { publicDocument, publishedPosts, safeUrl, text, type Post } from './content-model.ts';
import type { ProjectDetail } from '../data/projects.ts';

export interface Project extends ProjectDetail {
  _id: string; key: string; filter: 'websites' | 'software' | 'personal';
  summary: string; labels: string[]; visual: 'electronics' | 'nasa' | 'compact';
  symbol?: string; wide?: boolean; order: number;
}
export interface Service {
  _id: string; key: string; title: string; description: string;
  features: string[]; cta: string; selection: string; icon: string; order: number;
}
export interface Content { posts: Post[]; projects: Project[]; services: Service[] }

export function validateContent(input: Content): Content {
  const posts = publishedPosts(input.posts);
  const keys = new Set<string>();
  const projects = input.projects.filter(publicDocument).map(project => {
    if (typeof project.key !== 'string' || !/^[a-z0-9-]+$/.test(project.key) || keys.has(project.key)) throw new Error('Invalid or duplicate project key');
    keys.add(project.key);
    text(project.title, 'project title'); text(project.summary, 'project summary'); text(project.category, 'project category');
    if (!['websites', 'software', 'personal'].includes(project.filter)) throw new Error('Invalid project filter');
    if (!['electronics', 'nasa', 'compact'].includes(project.visual)) throw new Error('Invalid project artwork');
    for (const field of [project.paragraphs, project.skills, project.labels]) {
      if (!Array.isArray(field) || !field.length || field.some(item => typeof item !== 'string')) throw new Error('Invalid project text');
    }
    return { ...project, url: safeUrl(project.url) };
  });
  keys.clear();
  const services = input.services.filter(publicDocument).map(service => {
    if (typeof service.key !== 'string' || !/^[a-z0-9-]+$/.test(service.key) || keys.has(service.key)) throw new Error('Invalid or duplicate service key');
    keys.add(service.key);
    for (const field of ['title', 'description', 'cta', 'selection', 'icon'] as const) text(service[field], `service ${field}`);
    if (!['Software & apps', 'Websites & online presence', '3D design & printing'].includes(service.selection)) throw new Error('Invalid service contact selection');
    if (!Array.isArray(service.features) || !service.features.length || service.features.some(item => typeof item !== 'string')) throw new Error('Invalid service features');
    return service;
  });
  if (!services.length || !projects.length) throw new Error('Sanity must contain published services and projects before launch');
  return { posts, projects, services };
}

let pending: Promise<Content> | undefined;
export function getContent(): Promise<Content> {
  return pending ??= loadContent();
}

async function loadContent(): Promise<Content> {
  const projectId = import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
  const dataset = import.meta.env.SANITY_DATASET || process.env.SANITY_DATASET;
  const required = process.env.REQUIRE_SANITY === 'true' || process.env.PUBLISH_SITE === 'true';
  if (!projectId && !dataset && !required) return validateContent(defaultContent);
  if (!projectId || !dataset) throw new Error('Set SANITY_PROJECT_ID and SANITY_DATASET to connect your owner-controlled Sanity project.');
  const client = createClient({ projectId, dataset, apiVersion: '2026-11-01', useCdn: false, perspective: 'published' });
  // Server/build-only read. No write token, drafts, or Studio authentication enters the website bundle.
  const content = await client.fetch<Content>(`{
    "posts": *[_type == "post" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(publishedAt desc) {
      _id, title, "slug": slug.current, excerpt, publishedAt, category, author,
      body[]{..., _type == "image" => {"url": asset->url}}
    },
    "projects": *[_type == "project" && active != false] | order(order asc) {
      _id, key, title, category, paragraphs, skills, url, note, filter, summary, labels, visual, symbol, wide, order
    },
    "services": *[_type == "service" && active != false] | order(order asc) {
      _id, key, title, description, features, cta, selection, icon, order
    }
  }`);
  return validateContent(content);
}
