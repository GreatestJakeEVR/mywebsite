import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
if len(SECRET_KEY) < 50 or SECRET_KEY.startswith("REPLACE_"):
    raise ImproperlyConfigured(
        "Use a randomly generated DJANGO_SECRET_KEY of at least 50 characters."
    )
DEBUG = False
ALLOWED_HOSTS = [
    host.strip() for host in os.environ["DJANGO_ALLOWED_HOSTS"].split(",") if host.strip()
]
if not ALLOWED_HOSTS or "*" in ALLOWED_HOSTS:
    raise ImproperlyConfigured("Production requires explicit allowed hosts.")
if not os.getenv("DATABASE_URL", "").startswith(("postgres://", "postgresql://")):
    raise ImproperlyConfigured("Production requires a PostgreSQL DATABASE_URL.")
CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS]
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
# Keep HSTS scoped to this host until every subdomain is audited. Preloading
# is a separate domain-owner decision, not a requirement for secure HTTPS.
SILENCED_SYSTEM_CHECKS = ["security.W005", "security.W021"]
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
WAGTAILADMIN_BASE_URL = os.getenv("SITE_URL", "https://www.jakeardoin.com")
SECURITY_KEY_ORIGIN = WAGTAILADMIN_BASE_URL.rstrip("/")
if not SECURITY_KEY_ORIGIN.startswith("https://"):
    raise ImproperlyConfigured("Security keys require an HTTPS SITE_URL in production.")
# Share login rate limits between Gunicorn workers; create this table at release.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.db.DatabaseCache",
        "LOCATION": "website_cache",
    }
}
STORAGES["default"] = {  # noqa: F405
    "BACKEND": "storages.backends.s3.S3Storage",
    "OPTIONS": {
        "bucket_name": os.environ["AWS_STORAGE_BUCKET_NAME"],
        "region_name": os.environ["AWS_S3_REGION_NAME"],
        "default_acl": None,
        "file_overwrite": False,
        # Signed S3 URLs keep originals and documents private in the editor.
        "querystring_auth": True,
    },
}
# Only generated image renditions use the public CDN. Originals and documents
# use the private default backend, even when a page is publicly visible.
STORAGES["renditions"] = {  # noqa: F405
    "BACKEND": "storages.backends.s3.S3Storage",
    "OPTIONS": {
        "bucket_name": os.environ["AWS_STORAGE_BUCKET_NAME"],
        "region_name": os.environ["AWS_S3_REGION_NAME"],
        "custom_domain": os.environ["AWS_CLOUDFRONT_DOMAIN"],
        "default_acl": None,
        "file_overwrite": False,
        "querystring_auth": False,
    },
}
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
