# Publishing jakeardoin.com on AWS

This is the initial single-server Lightsail deployment. It runs PostgreSQL, Gunicorn/Django, and Caddy in separate containers. Only Caddy exposes public ports. Database files and certificates use persistent Docker volumes; uploaded files use S3. The site tolerates application replacement, but a single-server outage takes the site offline until restored.

## 1. Create storage

In AWS CloudFormation, create a stack from `deploy/media.cloudformation.yaml` in your chosen region. This creates billable resources; review AWS's estimate before creating the stack. Record its `MediaBucketName`, `CloudFrontDomain`, and `Region` outputs.

The bucket has public access blocked, encryption enabled, and versioning enabled. CloudFront can read only `images/*`. Wagtail originals (`original_images/*`) and documents remain private. Keep backups in an entirely separate private bucket, never inside the public rendition path. Generated renditions are publicly accessible to anyone with their URL, even when generated during a draft preview; do not upload confidential imagery to public-content pages.

Use a dedicated S3 identity scoped to this media bucket using `deploy/media-iam-policy.example.json`, replacing the placeholder bucket name. Lightsail instances do not provide EC2 instance profiles. Keep its access keys only in the protected server environment file and rotate them. If moving to EC2/Elastic Beanstalk later, use an instance role instead.

The supplied CDN uses its AWS hostname and certificate, so a separate images-domain certificate is unnecessary. The original circuit background remains a static asset, served by WhiteNoise as part of each release.

## 2. Create the server

Create a Linux Lightsail instance (Ubuntu LTS, initially at least 2 GB RAM) and attach a static IPv4 address. Install Docker Engine, the Compose plugin, and Git using the official packages. Enable automatic OS security updates and Lightsail automatic snapshots. Use a 4 GB instance if builds or image resizing exhaust memory.

Allow public TCP 80/443 and optionally UDP 443. Restrict SSH to your trusted addresses. Do not expose 5432 or 8000. Use a dedicated deployment user and key. Docker access is effectively administrative access; protect that identity.

Clone this branch into `/srv/jakeardoin`:

```sh
git clone --branch codex/fresh-wagtail-website https://github.com/GreatestJakeEVR/mywebsite.git /srv/jakeardoin
cd /srv/jakeardoin
cp .env.production.example .env.production
chmod 600 .env.production
```

Edit the environment file with the storage outputs and freshly generated secrets. Generate the Django secret with Python's `secrets.token_urlsafe(64)` and the PostgreSQL password with `secrets.token_hex(32)`. Do not use the example values. The Compose file constructs `DATABASE_URL`; use a hex password to avoid URL-encoding issues. Changing the environment password later does not change an already initialized PostgreSQL account; rotate both together.

Configure SMTP (for example Amazon SES with a verified sender and production sending access) before relying on admin password resets. SES SMTP credentials are different from S3 access keys.

## 3. Configure the domain

At your existing DNS provider, or in Route 53/Lightsail DNS, point both the apex `jakeardoin.com` and `www.jakeardoin.com` to the Lightsail static IP. Preserve any existing mail records. If moving DNS providers, copy all records before changing nameservers. Domain registration can stay at its current registrar.

Caddy obtains and renews certificates after DNS resolves and ports 80/443 are reachable. It redirects the apex domain to `https://www.jakeardoin.com`, preserving the path. Its certificate data persists in the `caddy_data` volume. Django trusts Caddy's forwarded HTTPS header only because port 8000 is not publicly published.

## 4. First deployment

From the project directory on the server:

```sh
bash deploy/release.sh
docker compose --env-file .env.production -f compose.production.yaml run --rm web python manage.py bootstrap_site --hostname www.jakeardoin.com --port 443 --recipes
docker compose --env-file .env.production -f compose.production.yaml run --rm web python manage.py createsuperuser
```

Omit `--recipes` to start with an empty cookbook. This command uploads the initial portrait to S3. Use a new database for this fresh project; do not apply these replacement migrations to the old site's database. If restoring an existing database, change the Wagtail Site hostname/port in Settings → Sites instead of expecting bootstrap to overwrite it.

Check `https://www.jakeardoin.com/health/`, the homepage, `/admin/`, and both domain variants. Publish a trial post and recipe; verify draft pages do not appear in listings, upload a photo, and redeploy to confirm the content and image persist. Remove the trial content in Wagtail when finished.

## 5. Later code releases

```sh
git pull --ff-only origin codex/fresh-wagtail-website
bash deploy/release.sh
```

Wait for GitHub Actions checks to pass before releasing. The script locks out concurrent releases, builds a commit-tagged image, backs up the database, runs production checks, applies migrations, and replaces the app. Content changes made in Wagtail require no deployment. A single-server release can involve a brief interruption; this is not a zero-downtime setup.

This initial branch automates checks in GitHub and releases on the server. It deliberately has no credentials or automatic cloud deployment trigger. A deployment workflow can be connected once the AWS server and deployment identity exist.

To return to an older application image, set `RELEASE_TAG` to the previous 12-character commit tag and run Compose `up -d --no-build web`, followed by restarting Caddy if the upstream address changed. This is safe only when the database schema remains compatible. A failed or destructive database migration may need a separately reviewed rollback or backup restoration. Do not automatically restore a backup over newer published content.

## 6. Backups and recurring maintenance

- Enable Lightsail snapshots and keep multiple generations.
- Take daily PostgreSQL custom-format dumps (`pg_dump -Fc`) and copy them to a separate private, encrypted S3 backup bucket. Use a dedicated backup identity, retention rules, and alerts on failed backups. The release script's local `backups/` copy alone is insufficient if the server fails.
- Keep media-bucket versioning enabled and monitor its storage growth. Deletion policies retain the bucket when removing the stack; removing a stack does not remove media costs.
- Test restoration into a separate database and server before depending on backups.
- Schedule `python manage.py publish_scheduled` every minute if using scheduled posts; run `python manage.py clearsessions` daily. Execute these inside the running web container with the production Compose configuration. Use the deployment user's crontab or systemd timers and log failures.
- Update Python/Django/Wagtail dependencies and base images regularly, then run the test suite and deploy. Monitor disk space, memory, certificate renewal, error logs, and `/health/`. Set an AWS billing alert.

Do not run `docker compose down -v` on the live server: it removes the database and certificate volumes. Never commit production secrets, database dumps, or uploaded media.

## References

- [Lightsail plans](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-bundles.html)
- [CloudFront origin access control](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [Django production checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https)
- [Wagtail deployment](https://docs.wagtail.org/en/stable/deployment/under_the_hood.html)
