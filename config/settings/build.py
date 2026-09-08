from .base import *  # noqa: F403

# Build static assets without production credentials or a database connection.
# Retain base.py's compressed manifest backend, which production also uses.
SECRET_KEY = "build-time-only-unused-at-runtime"
DEBUG = False
ALLOWED_HOSTS = ["localhost"]
