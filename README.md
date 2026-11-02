# Jake Ardoin / Jake DevWorks

The portfolio rebuild is in [`portfolio/`](portfolio/README.md): Astro + TypeScript, with the reviewed charcoal, purple, gold, and white design. `master` is its production source for the Cloudflare Pages project `jakeardoincom`.

- [`design-preview/`](design-preview/README.md) is the original dependency-free visual reference. Its approved introductory wording in `index.html` is preserved exactly.
- The Django application (`backend/`, `home/`, `blog/`, `cookbook/`) and its database migrations remain in place. The portfolio build does not run or replace them.
- Sanity is connected to the owner-approved Jake DevWorks project and seeded with the reviewed content. The [content editor](https://jakedevworks.sanity.studio/) is deployed. Automatic rebuilds, Cloudflare publication, and domain cutover remain to be verified. See [`portfolio/CMS-SETUP.md`](portfolio/CMS-SETUP.md). These repository changes do not change the live domain.

See [`portfolio/REVIEW.md`](portfolio/REVIEW.md) for verification evidence and remaining boundaries.
