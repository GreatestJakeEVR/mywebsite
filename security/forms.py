from allauth.mfa.webauthn.forms import AddWebAuthnForm, AuthenticateWebAuthnForm
from allauth.mfa.webauthn.internal import auth
from django import forms
from django.conf import settings
from fido2.webauthn import AttestationObject


def check_origin(response):
    if response.response.client_data.origin != settings.SECURITY_KEY_ORIGIN:
        raise forms.ValidationError("Use the exact website address to register or use a key.")


class AddSecurityKeyForm(AddWebAuthnForm):
    def clean(self):
        credential = self.cleaned_data.get("credential")
        if credential:
            response = auth.parse_registration_response(credential)
            check_origin(response)
            data = AttestationObject(response.response.attestation_object).auth_data
            if data.is_backup_eligible():
                raise forms.ValidationError("Use your physical security key, not a synced passkey.")
        # The library verifies the challenge, RP ID and user presence.
        return super().clean()


class AuthenticateSecurityKeyForm(AuthenticateWebAuthnForm):
    def clean_credential(self):
        check_origin(auth.parse_authentication_response(self.cleaned_data["credential"]))
        return super().clean_credential()


class ReauthenticateSecurityKeyForm(AuthenticateSecurityKeyForm):
    reauthenticated = True
