from django.urls import reverse
from wagtail import hooks
from wagtail.admin.menu import MenuItem


@hooks.register("register_settings_menu_item")
def security_keys_menu():
    return MenuItem("Security keys", reverse("mfa_list_webauthn"), icon_name="lock", order=1000)
