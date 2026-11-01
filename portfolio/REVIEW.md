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
