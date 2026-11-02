# Jake DevWorks portfolio

An Astro + TypeScript port of the original design preview, kept alongside the existing Django application. The homepage, blog landing page, introductory article, and Creations page build to static HTML. Shared navigation runs on every page; project and contact interactions run only on the homepage. No React runtime or server adapter is required for this static output.

## Run and check

Use Node.js 22.23.4 or later (an even-numbered supported release) and pnpm 11.25.0, pinned in `package.json`. Development was verified with Node 24.22.1.

```sh
cd portfolio
pnpm install --frozen-lockfile
pnpm dev
```

The default development URL is `http://127.0.0.1:4321`. To check and review the actual output:

```sh
pnpm check
pnpm test
pnpm build
pnpm verify
pnpm preview
```

`check` checks Astro and TypeScript; `test` checks contact email encoding and blank input; `verify` checks the four built pages, their local links and anchors, the exact approved introduction, original asset bytes, and preview indexing protections. Run `build` before `verify`.

On this Windows machine, the bundled pnpm CLI is available through Node if `pnpm` is not on PATH:

```powershell
$pnpmCli = 'C:/Users/jake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pnpm/bin/pnpm.cjs'
$env:NODE_USE_SYSTEM_CA = '1'
$env:ASTRO_TELEMETRY_DISABLED = '1'
node $pnpmCli install --frozen-lockfile
node $pnpmCli check
node $pnpmCli test
node $pnpmCli build
node $pnpmCli verify
node $pnpmCli preview
```

The system CA option resolved the local registry certificate-chain error without disabling TLS validation. The telemetry option avoids a config write outside the workspace in the restricted environment. These are local process settings, not deployment requirements.

## Editing and architecture

- `src/pages/` defines `/`, `/blog/`, `/blog/welcome/`, and `/creations/`.
- `src/layouts/BaseLayout.astro` shares document metadata, fonts/styles, and the skip link. `src/components/` contains the homepage sections, header, footer, and project dialog.
- `src/data/projects.ts` contains typed project-detail copy, reused from the prototype. Services and article copy are still local Astro content.
- `src/scripts/navigation.ts` handles the shared menu. `src/scripts/portfolio.ts` handles accessible project dialogs and filters, service selection, and the email-draft fallback. `src/lib/project-email.ts` creates the encoded draft without sending anything.
- `public/assets/` preserves the original logo and portrait; `src/styles/global.css` reuses the prototype styling, including the mobile orbit-overflow fix.
- The source of approval remains `../design-preview/index.html`. Its introductory wording must match the built pages exactly. Do not rewrite it during CMS migration.

## Blog and creations content

`src/components/BlogWelcome.astro` introduces the blog. `WelcomePost.astro` is reused on the homepage and blog landing page; the existing welcome article remains at `/blog/welcome/`.

`src/pages/creations/index.astro` shows the owner’s trash bag dispenser, printed business card, Mario-inspired question-block light (two views), and geometric tiger magnetic sticker. It also describes planned personalized full-color figurines and custom T-shirts, with the supplied Team Albedo shirt mockup labeled as a personal concept. HeyGears, coloring, and ordering workflows are still in development; the page offers inquiries rather than checkout. No CMS editor or inventory system is connected.

`node scripts/convert-creation-photos.mjs SOURCE_DIRECTORY FULL_SIZE_PNG_DIRECTORY SHIRT_CONCEPT_PATH` creates pixel-checked full-size PNG conversions of the five supplied JPGs, crops only the shirt half of the supplied 1536 × 1024 concept, and writes smaller website PNGs plus WebP alternatives into both preview asset directories. The original uploads are unchanged; metadata is omitted from the generated files. Each picture uses a WebP source with a PNG fallback. Private CAD and technique files stay in the private 3D-print repository, outside the public website.

The new blog/creations pages and updated article are also mirrored as static HTML in `../design-preview/`; they run without package installation.

## Cloudflare and launch boundary

The current output is `portfolio/dist/`. A future Cloudflare build should use `portfolio` as its project root, install with the committed pnpm lockfile, and run `pnpm build`. Static Astro output can be served on Cloudflare without a runtime adapter; see the [Cloudflare Astro guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/).

`BaseLayout.astro` keeps `noindex,nofollow`; `public/robots.txt` disallows crawling; `public/_headers` adds `X-Robots-Tag: noindex, nofollow` for Cloudflare static assets. The local Astro preview does not emulate Cloudflare's `_headers` behavior. See [Cloudflare header handling](https://developers.cloudflare.com/workers/static-assets/headers/).

No Cloudflare project, build hook, DNS records, redirects, or custom domains were configured. Keep the current Django site and cookbook hosting available until their migration is decided. Preserve mail DNS records during any later domain cutover. Add final canonical/Open Graph metadata, sitemap, appropriate privacy information, and a launch indexing policy before removing the preview protections.

## Sanity and contact work still pending

Sanity is not connected, and no project identifiers, datasets, credentials, Studio, schemas, or import jobs have been invented. Next, use an owner-controlled project to define posts, projects, and services, preserving the existing content and approved introduction. Add validated content queries, published-only builds, authenticated draft preview, publish-triggered builds, and backup/export instructions. Keep write and preview tokens out of browser bundles.

Contact opens a draft addressed to `jakedevworks@gmail.com`, with a manual copy fallback. The page uses “Email Jake DevWorks” labels and omits the recipient from the visible fallback text. The business address is still present in the mailto links and client code. This flow has no server endpoint, delivery provider, spam checks, or persistent inquiry storage. Decide whether to keep it or replace it with server-side delivery before launch. The local browser security policy blocked testing the external email-app handoff; it was not bypassed.

Owner review of the drafted article, résumé-derived background, client names, and project imagery is still needed as described in the original prototype handoff. Google Fonts remains an external request with system-font fallback.
