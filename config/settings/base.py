import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent.parent
INSTALLED_APPS = [
    "security.apps.SecurityConfig",
    "allauth",
    "allauth.account",
    "allauth.mfa",
    "pages",
    "wagtail.contrib.forms",
    "wagtail.contrib.redirects",
    "wagtail.embeds",
    "wagtail.sites",
    "wagtail.users",
    "wagtail.snippets",
    "wagtail.documents",
    "wagtail.images",
    "wagtail.search",
    "wagtail.admin",
    "wagtail",
    "modelcluster",
    "taggit",
    "django_filters",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sitemaps",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "security.middleware.EditorSecurityMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
]
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "pages.context_processors.navigation",
            ]
        },
    }
]
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=60,
    )
}
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": f"django.contrib.auth.password_validation.{validator}"}
    for validator in [
        "UserAttributeSimilarityValidator",
        "MinimumLengthValidator",
        "CommonPasswordValidator",
        "NumericPasswordValidator",
    ]
]
LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Chicago"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
WAGTAIL_SITE_NAME = "Jake Ardoin"
WAGTAILIMAGES_IMAGE_MODEL = "pages.SiteImage"
WAGTAILADMIN_BASE_URL = os.getenv("SITE_URL", "http://localhost:8000")
WAGTAILSEARCH_BACKENDS = {"default": {"BACKEND": "wagtail.search.backends.database"}}
WAGTAILIMAGES_MAX_UPLOAD_SIZE = 15 * 1024 * 1024
WAGTAILIMAGES_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"]
WAGTAILDOCS_EXTENSIONS = ["pdf", "txt"]
WAGTAILDOCS_MAX_UPLOAD_SIZE = 10 * 1024 * 1024
# Keep document permission checks in Django, including when using S3.
WAGTAILDOCS_SERVE_METHOD = "serve_view"
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10_000
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "webmaster@jakeardoin.com")

AUTHENTICATION_BACKENDS = ["allauth.account.auth_backends.AuthenticationBackend"]
LOGIN_URL = "account_login"
LOGIN_REDIRECT_URL = "/admin/"
ACCOUNT_LOGOUT_REDIRECT_URL = "/"
ACCOUNT_ADAPTER = "security.adapters.EditorAccountAdapter"
ACCOUNT_LOGIN_METHODS = {"username"}
ACCOUNT_SIGNUP_FIELDS = ["username*", "email*", "password1*", "password2*"]
ACCOUNT_EMAIL_VERIFICATION = "none"  # Accounts are provisioned on the server only.
ACCOUNT_LOGIN_BY_CODE_ENABLED = False
ACCOUNT_SESSION_REMEMBER = False
ACCOUNT_LOGIN_TIMEOUT = 300
ACCOUNT_REAUTHENTICATION_TIMEOUT = 300
ACCOUNT_LOGOUT_ON_GET = False
MFA_ADAPTER = "security.adapters.SecurityKeyAdapter"
MFA_SUPPORTED_TYPES = ["webauthn"]
MFA_PASSKEY_LOGIN_ENABLED = False
MFA_PASSKEY_SIGNUP_ENABLED = False
MFA_TRUST_ENABLED = False
MFA_WEBAUTHN_ALLOW_INSECURE_ORIGIN = False
MFA_ALLOW_UNVERIFIED_EMAIL = True
MFA_FORMS = {
    "add_webauthn": "security.forms.AddSecurityKeyForm",
    "authenticate_webauthn": "security.forms.AuthenticateSecurityKeyForm",
    "reauthenticate_webauthn": "security.forms.ReauthenticateSecurityKeyForm",
}
SECURITY_KEY_ORIGIN = os.getenv("SITE_URL", "http://localhost:8000").rstrip("/")
SESSION_COOKIE_AGE = 3600
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
