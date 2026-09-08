import json

from django.core.files.storage import storages
from django.core.paginator import Paginator
from django.db import models
from django.db.models import Q
from django.utils import timezone
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.fields import RichTextField, StreamField
from wagtail.images.models import AbstractImage, AbstractRendition, Image
from wagtail.models import Page
from wagtail.search import index

from .blocks import ArticleBody


def rendition_storage():
    return storages["renditions"] if "renditions" in storages.backends else storages["default"]


class SiteImage(AbstractImage):
    admin_form_fields = Image.admin_form_fields


class SiteRendition(AbstractRendition):
    image = models.ForeignKey(SiteImage, on_delete=models.CASCADE, related_name="renditions")
    file = models.ImageField(
        upload_to="images", storage=rendition_storage, width_field="width", height_field="height"
    )

    class Meta:
        unique_together = [("image", "filter_spec", "focal_point_key")]


class HomePage(Page):
    eyebrow = models.CharField(max_length=120, default="Developer. Maker. Home cook.")
    headline = models.CharField(max_length=160, default="A little code.\nA lot of curiosity.")
    introduction = models.TextField(
        default="I'm Jake Ardoin, an independent software developer, 3D-printing enthusiast, and pretty decent cook. This is where I share what I'm building, what I'm learning, and the recipes worth keeping."
    )
    about = RichTextField(blank=True, features=["bold", "italic", "link"])
    portrait = models.ForeignKey(
        "pages.SiteImage", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    github_url = models.URLField(default="https://github.com/GreatestJakeEVR", blank=True)
    contact_email = models.EmailField(blank=True)
    content_panels = Page.content_panels + [
        FieldPanel("eyebrow"),
        FieldPanel("headline"),
        FieldPanel("introduction"),
        FieldPanel("portrait"),
        FieldPanel("github_url"),
        FieldPanel("contact_email"),
    ]
    max_count = 1
    parent_page_types = ["wagtailcore.Page"]
    subpage_types = ["pages.BlogIndexPage", "pages.CookbookIndexPage"]

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        context["latest_posts"] = (
            BlogPage.objects.live().public().descendant_of(self).order_by("-date")[:3]
        )
        context["recipe_count"] = RecipePage.objects.live().public().descendant_of(self).count()
        return context


class BlogIndexPage(Page):
    introduction = models.TextField(
        default="Notes from the workbench. Things I've built, lessons I've learned, and ideas I'm still figuring out."
    )
    content_panels = Page.content_panels + [FieldPanel("introduction")]
    parent_page_types = ["pages.HomePage"]
    subpage_types = ["pages.BlogPage"]
    max_count_per_parent = 1

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        posts = BlogPage.objects.child_of(self).live().public().order_by("-date", "-id")
        query = request.GET.get("q", "").strip()[:200]
        if query:
            posts = posts.filter(
                Q(title__icontains=query)
                | Q(introduction__icontains=query)
                | Q(topic__icontains=query)
            )
        context.update(posts=Paginator(posts, 9).get_page(request.GET.get("page")), query=query)
        return context


class BlogPage(Page):
    date = models.DateField(default=timezone.localdate)
    introduction = models.CharField(max_length=300)
    topic = models.CharField(max_length=60, default="Software development")
    hero_image = models.ForeignKey(
        "pages.SiteImage", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    hero_alt = models.CharField(max_length=250, blank=True)
    body = StreamField(ArticleBody(), blank=True)
    content_panels = Page.content_panels + [
        FieldPanel("date"),
        FieldPanel("introduction"),
        FieldPanel("topic"),
        MultiFieldPanel([FieldPanel("hero_image"), FieldPanel("hero_alt")], "Cover image"),
        FieldPanel("body"),
    ]
    parent_page_types = ["pages.BlogIndexPage"]
    subpage_types = []
    search_fields = Page.search_fields + [
        index.SearchField("introduction"),
        index.SearchField("body"),
    ]


class CookbookIndexPage(Page):
    introduction = models.TextField(
        default="Good food has a way of bringing us home. A collection of Cajun family recipes from my grandfather's cookbook, Grandma's Mama's Recipes."
    )
    story = RichTextField(blank=True, features=["bold", "italic", "link"])
    content_panels = Page.content_panels + [FieldPanel("introduction"), FieldPanel("story")]
    parent_page_types = ["pages.HomePage"]
    subpage_types = ["pages.RecipePage"]
    max_count_per_parent = 1

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        recipes = RecipePage.objects.child_of(self).live().public().order_by("title")
        categories = list(
            recipes.order_by("category").values_list("category", flat=True).distinct()
        )
        query = request.GET.get("q", "").strip()[:200]
        category = request.GET.get("category", "").strip()[:100]
        if query:
            recipes = recipes.filter(
                Q(title__icontains=query)
                | Q(ingredients__icontains=query)
                | Q(author__icontains=query)
            )
        if category:
            recipes = recipes.filter(category=category)
        context.update(
            recipes=Paginator(recipes, 12).get_page(request.GET.get("page")),
            categories=categories,
            query=query,
            selected_category=category,
        )
        return context


class RecipePage(Page):
    author = models.CharField(max_length=160, blank=True)
    source = models.CharField(
        max_length=250, blank=True, help_text="Cookbook or other source to credit, if applicable."
    )
    category = models.CharField(max_length=100, default="Family favorites")
    introduction = models.TextField(blank=True)
    servings = models.CharField(max_length=100, blank=True)
    prep_minutes = models.PositiveIntegerField(null=True, blank=True)
    cook_minutes = models.PositiveIntegerField(null=True, blank=True)
    ingredients = models.TextField(
        help_text="One ingredient per line. Keep quantities and units together."
    )
    instructions = models.TextField(
        help_text="One step per line. Steps are numbered automatically."
    )
    notes = models.TextField(blank=True)
    photo = models.ForeignKey(
        "pages.SiteImage", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    photo_alt = models.CharField(max_length=250, blank=True)
    content_panels = Page.content_panels + [
        FieldPanel("author"),
        FieldPanel("source"),
        FieldPanel("category"),
        FieldPanel("introduction"),
        MultiFieldPanel(
            [FieldPanel("servings"), FieldPanel("prep_minutes"), FieldPanel("cook_minutes")],
            "At a glance",
        ),
        FieldPanel("ingredients"),
        FieldPanel("instructions"),
        FieldPanel("notes"),
        FieldPanel("photo"),
        FieldPanel("photo_alt"),
    ]
    parent_page_types = ["pages.CookbookIndexPage"]
    subpage_types = []
    search_fields = Page.search_fields + [
        index.SearchField("ingredients"),
        index.SearchField("author"),
    ]

    @property
    def ingredient_lines(self):
        return [line.strip() for line in self.ingredients.splitlines() if line.strip()]

    @property
    def instruction_lines(self):
        return [line.strip() for line in self.instructions.splitlines() if line.strip()]

    @property
    def structured_data(self):
        data = {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": self.title,
            "recipeCategory": self.category,
            "recipeIngredient": self.ingredient_lines,
            "recipeInstructions": [
                {"@type": "HowToStep", "text": step} for step in self.instruction_lines
            ],
        }
        if self.author:
            data["author"] = {"@type": "Person", "name": self.author}
        if self.servings:
            data["recipeYield"] = self.servings
        if self.prep_minutes is not None:
            data["prepTime"] = f"PT{self.prep_minutes}M"
        if self.cook_minutes is not None:
            data["cookTime"] = f"PT{self.cook_minutes}M"
        if self.photo:
            data["image"] = self.photo.get_rendition("width-1200").url
        # Escape HTML-significant characters before insertion into a JSON-LD script.
        return (
            json.dumps(data).replace("<", "\\u003C").replace(">", "\\u003E").replace("&", "\\u0026")
        )
