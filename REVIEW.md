# Implementation review — November 1, 2026

## Acceptance criteria and result

- Continue the existing `codex/design-preview-2026-11-01` branch without rewriting history: the checkout began clean at `a59080c`; PR #4 was verified open and draft before preparing the changes.
- Read and render the original prototype before implementation: completed. Its original two-page verifier passed, including 36 local links/assets and exact approved introduction.
- Check package access: completed. Public npm registry access worked using Node's system certificate store; Astro 7.4.4, `@astrojs/check` 0.9.12, and TypeScript 5.9.3 installed with a committed pnpm lockfile.
- Port the visual design to Astro + TypeScript while preserving copy and assets: completed for the homepage and introductory article. `design-preview/index.html` is unchanged. Build verification confirms the exact introduction and byte-identical logo and portrait.
- Review desktop and mobile before and after the port: completed in the local browser. No production deployment was performed.

## Architecture and reuse evidence

The existing Django URL configuration routes `/` to `/home/` and includes `/admin/`, `/home/`, `/cookbook/`, and `/blog/`. Cookbook views use generic list/detail views over `Author` and `Recipe`. The current blog views are cookbook placeholders. The portfolio uses a separate build root and does not alter any of these routes or Python modules.

The cookbook models and migrations `0001`–`0003` were inspected: UUID primary keys, recipe-to-author foreign key with cascading deletion, unique recipe title and slugs, and the author-slug uniqueness migration remain unchanged. Blog model definitions were inspected as context. No tenancy model or tenant-scoped query layer was present in these inspected flows. No database schema, constraints, indexes, migrations, or queries were changed, and no database was started or profiled.

Reuse consists of the approved intro, all existing service/project/about/article copy, the SVG sculpture and CSS artwork, the original logo and portrait, global responsive styling, and the existing interaction behavior. Shared Astro layout/header/footer components avoid duplicating document metadata and navigation across routes. Project details use a typed local data module. Sanity remains a future integration rather than an implicit dependency or replacement for the existing database.

## Focused defect check

Before the fix, the original prototype's decorative hero orbits expanded a 390px viewport to 447px and a 320px viewport to 381px. Adding `overflow: clip` to `.hero-art` contains that decoration within its own region. The same corrected style is used by the Astro port. The original introduction HTML was not edited.

After the fix, browser assertions on the Astro homepage returned:

| Viewport width | Content width excluding scrollbar | Page scroll width |
| --- | --- | --- |
| 320 | 305 | 305 |
| 390 | 375 | 375 |
| 768 | 753 | 753 |
| 1440 | 1425 | 1425 |

The article also matched its available content width at 320, 390, and 1440px. Screenshots were reviewed for the hero, service/project layouts, portrait/about content, dialog, contact form, and article. The lazy portrait was confirmed loaded at its natural width of 334px when scrolled into view.

## Interaction evidence

On the built Astro preview:

- Mobile Menu expands with `aria-expanded=true`; Escape collapses it and restores focus to the menu button.
- Filters show 2 website projects, 1 personal project, 1 software project, and all 4 projects. The software filter announces `1 project shown.`
- The RFID dialog shows the correct NASA internship details. Escape closes it, removes body scroll locking, and restores focus to the triggering project button.
- The 3D service link selects `3D design & printing` in the contact form.
- Submitting the empty contact form leaves the required name field invalid.
- The email-app handoff was blocked by browser security policy. No bypass was attempted, and no email was sent. The pure email-preparation tests cover special characters, Unicode, newlines, exact fallback content, and blank required input. The actual OS mail client and clipboard fallback were not end-to-end verified.
- The article opens at `/blog/welcome/` and its home link returns to `/`.
- Browser console inspection returned no warnings or errors.

## Local gates

The following passed after the runtime changes:

