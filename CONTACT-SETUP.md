# Contact form delivery

The owner selected [Web3Forms](https://web3forms.com/) after the previous provider failed. Inquiries go to the form created under `jakedevworks@gmail.com` without requiring a visitor to open an email app. The owner supplied the public form access key. [Web3Forms documents that this identifier is intended for public client-side code](https://web3forms.com/#faq); it is not a private account API credential. The page does not display the receiving inbox address.

## Current flow

The homepage's **Send message** action submits JSON directly from the browser to `https://api.web3forms.com/submit`, following the [Web3Forms API contract](https://docs.web3forms.com/getting-started/api-reference.md). `src/lib/contact.ts` fixes the public form key, subject, and sender display name. It forwards only name, email, service, message, reply address, and the optional checked `botcheck` field. Browser credentials are omitted. No Gmail password, private API secret, automatic visitor response, CC, or webhook is configured. Visitor-supplied delivery settings cannot override the fixed key/options.

The existing script disables controls while sending, displays accessible pending/success/error feedback, clears the form only after an HTTP success with JSON `success: true`, and preserves input if acceptance cannot be confirmed. HTTP errors, redirects, invalid JSON, string/false success values, timeouts, and network/CORS errors do not produce a success message. There is no automatic retry or fallback resend: an ambiguous network failure could occur after delivery. Provider response text and visitor details are not logged or inserted into the page.

Without JavaScript, the normal form action posts to Web3Forms with the fixed hidden key/subject/from-name fields and redirects to its documented `https://web3forms.com/success` confirmation page. That redirect field is deliberately excluded from the AJAX payload, which keeps visitors on the homepage. The optional **Email Jake DevWorks** link remains available. It does not print the address, though its mailto URL is readable in the page source.

Web3Forms processes the submitted personal information under its [privacy terms](https://web3forms.com/privacy), linked from the form. Its current policy describes storage of submission data for up to three years, with shorter retention configurable in the service. This site does not store inquiries in its own database. The provider-supported hidden `botcheck` checkbox and provider filtering reduce basic spam; the provider describes the honeypot as less effective than a CAPTCHA. Client-side validation is usability protection, not a server-side security boundary or global rate limiter. No paid-only options are enabled.

## Delivery history and verification

The original FormSubmit server proxy returned upstream HTTP 429 and was replaced by its browser flow. The owner confirmed that flow worked, then later reported another sending failure. A real diagnostic returned FormSubmit HTTP 522 with an origin connection timeout; its homepage and documentation also timed out. The owner approved Web3Forms and created the new form under the business email.

The removed Cloudflare function remains in Git history at `97a2650`. The original static `design-preview/` retains its historical offline email-draft demonstration; production builds use the Astro source at the repository root. There is no server-side email proxy or new runtime dependency.

## Verification boundaries

`node --test tests/contact-delivery.test.mjs` checks the fixed Web3Forms destination/key, exact field allowlist, message/reply-address preservation, input validation, boolean spam trap, strict acceptance checks, and no retries on delivery failures. `pnpm check`, the production build, and `node scripts/verify-build.mjs --production` check TypeScript, rendered native form configuration/privacy link, direct-send browser bundle, links/assets, and unchanged approved introduction.

Web3Forms' free integration is browser-side; its API reference requires a paid plan and IP whitelisting for server-side usage. Do not treat a Node/server POST as a supported free-plan delivery test or spoof a browser to get around that restriction. Mocked tests and deployment/markup checks cannot establish actual provider acceptance or inbox receipt. The owner should test the live form from their browser with a real reply email and confirm receipt in `jakedevworks@gmail.com`, including Spam. Browser/computer control is not performed without the owner's permission.
