import io
import json
import tempfile
from pathlib import Path
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase, override_settings
from PIL import Image
from wagtail.models import PageViewRestriction

from pages.models import BlogIndexPage, BlogPage, CookbookIndexPage, HomePage, RecipePage, SiteImage


class WebsiteTests(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.media = tempfile.TemporaryDirectory()
        cls.settings_override = override_settings(MEDIA_ROOT=cls.media.name)
        cls.settings_override.enable()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls.settings_override.disable()
        cls.media.cleanup()

    @classmethod
    def setUpTestData(cls):
        call_command("bootstrap_site", stdout=io.StringIO())
        cls.home = HomePage.objects.get()
        cls.blog = BlogIndexPage.objects.get()
        cls.cookbook = CookbookIndexPage.objects.get()
        cls.post = BlogPage(
            title="A working notebook",
            slug="working-notebook",
            introduction="Notes from building software.",
            body=[
                ("paragraph", "<p>Hello from the notebook.</p>"),
                ("code", {"language": "HTML", "code": "<script>alert('example')</script>"}),
            ],
        )
        cls.blog.add_child(instance=cls.post)
        cls.post.save_revision().publish()
        cls.recipe = RecipePage(
            title="Cajun rice",
            slug="cajun-rice",
            author="Family",
            category="Cajun Favorites",
            ingredients="1 cup rice\n\n2 cups water\n",
            instructions="Rinse the rice.\nSimmer until tender.",
            servings="4",
            prep_minutes=0,
        )
        cls.cookbook.add_child(instance=cls.recipe)
        cls.recipe.save_revision().publish()

    def test_home_and_navigation(self):
        response = self.client.get("/")
        self.assertContains(response, "A little code.")
        self.assertContains(response, 'href="/blog/"')
        self.assertContains(response, 'href="/cookbook/"')
        self.assertContains(response, "1<small>family recipes")

    def test_published_article_renders_and_code_is_escaped(self):
        response = self.client.get(self.post.url)
        self.assertContains(response, "Hello from the notebook.")
        self.assertContains(response, "&lt;script&gt;")
        self.assertNotContains(response, "<script>alert")

    def test_drafts_are_excluded_from_listing_and_direct_requests(self):
        draft = BlogPage(
            title="Secret draft", slug="secret-draft", introduction="Not published", live=False
        )
        self.blog.add_child(instance=draft)
        draft.save_revision()
        self.assertNotContains(self.client.get("/blog/?q=Secret"), "Read Secret draft")
        self.assertEqual(self.client.get(draft.url).status_code, 404)
        self.assertNotContains(self.client.get("/"), "Secret draft")

    def test_private_pages_are_excluded_from_public_lists(self):
        PageViewRestriction.objects.create(page=self.recipe, restriction_type="login")
        self.assertNotContains(self.client.get("/cookbook/"), "Cajun rice")
        self.assertContains(self.client.get("/"), "0<small>family recipes")

    def test_recipe_search_filters_and_no_results(self):
        self.assertContains(
            self.client.get("/cookbook/?q=water&category=Cajun+Favorites"), "Cajun rice"
        )
        self.assertNotContains(
            self.client.get("/cookbook/?q=water&category=Seafood"), "View Cajun rice"
        )
        self.assertContains(self.client.get("/cookbook/?q=impossible"), "No recipes found")

    def test_pagination_preserves_query_and_category(self):
        for number in range(13):
            recipe = RecipePage(
                title=f"Rice {number}",
                slug=f"rice-{number}",
                category="Cajun Favorites",
                ingredients="Rice",
                instructions="Cook",
            )
            self.cookbook.add_child(instance=recipe)
            recipe.save_revision().publish()
        response = self.client.get("/cookbook/?q=rice&category=Cajun+Favorites&page=2")
        self.assertContains(response, "q=rice&amp;category=Cajun+Favorites&amp;page=1")
        self.assertNotContains(response, 'href="??')
        self.assertEqual(self.client.get("/cookbook/?page=not-a-number").status_code, 200)

    def test_recipe_steps_print_and_structured_data(self):
        response = self.client.get(self.recipe.url)
        self.assertContains(response, "Print recipe")
        self.assertContains(response, 'type="checkbox"', count=2)
        self.assertContains(response, "0 min")
        self.assertEqual(len(json.loads(self.recipe.structured_data)["recipeInstructions"]), 2)

    def test_recipe_json_cannot_close_the_script_element(self):
        self.recipe.title = "</script><script>alert(1)</script>"
        self.assertNotIn("</script>", self.recipe.structured_data)
        self.assertEqual(json.loads(self.recipe.structured_data)["name"], self.recipe.title)

    def test_image_upload_and_rendition_persist(self):
        data = io.BytesIO()
        Image.new("RGB", (100, 80), "green").save(data, "PNG")
        photo = SiteImage.objects.create(
            title="Recipe photo",
            file=SimpleUploadedFile("recipe.png", data.getvalue(), content_type="image/png"),
        )
        rendition = photo.get_rendition("fill-60x40")
        self.assertEqual((rendition.width, rendition.height), (60, 40))
        self.assertTrue(Path(rendition.file.path).is_file())
        self.assertEqual(photo.get_rendition("fill-60x40").pk, rendition.pk)

    def test_bootstrap_import_is_repeatable_and_preserves_edits(self):
        self.home.headline = "My edited headline"
        self.home.save()
        call_command("bootstrap_site", recipes=True, stdout=io.StringIO())
        first_count = RecipePage.objects.count()
        call_command("bootstrap_site", recipes=True, stdout=io.StringIO())
        self.assertEqual(first_count, 67)
        self.assertEqual(RecipePage.objects.count(), first_count)
        self.home.refresh_from_db()
        self.assertEqual(self.home.headline, "My edited headline")

    def test_admin_requires_login_and_editor_form_loads(self):
        self.assertEqual(self.client.get("/admin/").status_code, 302)
        user = get_user_model().objects.create_superuser(
            "editor", "editor@example.com", "test-only-strong-password"
        )
        self.client.force_login(user)
        # Even a Django-authenticated superuser must complete security-key MFA.
        self.assertEqual(self.client.get(f"/admin/pages/{self.post.pk}/edit/").status_code, 302)
        self.assertEqual(self.client.get(f"/admin/pages/{self.recipe.pk}/edit/").status_code, 302)
        self.assertEqual(self.client.get("/admin/images/").status_code, 302)

    def test_health_and_database_failure(self):
        self.assertEqual(self.client.get("/health/").json(), {"status": "ok"})
        with patch(
            "pages.views.connection.cursor", side_effect=RuntimeError("private connection detail")
        ):
            response = self.client.get("/health/")
        self.assertEqual(response.status_code, 503)
        self.assertNotContains(response, "private connection detail", status_code=503)

    def test_legacy_recipe_redirect_and_sitemap(self):
        self.assertRedirects(
            self.client.get("/cookbook/recipe-detail/cajun-rice/"),
            "/cookbook/cajun-rice/",
            status_code=301,
        )
        self.assertEqual(self.client.get("/sitemap.xml").status_code, 200)
