from allauth.mfa.webauthn.views import AddWebAuthnView, RemoveWebAuthnView
from django.contrib.auth import get_user_model
from django.db import transaction
from django.http import HttpResponseForbidden

from .adapters import SecurityKeyAdapter


class AddSecurityKeyView(AddWebAuthnView):
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if "form" in kwargs:
            context["form"] = kwargs["form"]
        options = context["js_data"]["creation_options"]["publicKey"]
        options.setdefault("authenticatorSelection", {})["authenticatorAttachment"] = (
            "cross-platform"
        )
        return context


class RemoveSecurityKeyView(RemoveWebAuthnView):
    @transaction.atomic
    def form_valid(self, form):
        # Serialize concurrent removals: each must leave another registered key.
        get_user_model().objects.select_for_update().get(pk=self.request.user.pk)
        if not SecurityKeyAdapter().can_delete_authenticator(self.get_object()):
            return HttpResponseForbidden(
                "Add and test a backup security key before removing this key."
            )
        return super().form_valid(form)
