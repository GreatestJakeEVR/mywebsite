import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
if (!projectId || !dataset) throw new Error('Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in .env.local before starting Studio.');

export default defineConfig({
  name: 'jake-devworks', title: 'Jake DevWorks', projectId, dataset,
  plugins: [structureTool()], schema: { types: schemaTypes },
});
