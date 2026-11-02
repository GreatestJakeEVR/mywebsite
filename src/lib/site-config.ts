export const isProduction = (import.meta.env.PUBLISH_SITE || process.env.PUBLISH_SITE) === 'true';
export const studioUrl = import.meta.env.SANITY_STUDIO_URL || process.env.SANITY_STUDIO_URL || '';