- `pnpm check`: 0 errors, 0 warnings, 0 hints.
- `pnpm test`: 2 tests passed, 0 failed.
- `pnpm build`: 2 static pages built.
- `pnpm verify`: 2 built pages, 36 local links/assets, exact introduction, unique IDs/headings, preserved image bytes, and indexing-protection files.
- Original prototype: `node --check app.js` and `node verify.mjs` passed.

These checks do not establish production readiness. Sanity, Cloudflare deployment/headers, DNS, email delivery, other browser engines, physical devices, assistive technology, and real production data remain unverified. Reduced-motion support is preserved in CSS; a full accessibility audit and localized/RTL versions were not part of this pass. No CI workflow or deployment automation was added.

## Contact update — November 2, 2026

The owner requested that the website not print an email address and that contact drafts use `jakedevworks@gmail.com`. The Astro contact component and original prototype now use “Email Jake DevWorks” labels, including the fallback and noscript links. Both email builders use the business recipient and omit the `To:` line from the visible copy text. The approved introductory wording is unchanged.

The updated unit and built-page assertions failed against the previous implementation, then passed after the change. Fresh checks returned 0 Astro/TypeScript diagnostics, 2 passing unit tests, a successful 2-page build, and 36 valid local links/assets in each verifier. Browser assertions confirmed no owner address in visible page text, the correct recipient in every mailto link, and no horizontal overflow at 1440, 390, and 320px. The external email-app handoff and actual delivery remain unverified; no email was sent.

## Relief Telemed project — November 2, 2026

Added a fifth selected-work entry using the owner's description of Relief Telemed's COVID-19 vaccination events in Baton Rouge. The card and project dialog cover registration and vaccination documentation, Python/Django with PostgreSQL, React/TypeScript/JavaScript, CircleCI CI/CD, and Aptible hosting. No outcome metrics, compliance claims, or project URL were invented.

Changed `src/components/Work.astro`, `src/data/projects.ts`, and `src/styles/global.css`, plus their original-prototype counterparts and its README. The existing project-detail contract, dialog, and software filter are reused. The compact card spans the project grid to keep the five-entry desktop layout balanced. No database schema, migration, tenant boundary, or query changed; PostgreSQL is described only as part of this past project.

Fresh checks passed: 0 Astro/TypeScript errors, warnings, or hints; 2 unit tests; a 2-page build; both 36-link page verifiers; and whitespace checks. Browser assertions confirmed 5 total projects, 2 software projects, the Relief Telemed dialog content, Escape focus restoration, and no mobile page/dialog horizontal overflow at 390px. The owner's account is the content source; the historical platform and employment details were not independently verified. Deployment and email delivery remain outside this content change.

## Blog welcome and Creations pages — November 2, 2026

Added `/blog/` as a welcome page that introduces the topics and links to the preserved `/blog/welcome/` article. Added `/creations/` for 3D printing work, with an honest empty collection note and a separate “Coming later” HeyGears section. No finished creations, machine capabilities, or product photos were fabricated. Owner-supplied photos and project descriptions and the planned Sanity editor remain pending.

The two new page files reuse `BaseLayout`, `SiteHeader`, and `SiteFooter`. `BlogWelcome.astro` contains the welcome message; `WelcomePost.astro` shares the introductory post card with `Journal.astro`. Shared menu behavior moved from `portfolio.ts` into `navigation.ts` so the same mobile menu works across all four routes. Blog and Creations links appear in the header, and the mobile breakpoint moved to 740px to accommodate the expanded navigation. The prototype mirrors the new pages and navigation. No dependencies, database schema, hosting, or launch indexing policy changed.

Fresh gates passed with 0 Astro/TypeScript diagnostics, 2 unit tests, 4 built pages, and 77 local links/assets in both the Astro and prototype verifiers. The original approved introduction remains exact on the homepage and introductory article. Browser assertions covered homepage → blog → welcome article → blog, article → Creations, Creations → contact, and the existing software filter (2 projects). Mobile menus opened on Creations and the article; Escape closed the blog menu and restored button focus.

