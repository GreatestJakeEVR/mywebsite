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
