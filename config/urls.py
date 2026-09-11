from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from django.views.generic import RedirectView
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.contrib.sitemaps.views import sitemap
from wagtail.documents import urls as wagtaildocs_urls

from pages.views import health, legacy_recipe, robots
from security.views import AddSecurityKeyView, RemoveSecurityKeyView

urlpatterns = [
    path("accounts/2fa/webauthn/add/", AddSecurityKeyView.as_view(), name="security_key_add"),
    path(
        "accounts/2fa/webauthn/keys/<int:pk>/remove/",
        RemoveSecurityKeyView.as_view(),
        name="security_key_remove",
    ),
    path("accounts/", include("allauth.urls")),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("health/", health, name="health"),
    path("robots.txt", robots),
    path("sitemap.xml", sitemap),
    path("home/", RedirectView.as_view(url="/", permanent=True)),
    path("cookbook/recipe-list/", RedirectView.as_view(url="/cookbook/", permanent=True)),
    path("cookbook/recipe-detail/<slug:slug>/", legacy_recipe),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += [path("", include(wagtail_urls))]
