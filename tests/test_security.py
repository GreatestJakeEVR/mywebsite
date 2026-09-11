"""Real signed WebAuthn ceremonies using an ephemeral software test credential."""

import hashlib
import io
import json
import os
import time
from unittest.mock import patch

from allauth.mfa.models import Authenticator
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from django.contrib.auth import get_user_model
from django.contrib.sessions.models import Session
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
from fido2.cose import ES256
from fido2.utils import websafe_encode
from fido2.webauthn import AttestationObject, AttestedCredentialData, AuthenticatorData

from security.adapters import SecurityKeyAdapter
from security.middleware import CHALLENGE_TIME

ORIGIN = "https://testserver"
ADD = "/accounts/2fa/webauthn/add/"
VERIFY = "/accounts/2fa/webauthn/reauthenticate/"
STATE = "mfa.webauthn.state"


@override_settings(SECURITY_KEY_ORIGIN=ORIGIN)
class SecurityTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            "keyeditor", "editor@example.com", "Unique-test-password-723!"
        )
        self.private = ec.generate_private_key(ec.SECP256R1())
        self.credential_id = os.urandom(32)
        self.rp_hash = hashlib.sha256(b"testserver").digest()

    def password_login(self):
        return self.client.post(
            "/accounts/login/",
            {"login": self.user.username, "password": "Unique-test-password-723!"},
        )

    def registration(self, origin=ORIGIN, backup=False):
        self.client.get(ADD)
        state = self.client.session[STATE]
        client_data = json.dumps(
            {"type": "webauthn.create", "challenge": state["challenge"], "origin": origin}
        ).encode()
        credential = AttestedCredentialData.create(
            bytes(16), self.credential_id, ES256.from_cryptography_key(self.private.public_key())
        )
        flags = AuthenticatorData.FLAG.UP | AuthenticatorData.FLAG.AT
        if backup:
            flags |= AuthenticatorData.FLAG.BE
        auth_data = AuthenticatorData.create(self.rp_hash, flags, 0, credential)
        attestation = AttestationObject.create("none", auth_data, {})
        return {
            "id": websafe_encode(self.credential_id),
            "rawId": websafe_encode(self.credential_id),
            "type": "public-key",
            "response": {
                "clientDataJSON": websafe_encode(client_data),
                "attestationObject": websafe_encode(attestation),
            },
        }

    def enroll(self):
        self.password_login()
        response = self.client.post(
            ADD, {"name": "Test hardware key", "credential": json.dumps(self.registration())}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Authenticator.objects.filter(user=self.user).count(), 1)

    def assertion(self, origin=ORIGIN, challenge=None, begin_path=VERIFY):
        self.client.get(begin_path)
        state = self.client.session[STATE]
        client_data = json.dumps(
            {"type": "webauthn.get", "challenge": challenge or state["challenge"], "origin": origin}
        ).encode()
        auth_data = AuthenticatorData.create(self.rp_hash, AuthenticatorData.FLAG.UP, 1)
        signature = self.private.sign(
            auth_data + hashlib.sha256(client_data).digest(), ec.ECDSA(hashes.SHA256())
        )
        return {
            "id": websafe_encode(self.credential_id),
            "rawId": websafe_encode(self.credential_id),
            "type": "public-key",
            "response": {
                "clientDataJSON": websafe_encode(client_data),
                "authenticatorData": websafe_encode(auth_data),
                "signature": websafe_encode(signature),
            },
        }

    def verify(self, **kwargs):
        return self.client.post(VERIFY, {"credential": json.dumps(self.assertion(**kwargs))})

    def test_public_site_and_no_signup(self):
        self.assertEqual(self.client.get("/health/").status_code, 200)
        self.assertContains(self.client.get("/accounts/signup/"), "Sign Up Closed")
        self.assertEqual(self.client.get("/admin/images/").status_code, 302)

    def test_fresh_login_requires_signed_key_after_password(self):
        self.enroll()
        self.verify()
        self.client.post("/accounts/logout/")
        response = self.password_login()
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.get("/admin/").status_code, 302)
        endpoint = "/accounts/2fa/authenticate/"
        payload = self.assertion(begin_path=endpoint)
        response = self.client.post(endpoint, {"credential": json.dumps(payload)})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.get("/admin/images/").status_code, 200)

    def test_invalid_signature_cannot_authenticate(self):
        self.enroll()
        payload = self.assertion()
        payload["response"]["signature"] = websafe_encode(b"invalid signature")
        self.client.post(VERIFY, {"credential": json.dumps(payload)})
        self.assertEqual(self.client.get("/admin/").status_code, 302)

    def test_recovery_requires_explicit_flag(self):
        self.enroll()
        with self.assertRaises(CommandError):
            call_command("recover_editor", self.user.username)
        self.assertTrue(Authenticator.objects.filter(user=self.user).exists())

    def test_recovery_changes_password_revokes_keys_and_sessions(self):
        self.enroll()
        self.verify()
        password = "Replacement-password-only-for-tests-729!"
        with patch(
            "security.management.commands.recover_editor.getpass.getpass", return_value=password
        ):
            call_command(
                "recover_editor", self.user.username, confirm_reset=True, stdout=io.StringIO()
            )
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(password))
        self.assertFalse(Authenticator.objects.filter(user=self.user).exists())
        self.assertFalse(Session.objects.exists())

    def test_password_alone_cannot_open_editor_or_manage_keys(self):
        self.password_login()
        self.assertRedirects(
            self.client.get("/admin/"), ADD + "?next=/admin/", fetch_redirect_response=False
        )
        self.assertEqual(self.client.get("/admin/pages/").status_code, 302)
        self.assertEqual(self.client.post("/admin/pages/add/").status_code, 302)

    def test_enrollment_does_not_replace_key_authentication(self):
        self.enroll()
        self.assertRedirects(
            self.client.get("/admin/"), VERIFY + "?next=/admin/", fetch_redirect_response=False
        )
        self.assertEqual(self.verify().status_code, 302)
        self.assertEqual(self.client.get("/admin/").status_code, 200)
        self.assertEqual(self.client.get("/admin/")["Cache-Control"], "no-store, private")

    def test_wrong_origin_and_challenge_do_not_authenticate(self):
        self.enroll()
        self.assertRedirects(
            self.verify(origin="https://evil.testserver"),
            "/accounts/login/",
            fetch_redirect_response=False,
        )
        self.assertEqual(self.client.get("/admin/").status_code, 302)
        self.assertRedirects(
            self.verify(challenge=websafe_encode(os.urandom(32))),
            "/accounts/login/",
            fetch_redirect_response=False,
        )
        self.assertEqual(self.client.get("/admin/").status_code, 302)

    def test_expired_and_replayed_ceremonies_are_rejected(self):
        self.enroll()
        payload = self.assertion()
        session = self.client.session
        session[CHALLENGE_TIME] = time.time() - 301
        session.save()
        self.assertEqual(
            self.client.post(VERIFY, {"credential": json.dumps(payload)}).status_code, 400
        )
        payload = self.assertion()
        self.assertEqual(
            self.client.post(VERIFY, {"credential": json.dumps(payload)}).status_code, 302
        )
        self.assertEqual(
            self.client.post(VERIFY, {"credential": json.dumps(payload)}).status_code, 400
        )

    def test_synced_keys_and_wrong_registration_origin_rejected(self):
        self.password_login()
        for kwargs in ({"backup": True}, {"origin": "https://evil.testserver"}):
            payload = self.registration(**kwargs)
            self.assertEqual(
                self.client.post(ADD, {"credential": json.dumps(payload)}).status_code, 200
            )
            self.assertFalse(Authenticator.objects.filter(user=self.user).exists())

    def test_last_key_cannot_be_removed_and_revocation_blocks_session(self):
        self.enroll()
        self.verify()
        key = Authenticator.objects.get(user=self.user)
        self.assertFalse(SecurityKeyAdapter().can_delete_authenticator(key))
        self.client.post(f"/accounts/2fa/webauthn/keys/{key.pk}/remove/")
        self.assertTrue(Authenticator.objects.filter(pk=key.pk).exists())
        key.delete()  # Simulate controlled administrator recovery/revocation.
        self.assertEqual(self.client.get("/admin/").status_code, 302)

    def test_key_record_for_another_user_does_not_grant_access(self):
        self.enroll()
        self.verify()
        other = get_user_model().objects.create_user("other")
        Authenticator.objects.filter(user=self.user).update(user=other)
        self.assertEqual(self.client.get("/admin/").status_code, 302)

    def test_legacy_login_cannot_bypass_key_and_expired_session_needs_password(self):
        self.assertRedirects(
            self.client.post(
                "/admin/login/",
                {"username": self.user.username, "password": "Unique-test-password-723!"},
            ),
            "/accounts/login/?next=/admin/",
            fetch_redirect_response=False,
        )
        self.enroll()
        self.verify()
        session = self.client.session
        for record in session["account_authentication_methods"]:
            record["at"] -= 3601
        session.save()
        self.assertRedirects(
            self.client.get("/admin/"),
            "/accounts/reauthenticate/?next=/admin/",
            fetch_redirect_response=False,
        )
