import getpass
import logging

from allauth.mfa.models import Authenticator
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.sessions.models import Session
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction


class Command(BaseCommand):
    help = "Emergency recovery: reset an editor password and keys, and sign out every session."

    def add_arguments(self, parser):
        parser.add_argument("username")
        parser.add_argument("--confirm-reset", action="store_true")

    @transaction.atomic
    def handle(self, *args, **options):
        if not options["confirm_reset"]:
            raise CommandError(
                "This removes security keys and signs everyone out. Use --confirm-reset only for emergency recovery."
            )
        try:
            user = (
                get_user_model()
                .objects.select_for_update()
                .get(username=options["username"], is_active=True)
            )
        except get_user_model().DoesNotExist as exc:
            raise CommandError("Active account not found.") from exc
        password = getpass.getpass("New editor password: ")
        if password != getpass.getpass("Repeat new password: "):
            raise CommandError("Passwords did not match; nothing changed.")
        try:
            validate_password(password, user)
        except ValidationError as exc:
            raise CommandError(" ".join(exc.messages)) from exc
        user.set_password(password)
        user.save(update_fields=["password"])
        Authenticator.objects.filter(user=user).delete()
        Session.objects.all().delete()
        logging.getLogger("website.security").warning(
            "auth_event=emergency_recovery user_id=%s all_sessions_revoked=true", user.pk
        )
        self.stdout.write(
            self.style.SUCCESS(
                "Password reset and keys removed. All sessions signed out. Immediately enroll and test two replacement YubiKeys."
            )
        )
