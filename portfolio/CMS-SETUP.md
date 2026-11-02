# Sanity and publication setup

## Connected resources

- Organization: Jake DevWorks (`o67rvnxgb`).
- Project: Jake DevWorks (`1n70ao73`).
- Public dataset: `production`, explicitly approved by the owner.
- Imported with `createIfNotExists`: the reviewed welcome post, five work projects, and three services. Existing documents are not overwritten.
- Sanity and Cloudflare CLIs are authenticated locally. Credentials remain outside this repository. Website reads require no API token.

## Architecture and editing

`sanity.config.ts` and `sanity/schemaTypes.ts` define the standalone editor for posts, projects, and services. Posts support rich text, links, images with alternative text, slugs, excerpts, authors, and publication dates. The approved homepage introduction remains outside the CMS in `Hero.astro`.

`src/lib/content.ts` reads published content during the static website build, without CDN caching. Drafts, content-release versions, and future-dated posts are excluded. A failed CMS request or invalid content fails the build rather than silently publishing incomplete content. Without Sanity configuration, local previews use the reviewed `default-content.ts`. Production builds require the real connection.

Studio builds are separate. React is used by the editor, not shipped to portfolio visitors. Website bundles contain no Studio credentials or write tokens. Published project JSON escapes script delimiters; dialogs insert text; Portable Text escapes markup and permits HTTP/HTTPS web links only. Rich-text images are limited to the Sanity CDN.

## Commands

Copy `.env.example` to ignored `.env.local`. Use project ID `1n70ao73` and dataset `production` for the website and Studio. Set `SANITY_STUDIO_URL` only after its hosted HTTPS address is assigned.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm verify
pnpm studio:dev
pnpm studio:build
```

`pnpm cms:seed` uses the signed-in CLI user for the initial import. For backup, use `sanity datasets export production` and store exports privately, outside Git.

## Still required to publish

1. Deploy Studio to an owner-controlled Sanity hostname and verify its authenticated editor. Set that actual URL in `SANITY_STUDIO_URL`; `/admin/` forwards there and remains unindexed.
2. Configure a Git-integrated Cloudflare Pages project for `GreatestJakeEVR/mywebsite`: root `portfolio`, Node 24, pnpm 11.25.0, output `dist`, build command `pnpm build:production`. Set the Sanity identifiers and actual Studio URL as build variables. A Direct Upload Pages project cannot later switch to Git integration, so do not create that kind for this workflow.
3. Configure a Pages deploy hook and a Sanity webhook for published `post`, `project`, and `service` changes, excluding drafts/releases. Keep the deploy-hook URL secret and out of this repository. Verify publishing, editing, and unpublishing all rebuild the site. Future-dated posts require a rebuild at or after their publication date.
4. Run `pnpm build:production` and `node scripts/verify-build.mjs --production`. The production command generates canonical URLs, sitemap, indexing policy, headers, and public build metadata containing only project identifiers/editor origin. Ordinary previews remain unindexed.
5. Verify Pages before custom-domain cutover. DNS currently uses GoDaddy nameservers; the older homepage is still live. Associate `www.jakeardoin.com` with Pages before setting its GoDaddy CNAME. Apex Pages hosting requires Cloudflare nameservers; alternatively use a provider-managed apex-to-www redirect. Preserve existing verification/mail records and save previous routing for rollback.
6. Verify HTTPS, all routes, CMS publishing, and rollback. Keep the existing Django application/cookbook available until their migration is decided; this change does not move them.

Checkpoint: the CMS is connected/imported, and local site/Studio builds pass. Studio and the new site are not yet deployed, automated rebuilds are not configured, and DNS has not changed. Native Chrome automation stopped because it could not verify the current URL; no dashboard or DNS mutations were made through it.
