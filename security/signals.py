import logging

from allauth.mfa import signals
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver

logger = logging.getLogger("website.security")


@receiver(user_logged_in)
@receiver(user_logged_out)
@receiver(user_login_failed)
@receiver(signals.authenticator_added)
@receiver(signals.authenticator_removed)
@receiver(signals.authenticator_used)
def audit_auth_event(sender, signal, user=None, authenticator=None, **kwargs):
    names = {
        user_logged_in: "login",
        user_logged_out: "logout",
        user_login_failed: "login_failed",
        signals.authenticator_added: "key_added",
        signals.authenticator_removed: "key_removed",
        signals.authenticator_used: "key_used",
    }
    logger.info(
        "auth_event=%s user_id=%s key_id=%s",
        names[signal],
        getattr(user, "pk", None),
        getattr(authenticator, "pk", None),
    )
