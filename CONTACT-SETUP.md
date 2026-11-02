# Contact form delivery

The owner selected [FormSubmit](https://formsubmit.co/) to deliver inquiries to `jakedevworks@gmail.com` without requiring visitors to use an email app. The visible form does not print the recipient address.

## Flow

1. The existing form posts to `/api/contact`, a Cloudflare Pages Function. JavaScript enhances this with pending, success, and error messages on the same page. The submit button and fields are disabled while sending to prevent repeated clicks; a failed request preserves the input.
2. The handler requires a same-origin POST, caps the streamed request at 64 KiB, validates names/email/service/message, and ignores a filled honeypot. It forwards only the approved fields to FormSubmit; visitors cannot choose a recipient, CC, webhook, or redirect.
3. The server sets the visitor’s email as Reply-To, uses a fixed subject prefix and recipient, and waits for the provider result. Provider timeouts, non-JSON responses, false success values, and activation messages return a sending error rather than a false confirmation. There is no automatic resend.
4. Responses are not cached. Logs contain only a failure event, without inquiry text or addresses. The site stores no inquiries in its own database; FormSubmit processes the submission under its [privacy terms](https://formsubmit.co/privacy.pdf). Its [documentation](https://formsubmit.co/documentation) describes an archive retained for 30 days.

The provider form URL is consistently `https://www.jakeardoin.com/` so preview testing uses the intended site identity. The server passes this as `_url` and Referer. There are no API keys or Gmail passwords to add. Cloudflare’s native email alternative would need additional domain/email setup; it was not enabled.

## Activation and acceptance

FormSubmit requires a one-time **Activate Form** link sent to the receiving inbox. Check `jakedevworks@gmail.com`, including Spam, after the first setup submission. Until activation is confirmed and a real submission reaches the inbox, delivery is not verified. Do not interpret a successful website build or a mocked provider test as proof of email receipt.

The tests use a fake provider and cannot send email. A real setup message is clearly labeled as a Jake DevWorks contact-form verification, with the owner’s own business address as the reply address. Verify both provider acceptance and inbox receipt before considering delivery ready. Native form posts without JavaScript receive a small confirmation/error page; JavaScript users stay on the homepage.

The honeypot, same-origin checks, and provider filtering reduce simple spam. They are not a bot challenge or a global rate limiter; monitoring and a stronger challenge can be added if abuse appears. No reCAPTCHA-disabling field or automatic visitor email is configured.

## Local verification

```sh
pnpm test
pnpm check
pnpm build:production
node scripts/verify-build.mjs --production
pnpm exec wrangler pages functions build --outdir .wrangler/contact-build
pnpm exec wrangler pages dev dist --ip 127.0.0.1 --port 8788 --compatibility-date 2026-10-30
```

Astro’s static `dev`/`preview` server does not run Pages Functions. Use Wrangler for the combined form/runtime check. The installed local workerd supports dates through October 30, so the command uses a local-only date override; production remains on the configured November 2 date and requires hosted verification. `public/_routes.json` confines function invocations to `/api/contact` (with or without its trailing slash); other pages and assets remain static.
