import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: process.env.SANITY_STUDIO_PROJECT_ID, dataset: process.env.SANITY_STUDIO_DATASET },
  project: { basePath: '/' },
  deployment: { appId: 'l82idbbpf83fh8c5dy0bse2c' },
});
