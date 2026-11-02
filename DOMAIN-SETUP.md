# Connect www.jakeardoin.com

Cloudflare Pages project: `jakeardoincom`. Production source: `master`.

The domain `www.jakeardoin.com` has been associated with this existing Pages project. Its verification and HTTPS activation await the DNS update in GoDaddy. No nameserver, mail, or apex record has been changed by this work.

## Required GoDaddy change

In DNS records for `jakeardoin.com`, replace A records **named `www`** with this single record:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `www` | `jakeardoincom.pages.dev` | Default |

Before this change, public DNS resolved `www` to `151.101.1.195` and `151.101.65.195`, and HTTPS redirected to the earlier homepage at `jakeardoin.com`. The new site is already available at https://jakeardoincom.pages.dev/.

Change only records whose name is `www`. If no explicit `www` A records appear, add the CNAME without removing `@` or wildcard records. Preserve nameservers, mail, and verification records. Do not forward `www` to the bare domain, which currently serves the earlier site.

## Verification

After saving, check that public DNS returns the CNAME, Cloudflare reports the custom domain active, and HTTPS at https://www.jakeardoin.com/ serves the Jake DevWorks Astro homepage with the approved introductory wording. DNS caching and certificate provisioning can delay this; a saved record alone is not proof that the public site has switched.

The bare `jakeardoin.com` address is a separate routing step. It still uses the previous host until an apex-to-www redirect or a full Cloudflare DNS migration is configured.

For rollback of `www` only, remove the new CNAME and restore its prior two A values above. Keep other records unchanged. See [Cloudflare’s external-subdomain instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/).
