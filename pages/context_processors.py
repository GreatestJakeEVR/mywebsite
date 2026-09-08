from wagtail.models import Site


def navigation(request):
    site = Site.find_for_request(request)
    if not site:
        return {}
    root = site.root_page.specific
    return {"site_home": root, "site_navigation": root.get_children().live().public().in_menu()}