Visual review covered desktop and mobile. Both new pages matched their available content width at 320, 390, 740, 741, 768, and 1440px; Creations was also checked at 1024px. Screenshots were saved for both new pages. Actual creation content, Sanity editing, Cloudflare behavior, physical-device/browser-engine coverage, and production deployment remain unverified.

## Creations gallery and planned services — November 2, 2026

Replaced the empty collection with the owner’s trash bag dispenser, multicolor printed business card, Mario-inspired question-block light (two views), and geometric tiger magnetic sticker for LSU pride. A six-item anchor index makes the longer page navigable. The tiger copy describes hoped-for future sports-team designs and invites inquiries. The HeyGears section now describes the goal of personalized full-color figurines for wedding cake couples, children in sports outfits, family-photo keepsakes, MMO characters, and other ideas. Both the printing/color workflow and ordering remain planned. The custom T-shirt section uses only the right-hand shirt mockup from the supplied Team Albedo concept and explicitly describes it as a shirt the owner plans to make for himself.

Changed `src/pages/creations/index.astro`, shared CSS, both build verifiers, this review and the README files, with mirrored prototype HTML/styles and supplied assets. `scripts/convert-creation-photos.mjs` creates five full-size PNG conversions whose decoded pixels match the original JPGs, plus the requested shirt-only crop. Website copies preserve image proportions; WebP sources total about 1.16 MB with PNG fallbacks. Original uploads, homepage introduction, contact behavior, and dependency versions remain unchanged.

The focused section assertion failed on the prior build, then passed on the new output. Fresh gates returned 0 Astro/TypeScript errors, warnings, or hints; 2 passing contact tests; 4 built pages; and 97 validated local links/assets in each verifier, now including picture sources. Browser checks confirmed all six project photos load as WebP with descriptive alt text, all six index links target their sections, and figurine/shirt inquiries reach the existing contact form. The mobile menu opens; Escape closes it and restores button focus. No visible Gmail address or browser warning/error was found. Responsive assertions passed at 320, 390, 740, 741, 768, 1024, and 1440px with no horizontal overflow. Desktop and mobile screenshots cover the project gallery, figurines, and shirt mockup.

Separately, the dispenser design was imported into the owner’s existing private `3d_print_designs` repository. All 19 extracted files were hash-verified without changing their bytes; a newly repacked ZIP has 19 matching entries. All six STL meshes passed a fresh check for watertight edges, consistent winding, one connected component, positive volume, and no degenerate triangles. The supplied ZIP was absent, so the archive is explicitly labeled as repacked from the extracted folder. No private CAD, original preflight documents, or technique-library references were copied to the public website. An independent read-only cross-project review found no actionable issues.

Unverified boundaries: physical v6 spring behavior/durability, full-color figurine production, T-shirt manufacture, commerce/inventory, Sanity editing, Cloudflare deployment, external email delivery, other browser engines, assistive technology, physical devices, and localized/RTL versions. No production launch was performed.

## Separate Work page — November 2, 2026

Moved the five selected-work projects and their dialog from the homepage to `/work/`, preserving the project descriptions, filters, and detail content. The header’s Work link and homepage’s “Explore my work” link now open that route, with Work marked as the current navigation item. The new page uses one primary heading and second-level project headings. The workbench callout links to the existing Creations page; dialog inquiries return to `/#contact`. Homepage section numbers were adjusted after removing the gallery, and the approved introductory wording remains exact.

Changed the homepage and new Work route, shared header, hero, Work and dialog components, three homepage section labels, shared CSS, and matching static prototype pages. Project interactions moved from `scripts/portfolio.ts` into `scripts/work.ts`; homepage contact/service behavior stays in `portfolio.ts`. Both verifiers now cover five pages. The visible-email assertion excludes script/style content because Astro now inlines the smaller contact script; the business recipient remains in code without being printed on the page.

