# Jake DevWorks — first design preview

This is a reviewable visual prototype for rebuilding `www.jakeardoin.com` in the existing `GreatestJakeEVR/mywebsite` repository. The existing Django application is preserved. This folder does not change its routes or hosting.

An Astro + TypeScript implementation now lives in [`../portfolio/`](../portfolio/README.md). Keep this folder as the original visual/content reference. Its introductory wording in `index.html` remains unchanged. The prototype mirrors the reviewed pages and navigation, including the decorative hero-orbit overflow fix. See the [implementation review](../portfolio/REVIEW.md) for checks and remaining production work.

## Run

Use Node.js, with no package install required:

```sh
node server.mjs
```

Open `http://127.0.0.1:4173`. Verify with `node --check app.js` and `node verify.mjs`.

## Included

- Charcoal, purple, gold, and white design; responsive navigation and reduced-motion support.
- User-approved introduction, unchanged.
- Services for software/apps, business websites/online presence, and 3D design/printing.
- A separate `work/` page with five project summaries drawn from the uploaded résumé, existing repository, and owner's account of the Relief Telemed work, with filter controls and accessible project dialogs.
- Existing JA monogram and portrait; abstract project artwork represents the subject rather than screenshots of finished client websites.
- About section with accurately described NASA internship, LSU instruction, and education.
- A newly drafted introductory blog article for owner review.
- A blog welcome page at `blog/` linking to the introductory article, and a separate `creations/` page for 3D printing work and future HeyGears creations. The collection now includes owner-supplied photos of the trash bag dispenser, printed business card, question-block light, and geometric tiger magnet, plus a personal T-shirt concept and planned figurine services. Ordering and production workflows remain unfinished.
- Contact brief that opens a properly encoded email draft, with a manual copy fallback. It does not submit or send email automatically.

## Before production

The agreed production direction is Astro + TypeScript on Cloudflare, with Sanity Studio for browser editing. This prototype is plain HTML/CSS/JavaScript because framework package downloads were unavailable during this pass. It is not the completed CMS application.

1. Port the reviewed design into Astro components and TypeScript. Keep the existing application and cookbook available until their migration is decided.
2. Connect an owner-controlled Sanity project. Define posts, projects, and services; support drafts and previews. Keep write tokens server-side. Configure publish-triggered builds and backup/export instructions.
3. Replace the email-draft flow with a server-side contact endpoint if desired, using validated input, spam controls, and a transactional email provider. Confirm the receiving address before launch.
4. Review the drafted introductory article, résumé-derived copy, and use of client/project names. Add actual project imagery and 3D printing photographs when available. The planned HeyGears figurine service is described as a future goal; a full-color workflow and ordering are not yet available.
5. Connect the production GitHub branch to Cloudflare, configure DNS for `www.jakeardoin.com`, and redirect the apex domain to `www`. Preserve existing mail records during DNS changes.
6. Add canonical/Open Graph metadata, sitemap and robots policy, privacy information appropriate to the completed contact flow, then remove preview `noindex` metadata after launch approval.

## Content sources

- Owner's approved introduction and service descriptions in this conversation.
- `/My Website/jake_ardoin_resume.docx`, uploaded November 1, 2026.
- Existing repository at commit `955d3dbaeb679a51daa68a1965b6af362c0e1d04` for the portrait and cookbook context.
- Owner's `JA_logo.svg`, uploaded October 13, 2026; geometry preserved exactly.

Google Fonts supplies Space Grotesk and DM Sans when reachable; local system fonts are the fallback. The preview adds no analytics, cookies, account system, or persistent inquiry storage.
