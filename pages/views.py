from django.db import connection
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from wagtail.models import Site

from .models import RecipePage


def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return JsonResponse({"status": "unavailable"}, status=503)
    return JsonResponse({"status": "ok"})


def robots(request):
    return HttpResponse(
        "User-agent: *\nDisallow: /admin/\nSitemap: https://www.jakeardoin.com/sitemap.xml\n",
        content_type="text/plain",
    )


def legacy_recipe(request, slug):
    site = Site.find_for_request(request)
    pages = RecipePage.objects.live().public()
    if site:
        pages = pages.descendant_of(site.root_page)
    recipe = get_object_or_404(pages, slug=slug)
    return redirect(recipe.get_url(request), permanent=True)
