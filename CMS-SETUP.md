# Sanity and publication setup

## Connected resources

- Organization: Jake DevWorks (`o67rvnxgb`).
- Project: Jake DevWorks (`1n70ao73`).
- Public dataset: `production`, explicitly approved by the owner.
- Imported with `createIfNotExists`: the reviewed welcome post, five work projects, and three services. Existing documents are not overwritten.
- Hosted Studio: https://jakedevworks.sanity.studio/ (application `l82idbbpf83fh8c5dy0bse2c`, recorded in `sanity.cli.ts`).
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

1. Studio is deployed at https://jakedevworks.sanity.studio/. Verify its authenticated editor and set that address in `SANITY_STUDIO_URL`; `/admin/` forwards there and remains unindexed.
2. Configure the existing Git-integrated Cloudflare Pages project `jakeardoincom` for `GreatestJakeEVR/mywebsite`, production branch `master`: repository root (leave the root directory blank), Node 24, pnpm 11.25.0, output `dist`, build command `pnpm build:production`. `package.json`, the pnpm lockfile, and `wrangler.jsonc` now live at the root. The legacy Python application has been removed from the current tree so Cloudflare does not install its dependencies. The Wrangler file is the build configuration source: its `vars` declares `NODE_VERSION=24`, `SANITY_PROJECT_ID=1n70ao73`, `SANITY_DATASET=production`, `SANITY_STUDIO_URL=https://jakedevworks.sanity.studio`, and `REQUIRE_SANITY=true` for both production and preview. These are public configuration values; never add a credential or write token there. Dashboard-only variables were not passed to the build while the Wrangler file declared none.
3. Configure a Pages deploy hook and a Sanity webhook for published `post`, `project`, and `service` changes, excluding drafts/releases. Keep the deploy-hook URL secret and out of this repository. Verify publishing, editing, and unpublishing all rebuild the site. Future-dated posts require a rebuild at or after their publication date.
4. Run `pnpm build:production` and `node scripts/verify-build.mjs --production`. The production command generates canonical URLs, sitemap, indexing policy, headers, and public build metadata containing only project identifiers/editor origin. Ordinary previews remain unindexed.
5. Verify Pages before custom-domain cutover. DNS currently uses GoDaddy nameservers; the older homepage is still live. Associate `www.jakeardoin.com` with Pages before setting its GoDaddy CNAME. Apex Pages hosting requires Cloudflare nameservers; alternatively use a provider-managed apex-to-www redirect. Preserve existing verification/mail records and save previous routing for rollback.
6. Verify HTTPS, all routes, CMS publishing, and rollback. The old Django application and cookbook source remain recoverable from Git history at commit `f4181f95873a0c83b4f849b788b89d33d3595064`; they are no longer part of this website build.

Current handoff: Studio is deployed. `master` is the production source requested by the owner, and `jakeardoincom` is the Cloudflare Pages project name. The first Cloudflare build failed while installing the legacy root Python requirements; the Astro application has now replaced that root application. The next Cloudflare build, automatic rebuilds, authenticated editor behavior, and DNS cutover still need verification. No domain routing has been changed by these repository updates.