The focused assertion failed against the previous homepage, then passed with the gallery on its own route. Fresh checks passed with 0 Astro/TypeScript errors, warnings, or hints; 2 contact tests; a 5-page build; 111 local links/assets in the Astro verifier and 112 in the static prototype verifier; and a syntax check of the prototype script. Browser assertions covered homepage navigation and hero → Work, all four filters (5 total, 2 software, 2 websites, 1 personal), keyboard opening and Escape closing all five dialogs with focus restored, dialog → homepage contact, homepage 3D-service selection, and Work → Creations. The mirrored prototype’s software filter, Relief Telemed dialog, and contact/home navigation also passed with no console warnings or errors.

Desktop and mobile screenshots were reviewed. Work had no horizontal overflow at 320, 390, 740, 741, 768, 1024, and 1440px. At 390px the project dialog had no horizontal overflow; the mobile menu opened and Escape closed it with focus restored. The tested UI is English/LTR. Physical devices, other browser engines, assistive technology, localized/RTL variants, external email delivery, Sanity, and production hosting remain unverified. No dependencies, Django routes, database schema, or launch policy changed.

## Sanity connection and launch preparation — November 2, 2026

Connected the owner-approved Jake DevWorks organization/project and public `production` dataset, and imported the reviewed welcome post, five work projects, and three services with non-overwriting `createIfNotExists` operations. The approved homepage introduction stays outside the CMS. Added Studio schemas/configuration, published-only server/build queries, dynamic blog routes/cards, dynamic services and work cards/details, escaped rich-text rendering, an unindexed editor forwarding route, and a guarded production-build command. The ordinary local build remains a noindex preview; production output requires a real hosted Studio URL and CMS connection. See `CMS-SETUP.md` for exact resource identifiers and remaining steps.

Reuse consists of the existing Astro layout/header/footer, service/project/contact contracts, artwork, filters, dialogs, approved text, and image assets. The local seed is an extracted copy of reviewed content. No Django routes, migrations, database queries, or production data stores were changed. React dependencies serve the separate Studio bundle; website visitors do not receive its runtime. Dependency pins and the lockfile now include the official Sanity client, Portable Text renderer, Studio, Cloudflare CLI, and compatible TypeScript/Node types. Only esbuild and workerd are allowed dependency build scripts; temporary package-age exceptions were removed.

The focused CMS tests initially failed for the missing implementation, then passed. An independent security review traced CMS fields through HTML, URLs, JSON, and dialog text. It identified string-coercion checks for slugs/keys and a stale welcome-post link; both were fixed with regression coverage and a permanent list-anchor CTA. Tests cover draft/release/future exclusion, invalid/duplicate slugs and keys, escaped markup and unsafe links, and the existing contact helper. Local website and Studio builds passed; the website built six routes and its verifier checked 110 local links/assets, exact homepage introduction, IDs/headings, preserved logo/portrait bytes, and preview indexing. The Studio build included only the public project/dataset identifiers as environment variables.

Unverified: the updated CMS-backed layout in a browser, authenticated live Studio editing, hosted Studio deployment, production build with an actual deployed editor, automatic CMS publish/edit/unpublish rebuilds, Cloudflare deployment/headers, custom-domain/DNS cutover, mail handoff, and rollback. Native Chrome automation was stopped because the browser URL could not be verified confidently. CLI authentication and the Sanity import succeeded; no live domain or DNS record was changed. This checkpoint is launch preparation, not a claim that the new site is published.

## Production branch and project name — November 2, 2026

The owner requested `master` as production source and `jakeardoincom` as the Cloudflare Pages project name. Added `wrangler.jsonc` with that exact name, `./dist` output, and compatibility date; recorded the deployed Studio application ID in `sanity.cli.ts`; updated the current setup/readme guidance. Sanity CLI reported successful deployment to https://jakedevworks.sanity.studio/ with application ID `l82idbbpf83fh8c5dy0bse2c`.

