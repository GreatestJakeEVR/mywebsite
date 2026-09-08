# Jake Ardoin's website

A fresh Django 5.2 LTS / Wagtail 7.4 LTS website for a developer, maker, and home cook. The homepage reuses Jake's original pale circuit background and portrait. This branch replaces the old application; its history remains on `master`.

## Start locally

Use Python 3.12. You do not need AWS or Docker for local development.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.lock
python manage.py migrate
python manage.py bootstrap_site --recipes
python manage.py createsuperuser
python manage.py runserver
```

On macOS/Linux, activate with `source .venv/bin/activate`; the other commands are the same. Open `http://localhost:8000` for the site and `/admin/` for Wagtail. The admin password is one you choose; there are no built-in credentials. Omit `--recipes` for an empty cookbook. Bootstrap can be repeated without overwriting your pages.

## Writing and editing

- **Homepage:** Pages → Jake Ardoin → Edit. Update the introduction, portrait, GitHub link, and optional contact email.
- **Blog:** Pages → Jake Ardoin → Blog → Add child page → Blog page. Add paragraphs, headings, images with descriptions, code examples, or quotes. Save a draft, preview it, then publish.
- **Cookbook:** Add a Recipe page under Cookbook. Enter one ingredient and one instruction per line. Categories drive the filter automatically. Add a photo, author, servings, times, and notes as available.
- **Images:** Upload using the editor or Images section. Local files go into the ignored `media/` directory. Production stores originals privately in S3 and serves generated sizes from CloudFront.
- **URLs:** Edit slugs in Promote. Wagtail records redirects for later slug changes. Existing `/home/` and `/cookbook/recipe-detail/<slug>/` links are supported.

Content and photos live outside code releases. Keep the database and media backed up; Git is not a content backup. Scheduled publishing requires the periodic command described in the AWS guide.

## What's included

- Responsive homepage with original background artwork.
- Blog listing, search, article templates, drafts, previews, and publishing.
- Searchable family cookbook with category filters, pagination, ingredient checkboxes, print styles, and Recipe JSON-LD.
- An optional, repeatable import of the original 66 recipes.
- Image resizing, private S3 originals, public CloudFront renditions, and collected static assets.
- Production Docker Compose with PostgreSQL, Gunicorn, Caddy HTTPS, persistent volumes, and a release script.
- A CloudFormation template for S3/CloudFront and GitHub Actions for checks, PostgreSQL tests, and container builds.

The blog starts empty so there are no fabricated posts. The original recipe transcription is retained in `content/family-recipes.json`; it contains some spelling, line-break, and category inconsistencies that should be reviewed in the editor before launch. Unknown prep times, cooking times, ratings, and nutrition are not invented. Recipe markup alone does not guarantee search-engine rich results.

## Project layout

```text
config/settings/        shared, local, and production configuration
pages/                 page types, image models, importer, migrations
templates/             page and content-block templates
static/                stylesheet, print behavior, original artwork
content/               preserved recipe source
deploy/                AWS media stack, server configuration, release script
docs/                  publishing and deployment instructions
tests/                 content, editor, storage, and privacy checks
```

`requirements.txt` lists direct dependencies; `requirements.lock` pins the tested full dependency set. Install the lock file for repeatable releases. Update both deliberately when applying security releases, then rerun checks. The small frontend needs no Node build step.

## Verify changes

```text
python -m pip install ruff==0.16.6
python -m ruff check .
python -m ruff format --check .
python manage.py makemigrations --check --dry-run
python manage.py test tests
python manage.py collectstatic --noinput
```

Local development uses SQLite. Set `DATABASE_URL` to use PostgreSQL; GitHub Actions tests against PostgreSQL 16. Never point tests at the live database. The server health endpoint is `/health/`.

## Publish on AWS

Follow [the AWS deployment guide](docs/aws-deployment.md). The repository contains configuration, not a provisioned AWS environment. First-time setup requires an AWS account, server, domain DNS access, secrets, and storage. No cloud resources are created by cloning or running the site locally.
