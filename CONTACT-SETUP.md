# Contact form delivery

The owner selected [FormSubmit](https://formsubmit.co/) to deliver inquiries to `jakedevworks@gmail.com` without requiring a visitor to open an email app. The form uses the owner's public recipient alias rather than displaying the receiving inbox address.

## Current flow

The homepage's **Send message** action submits directly from the browser to FormSubmit's documented [cross-origin AJAX endpoint](https://formsubmit.co/documentation). It uses a form-encoded POST, without browser credentials or a JSON preflight. `src/lib/contact.ts` fixes the recipient alias, subject, template, and website identity and forwards only the approved name, email, service, message, reply address, and honeypot fields. No Gmail password, API secret, automatic visitor response, CC, webhook, or CAPTCHA-disabling option is configured.

The existing script disables controls while sending, displays accessible pending/success/error feedback, clears the form only after explicit provider acceptance, and preserves input if acceptance cannot be confirmed. Provider HTTP errors, redirects, invalid JSON, false success values, activation messages, timeouts, and network/CORS errors do not produce a success message. There is no automatic retry or fallback resend: an ambiguous network failure could occur after delivery.

Without JavaScript, the normal form action posts to the same approved FormSubmit alias and uses the provider's confirmation page. The optional **Email Jake DevWorks** link remains available. It does not print the address, though its mailto URL is readable in the page source.

FormSubmit processes the submitted personal information under its [privacy terms](https://formsubmit.co/privacy.pdf). The form links to those terms. Its documentation describes a 30-day submission archive. This site does not store inquiries in its own database. The provider-supported `_honey` field and provider filtering reduce basic spam; client-side validation is usability protection, not a server-side security boundary or global rate limiter.

## Why the preview server endpoint was replaced

The earlier direct-send feature remained on the preview branch because delivery failed. On November 3, 2026, the exact provider alias accepted a direct setup submission with HTTP 200 and `success: "true"`, while Cloudflare preview requests returned an upstream HTTP **429**. A temporary privacy-safe diagnostic recorded only that status and a constant failure category. The unsupported delivery path was removed instead of publishing a function that reports sending errors. The browser flow is the provider's documented integration; it does not route all visitors through the same Cloudflare outbound request path.

The removed function, route configuration, and diagnostic remain recoverable in Git history at `97a2650`. The original static `design-preview/` retains its historical offline email-draft demonstration; production builds use the Astro source at the repository root.

## Verification boundaries

`node --test tests/contact-delivery.test.mjs` checks the fixed destination and field allowlist, message/reply-address preservation, input validation, provider-supported honeypot, strict acceptance checks, and no retries on delivery failures. `pnpm check`, the production build, and `node scripts/verify-build.mjs --production` check TypeScript, rendered native form markup, direct-send browser bundle, links/assets, and unchanged approved introduction.

Real provider acceptance and browser-access response headers are checked separately from mocked tests. Actual arrival in the receiving inbox and physical-browser interaction must be confirmed independently; a provider success response alone is not proof of inbox receipt. No browser/computer control is performed without the owner's permission.