Before updating master, the remote master was fetched explicitly and verified as an ancestor of the portfolio branch, allowing a normal fast-forward without rewriting history. Astro/TypeScript checking and all six tests passed. The production build used the real published Sanity dataset and deployed editor URL; it produced six pages, five public sitemap routes, and passed 109 local link/asset checks, exact introduction, heading/ID checks, preserved images, canonical URLs, and production indexing policy. Cloudflare configuration and whitespace checks passed.

Cloudflare account publication, automatic rebuilds, authenticated Studio editing, custom-domain routing, DNS, and browser review of the CMS-backed build remain unverified. Updating GitHub master does not itself establish that the Cloudflare site is deployed or that the live domain has changed.

## Repository root replacement — November 2, 2026

At the owner’s request, moved the complete Astro application from `portfolio/` to the repository root and removed the former Django apps, database-import scripts/data, Python dependency and process entrypoints, Docker files, and Python editor configuration. The pre-removal source remains in Git history at `f4181f95873a0c83b4f849b788b89d33d3595064`. The original `design-preview/` is retained as the approved wording/asset reference.

Updated the two script-relative prototype paths, root generated-file/credential ignores, and current setup docs. The package, lockfile, Astro config, Studio config/application ID, Wrangler project name/output, source components, styles, tests, and public assets were reused. The cookbook’s source link now targets the preserved historical commit in both local content and its single published Sanity project; the update used a revision condition and preserved other fields. Its copy now describes an earlier repository version. No other CMS document was changed.

The root-layout check failed before the move because the root had no package.json; it now passes with the Astro package/config and no legacy Python application entrypoints. Frozen dependency install passed. Astro/TypeScript checked 43 files with 0 errors, 0 warnings, and 0 hints; all 6 tests passed. The standalone Studio built successfully. The real-CMS production build produced 6 pages and passed 109 local link/asset checks, exact approved introduction, preserved logo/portrait, heading/ID checks, canonical URLs, sitemap, and indexing policy. The static prototype passed 5 pages and 112 links/assets. Git-normalized content comparison confirmed 47 unchanged source/test/public files and 8 unchanged configuration/lock files. The independent migration reviewer found no remaining blocker after the root dependency links were recreated.

Cloudflare should build from the repository root (leave Root directory blank), production branch master, command `pnpm build:production`, output `dist`. No computer control, DNS change, or new deployment project was used for this migration. Hosted build success after pushing, browser review of the hosted site, automated CMS rebuilds, authenticated Studio editing, and custom-domain cutover remain separate verification boundaries. Earlier review entries describe historical checkpoints before this replacement.

### Cloudflare configuration follow-up

The root migration build successfully installed Astro dependencies and eliminated the Python dependency error. Its next failure came from missing Sanity variables: the Cloudflare log explicitly reported “Build environment variables: (none found)” when reading the root Wrangler file, even though dashboard variables were saved. Added the five public Node/Sanity settings to `wrangler.jsonc` so the repository carries its build configuration. No credentials are included. The public dataset setting was also added to the existing project through the API; unrelated variables were verified unchanged. No browser/computer control was used.

A focused check verified all five declared settings, then the production build was run using the Wrangler values. Both it and the 6-page/109-link production verifier exited 0. Whitespace checks passed. The next hosted build remains to be checked after this commit; the earlier retry still lacked variables because the file declared none.

## Homepage simplification — November 2, 2026

Removed numeric prefixes from the homepage’s Services, About, and Contact section labels, removed Services from the shared top navigation, and removed the homepage “Notes from the workbench / Behind the build” teaser. The unused Journal component was deleted; the blog and its welcome-post card remain available on their own routes. Mirrored the changes in the static prototype, updated the current README, and extended the existing output verifiers to check these owner requirements. The approved Hero introduction, service cards, process steps, contact behavior, and shared layouts are reused unchanged.

