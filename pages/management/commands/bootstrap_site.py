import json

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from wagtail.models import Page, Site

from pages.models import BlogIndexPage, CookbookIndexPage, HomePage, RecipePage, SiteImage


class Command(BaseCommand):
    help = "Create the site structure. Optionally import the preserved family recipes; never overwrite existing pages."

    def add_arguments(self, parser):
        parser.add_argument("--recipes", action="store_true")
        parser.add_argument("--hostname", default="localhost")
        parser.add_argument("--port", type=int, default=8000)

    @transaction.atomic
    def handle(self, *args, **options):
        home = HomePage.objects.first()
        if home is None:
            home = HomePage(
                title="Jake Ardoin",
                slug="jake-ardoin",
                seo_title="Jake Ardoin — Developer, maker & home cook",
                search_description="Software, 3D printing, and Cajun family recipes. A personal corner of the internet by Jake Ardoin.",
                about="<p>I like figuring out how things work, then making something of my own. That curiosity takes me from writing software to experimenting with 3D printing and trying things in the kitchen.</p><p>This site brings those interests together: a place for useful notes, personal projects, and family recipes I want to keep close.</p>",
            )
            portrait_path = settings.BASE_DIR / "static/images/jake-ardoin.png"
            with portrait_path.open("rb") as source:
                home.portrait = SiteImage.objects.create(
                    title="Jake Ardoin", file=File(source, name="jake-ardoin.png")
                )
            Page.get_first_root_node().add_child(instance=home)
            home.save_revision().publish()
            site = Site.objects.filter(is_default_site=True).first() or Site()
            site.root_page = home
            site.hostname = options["hostname"]
            site.port = options["port"]
            site.site_name = "Jake Ardoin"
            site.is_default_site = True
            site.save()
        blog = BlogIndexPage.objects.child_of(home).first()
        if blog is None:
            blog = BlogIndexPage(
                title="Blog",
                slug="blog",
                show_in_menus=True,
                search_description="Notes on software development, making things, and learning along the way.",
            )
            home.add_child(instance=blog)
            blog.save_revision().publish()
        cookbook = CookbookIndexPage.objects.child_of(home).first()
        if cookbook is None:
            cookbook = CookbookIndexPage(
                title="Cookbook",
                slug="cookbook",
                show_in_menus=True,
                search_description="Cajun recipes and family favorites from Grandma's Mama's Recipes.",
                story="<p><i>Grandma's Mama's Recipes</i> was written by my grandfather, Karrel Ardoin, around the mid-1990s. It brings together recipes from his friends and family, alongside stories of life in Louisiana's Cajun Country.</p><p>These recipes carry the names of the people who shared them. I'm keeping those connections here, one recipe at a time.</p>",
            )
            home.add_child(instance=cookbook)
            cookbook.save_revision().publish()
        imported = 0
        if options["recipes"]:
            rows = json.loads(
                (settings.BASE_DIR / "content/family-recipes.json").read_text(encoding="utf-8")
            )
            for row in rows:
                slug = slugify(row["title"])
                if cookbook.get_children().filter(slug=slug).exists():
                    continue

                def clean(value):
                    text = str(value).strip() if value is not None else ""
                    return "" if text.lower() in {"none", "none listed", "nan"} else text

                recipe = RecipePage(
                    title=row["title"],
                    slug=slug,
                    author=clean(row.get("author")),
                    source="Grandma's Mama's Recipes — a collection by Karrel Ardoin",
                    category=clean(row.get("category")) or "Family favorites",
                    ingredients=clean(row.get("ingredients")),
                    instructions=clean(row.get("instructions")),
                    servings=clean(row.get("serving_size")),
                    notes=clean(row.get("misc_info")),
                )
                cookbook.add_child(instance=recipe)
                recipe.save_revision().publish()
                imported += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"Site structure ready. Imported {imported} recipes. Existing content was preserved."
            )
        )
