import os
import subprocess
import sys

from django.conf import settings
from django.test import SimpleTestCase


class ProductionConfigurationTests(SimpleTestCase):
    def environment(self):
        return {
            **os.environ,
            "DJANGO_SETTINGS_MODULE": "config.settings.production",
            "DJANGO_SECRET_KEY": "test-only-configuration-secret-abcdefghijklmnopqrstuvwxyz-0123456789",
            "DJANGO_ALLOWED_HOSTS": "www.jakeardoin.com,jakeardoin.com",
            "DATABASE_URL": "postgresql://website:unused@localhost/website",
            "AWS_STORAGE_BUCKET_NAME": "test-only-media",
            "AWS_S3_REGION_NAME": "us-east-1",
            "AWS_CLOUDFRONT_DOMAIN": "test-only.cloudfront.net",
            "AWS_ACCESS_KEY_ID": "testing",
            "AWS_SECRET_ACCESS_KEY": "testing",
            "AWS_EC2_METADATA_DISABLED": "true",
        }

    def test_deployment_checks_without_cloud_access(self):
        result = subprocess.run(
            [sys.executable, "manage.py", "check", "--deploy", "--fail-level", "WARNING"],
            cwd=settings.BASE_DIR,
            env=self.environment(),
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_production_rejects_example_secret(self):
        env = self.environment()
        env["DJANGO_SECRET_KEY"] = "REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_50_CHARACTERS_LONG"
        result = subprocess.run(
            [sys.executable, "manage.py", "check"],
            cwd=settings.BASE_DIR,
            env=env,
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("randomly generated", result.stderr)

    def test_originals_are_signed_and_renditions_use_cdn(self):
        code = "import django; django.setup(); from django.core.files.storage import storages; original=storages['default'].url('original_images/photo.jpg'); public=storages['renditions'].url('images/photo.width-400.jpg'); assert 'Signature=' in original; assert public == 'https://test-only.cloudfront.net/images/photo.width-400.jpg'"
        result = subprocess.run(
            [sys.executable, "-c", code],
            cwd=settings.BASE_DIR,
            env=self.environment(),
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
