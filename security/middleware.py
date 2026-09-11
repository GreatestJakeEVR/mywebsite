import logging
import time
from urllib.parse import urlencode

from allauth.account.authentication import get_authentication_records
from allauth.mfa.models import Authenticator
from allauth.mfa.webauthn.internal.auth import STATE_SESSION_KEY
from django.http import HttpResponseBadRequest, HttpResponseRedirect

logger = logging.getLogger("website.security")
CHALLENGE_TIME = "security_key_challenge_time"


def has_key_session(request):
    records = get_authentication_records(request)
    now = time.time()
    if not has_password_session(request):
        return False
    ids = [
        r.get("id")
        for r in records
        if r.get("method") == "mfa"
        and r.get("type") == "webauthn"
        and not r.get("passwordless")
        and 0 <= now - r["at"] < 3600
    ]
    return Authenticator.objects.filter(
        pk__in=ids, user=request.user, type=Authenticator.Type.WEBAUTHN
    ).exists()


def has_password_session(request):
    return any(
        r.get("method") == "password" and 0 <= time.time() - r["at"] < 3600
        for r in get_authentication_records(request)
    )


class EditorSecurityMiddleware:
    """Fail closed for all editor routes, including password-only legacy sessions."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        account = path.startswith("/accounts/")
        editor = path == "/admin" or path.startswith("/admin/")
        if path.startswith("/admin/login/") or path.startswith("/admin/password_reset/"):
            return HttpResponseRedirect("/accounts/login/?next=/admin/")
        if editor and not request.user.is_authenticated:
            return HttpResponseRedirect(
                "/accounts/login/?" + urlencode({"next": request.get_full_path()})
            )
        # Also cover protected document/page routes outside /admin/.
        if request.user.is_authenticated and not has_key_session(request):
            keys = Authenticator.objects.filter(user=request.user, type="webauthn").exists()
            permitted = {
                "/accounts/logout/",
                "/accounts/reauthenticate/",
                "/accounts/2fa/webauthn/reauthenticate/",
            }
            if not keys:
                permitted.add("/accounts/2fa/webauthn/add/")
            if path not in permitted:
                dest = (
                    "/accounts/2fa/webauthn/reauthenticate/"
                    if keys
                    else "/accounts/2fa/webauthn/add/"
                )
                if not has_password_session(request):
                    dest = "/accounts/reauthenticate/"
                return HttpResponseRedirect(dest + "?next=/admin/")
        previous_state = request.session.get(STATE_SESSION_KEY)
        if account and request.method == "POST" and "credential" in request.POST:
            age = time.time() - request.session.pop(CHALLENGE_TIME, 0)
            if not previous_state or not 0 <= age <= 300:
                request.session.pop(STATE_SESSION_KEY, None)
                logger.warning("security_key_challenge_rejected reason=missing_or_expired")
                return HttpResponseBadRequest(
                    "Security-key request expired. Reload this page and try again."
                )
        response = self.get_response(request)
        state = request.session.get(STATE_SESSION_KEY)
        if state and state != previous_state:
            request.session[CHALLENGE_TIME] = time.time()
        if account or editor:
            response["Cache-Control"] = "no-store, private"
        return response
