from urllib.parse import urlsplit

from allauth.account.adapter import DefaultAccountAdapter
from allauth.mfa.adapter import DefaultMFAAdapter
from allauth.mfa.models import Authenticator
from django.conf import settings


class EditorAccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        return False


class SecurityKeyAdapter(DefaultMFAAdapter):
    def can_delete_authenticator(self, authenticator):
        return (
            Authenticator.objects.filter(
                user_id=authenticator.user_id, type=Authenticator.Type.WEBAUTHN
            )
            .exclude(pk=authenticator.pk)
            .exists()
        )

    def get_public_key_credential_rp_entity(self):
        return {"id": urlsplit(settings.SECURITY_KEY_ORIGIN).hostname, "name": "Jake Ardoin"}