The rendered-output check failed against the prior output’s Services navbar link, then passed after rebuilding. Astro/TypeScript checked 42 files with 0 errors, 0 warnings, and 0 hints. All 6 existing tests passed. The real-CMS production build generated 6 pages; its verifier passed 102 local links/assets, the requested removals, exact approved intro, headings/IDs, images, and indexing policy. The static prototype passed 5 pages and 105 links/assets. Browser layout review was not rerun, and the hosted deployment for this commit remains to be verified after pushing. No computer control or DNS changes were used.

## Direct contact submission — November 2, 2026

The owner requested sending inquiries from the website without opening a visitor’s email app and selected FormSubmit. Reused the existing form fields, service selection, layout, and business inbox. Replaced the mailto-draft script with a same-origin POST, pending/success/error states, disabled controls while sending, and preserved input on failures. Added a bounded, validating Cloudflare Pages Function with a fixed FormSubmit recipient, field allowlist, honeypot, no-cache responses, safe no-JavaScript confirmation, strict provider-success checks, and timeout/error handling. Only the contact route invokes the function. Removed the obsolete draft helper/tests; the historical static prototype keeps its offline draft demonstration. No dependencies, credentials, DNS, or CMS content changed.

The focused contact tests failed before implementation, then all 9 tests (5 contact, 4 CMS) passed. Astro/TypeScript checked 42 files with 0 errors, 0 warnings, and 0 hints. The real-CMS production website build generated 6 pages and passed 102 local links/assets, unchanged intro/assets, contact markup, route limits, and indexing policy. Wrangler compiled the function successfully. The installed local runtime required a local-only October 30 compatibility override; production’s configured November 2 date was preserved. Local Cloudflare HTTP checks passed GET rejection, invalid input, cross-origin rejection, honeypot suppression, and serving the direct-send homepage, without sending mail. Independent security review found no code-level blocker; it confirmed the fixed recipient, bounded parsing, safe output, and provider failure handling.

Real FormSubmit requests from this machine timed out; a local runtime submission returned a network sending error. Activation and actual inbox delivery therefore remain unverified. The feature is prepared for a branch preview so hosted outbound delivery can be checked before replacing the live form. FormSubmit requires the receiving owner to click its one-time Activate Form email. Native/physical-browser interaction and stronger bot/rate limiting were not tested or added; see CONTACT-SETUP.md for precise boundaries. No computer control was used.

### Contact runtime follow-up

The first preview’s outbound call exposed a Workers-specific incompatibility: the Fetch-standard redirect mode error is not supported at the edge. A local runtime trace identified the rejected request option. Replaced it with manual mode and retained the existing non-2xx rejection, so redirects are not followed and form data cannot be forwarded to another destination. Removed the temporary sanitized local diagnostic before committing. Added regression coverage for the manual redirect policy and a 302 provider response. All 9 tests and whitespace checks pass. The local runtime now attempts delivery and returns a timed-out network error after 15 seconds; the corrected hosted preview still needs provider/activation/inbox verification.

### Recipient alias and custom-domain handoff

The owner supplied FormSubmit’s opaque recipient alias. Replaced the email address in the provider URL with that exact alias and updated the fixed-destination test. The owner reports that the activation link itself times out; activation remains unconfirmed. A direct alias test still timed out after 40 seconds. The 9 tests, Worker compilation, and whitespace checks pass; actual delivery remains unverified and master keeps the existing form.

For the reported missing www site, public DNS confirmed GoDaddy nameservers and the previous www A values 151.101.1.195/151.101.65.195. HTTPS still redirected to the old apex homepage; the Pages URL serves the new site. The existing Pages project had no custom domains. Associated www.jakeardoin.com through Cloudflare’s API; it returned initializing/pending verification. Prepared DOMAIN-SETUP.md with the exact GoDaddy CNAME replacement, scope, prior records, and rollback. No GoDaddy record or nameserver was changed. Domain activation awaits the owner’s DNS update and subsequent public HTTPS verification.
