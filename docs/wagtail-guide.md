# Using Wagtail on jakeardoin.com

Wagtail is the content editor built into your Django website. You use it in a browser to change your introduction, write posts, upload pictures, and add recipes. You do not need to edit Python or redeploy the website for those tasks.

## 1. Sign in

1. Open `https://www.jakeardoin.com/admin/` after AWS deployment is finished.
2. Enter the Wagtail username/password created on the server. This is a separate account from AWS and GitHub.
3. Choose your physical security key in the browser prompt, insert your registered YubiKey, and touch it. Enter the key's PIN if asked.
4. The Wagtail dashboard appears after both checks succeed.
5. If this is the first login, follow the two-key enrollment instructions in [the AWS guide](aws-deployment.md#15-register-both-yubikeys-for-wagtail) first.

For the local development copy, use `http://localhost:8000/admin/` while the local server is running. Use **localhost**, not `127.0.0.1`, because local security-key configuration uses that origin. A key registered for localhost must be registered separately for `www.jakeardoin.com`. Local users, passwords, content, and keys are stored in the local database and do not automatically move online.

Do not change the public editor hostname after enrollment without planning a key-registration migration. Security-key credentials are bound to a website's domain.

## 2. Understand the page tree

Choose **Pages** in the left sidebar. The content is organized like folders:

```text
Jake Ardoin                         ← your homepage
├── Blog                            ← article listing
│   ├── Your first article
│   └── Another article
└── Cookbook                        ← recipe listing
    ├── A family recipe
    └── Another recipe
```

The arrow next to a page opens its children. Click **Edit** to edit that page itself. If you see a generic Root page first, open it to find Jake Ardoin. A new article belongs under Blog; a new recipe belongs under Cookbook. The site only offers appropriate page types for each parent.

**Save draft** keeps work in the database for later. **Preview** shows how it will look. **Publish** makes the saved version visible to visitors. Editing an already-published page and saving a draft leaves the previous published version online. [Wagtail's page-management guide](https://guide.wagtail.org/en/how-to-guides/manage-pages/).

## 3. Edit the homepage

1. Select **Pages**, find **Jake Ardoin**, and click **Edit**.
2. In **Content**, edit **Eyebrow**: the short line above your headline.
3. Edit **Headline**: the large introduction. A line break can separate its two lines.
4. Edit **Introduction**: the paragraph explaining who you are and what you do.
5. For **Portrait**, choose an existing image or upload a new one. Use a clear title such as `Jake Ardoin portrait`.
6. Set **Github URL** to your profile and **Contact email** to the address you want visitors to use. Leaving contact email blank hides that contact option.
7. Click **Preview** and inspect the page, including a narrow/mobile preview if available.
8. Click **Save draft** if you want to return later, or **Publish** to update the live site.
9. Open the public homepage in another tab and refresh to confirm the change.

Your supplied JA logo/favicon and the original background are code assets. They are not changed through these content fields. The removed “a few things about me” section is not displayed or offered in the editor.

## 4. Create a blog post

1. Open **Pages → Jake Ardoin → Blog** using the page arrows to enter the Blog listing.
2. Click **Add child page** (some views label it **Add page**), then choose **Blog page** if asked.
3. Enter **Title**, for example `What I learned building my website`.
4. Set **Date**, which controls the post's displayed date and ordering.
5. Write **Introduction**, a short summary of up to 300 characters.
6. Enter **Topic**, such as `Software development` or `3D printing`.
7. Optionally choose/upload a **Hero image** in **Cover image**. Enter **Hero alt**, describing useful visual information for someone who cannot see it.
8. In **Body**, click **+** to add a block. A block is one section of the article.

| Block | How to use it |
|---|---|
| Heading | Add a section title inside the article. |
| Paragraph | Write normal text; select text to use bold, italic, or links. |
| Image | Select/upload an image, add its alternative description and optional caption. |
| Code | Choose/enter a language label and paste example code. It is displayed as text, not executed. |
| Quote | Add quoted words and attribution where supplied. |

9. Use the block controls to move sections up/down or remove a block. The title is already the article's main heading; body headings are sections within it.
10. Open **Promote**. Review **Slug**, the URL ending; `my-first-project` gives `/blog/my-first-project/`. Use short descriptive words separated by hyphens. Fill in a search description if useful; it is distinct from the visible introduction.
11. Save a draft, preview it, and check spelling, links, code, and image descriptions.
12. Click **Publish** when ready.
13. Open `/blog/` and the article's public URL to confirm both work.

You do not create a separate HTML file or rebuild a blog listing. Wagtail stores the post, and your site's listing includes it automatically when published. The homepage automatically shows the three most recent published public posts. The blog starts empty, with no invented articles.

To change the Blog listing's introductory text, edit the **Blog** parent page itself, rather than one of its posts.

## 5. Add a recipe

1. Open **Pages → Jake Ardoin → Cookbook**.
2. Choose **Add child page → Recipe page**.
3. Fill in **Title**, **Author**, **Source**, and **Category**. Keep category spelling consistent, because the cookbook filter uses those names exactly.
4. Add an optional **Introduction**, **Servings**, **Prep minutes**, and **Cook minutes**. Leave times blank when unknown; enter `0` only when zero is accurate.
5. In **Ingredients**, enter one complete ingredient per line, including its quantity:

```text
1 cup rice
2 cups water
1 teaspoon salt
```

6. In **Instructions**, enter one step per line. Do not manually number the steps; the page numbers them for you:

```text
Rinse the rice.
Bring the water and salt to a boil.
Add the rice, cover, and simmer until tender.
```

7. Add optional **Notes**, such as substitutions or family context. Choose/upload the recipe photo and fill in its alternative description.
8. Open **Promote** and review the slug, such as `cajun-rice`.
9. Save a draft and preview. Check ingredient checkboxes, step numbering, and the print view.
10. Publish, then open `/cookbook/`, search for the recipe, and try its category filter.

The recipe becomes searchable automatically. Recipe pages include print styling and structured recipe data for search engines; the structured data is built from the fields you enter.

The initial import preserves 66 old family recipes. Review their spelling, quantities, author names, categories, and line breaks before treating them as finished. An imported line break becomes a separate ingredient or instruction. Editing a recipe in Wagtail is the way to correct it; do not rerun the importer expecting it to overwrite your edits.

To edit the cookbook's introductory paragraph and family story, edit the **Cookbook** parent page.

## 6. Upload and use images

1. Use **Choose an image** in a page field, then the upload option, or open **Images → Add images** in the sidebar.
2. Select a JPG, JPEG, PNG, WebP, or GIF file. The site's limit is 15 MB per image.
3. Give it a useful title, such as `Finished gumbo in a white bowl`.
4. Save/upload it, then select it for the page.
5. Add the alternative text in the page's relevant image field/block. Describe what matters in the picture, rather than using the filename.
6. Preview. If a crop cuts out the subject, open the image's edit screen and set its focal point around the important area, then preview again.
7. Publish the page when ready. Uploading an image by itself does not create a blog post or recipe.

Wagtail creates the sizes the design needs. Locally they live under the ignored `media` folder. In production originals use private S3 storage, while generated display sizes use CloudFront. You do not manually upload images through the AWS console or paste S3 links into posts.

Generated display images have public CDN URLs, including sizes generated during previews. This setup is for public website images; do not upload confidential images expecting an unpublished page to make every generated file private. Original signed links are temporary links and should not be copied as permanent public image URLs.

Before deleting an image from the library, check where it is used. Removing an image from one page is different from deleting the underlying library image. [Wagtail's image guide](https://guide.wagtail.org/en/how-to-guides/manage-images/).

## 7. Update, unpublish, schedule, or restore a page

**Update:** Pages → locate page → Edit → make changes → Preview → Publish. Saving only a draft preserves the older public version.

**Unpublish:** find the page's action menu and choose **Unpublish**, then confirm. This takes the page off the public site while keeping its content for later. Prefer this when you may want the content back.

**Restore an earlier version:** open the page's history/revisions view, select an earlier revision, compare/review it, restore that version, and publish it if you want it live. Page history is not a replacement for database backups after server loss.

**Schedule:** set a future publication time in the page's publishing/scheduling controls, then choose the publish/schedule action. Dates use America/Chicago in this project. The server must have the scheduled-publishing job from section 21 of the AWS guide. Test that job with a harmless draft first; otherwise immediate Publish is the reliable choice.

**Change URL:** edit the slug under Promote. Wagtail can create redirects when URLs change; test both the old and new URLs afterward. Avoid changing the Home, Blog, or Cookbook structure casually, because these are the site's main navigation sections.

## 8. Manage keys and other editors

1. Use **Settings → Security keys** to view your keys. Add and test a replacement before removing an old one; the last remaining key cannot be removed.
2. Use the account menu to sign out when finished. Save drafts first.
3. For a future collaborator, use Wagtail's **Settings → Users / Groups** to create a separate account and grant only the required page/collection permissions. Do not share your superuser account or grant AWS access just so someone can write a post.
4. Each account must enroll its own security key before the editor permits access. Arrange first enrollment promptly after securely providing the initial password. Review group permissions using that user's own account before inviting them to manage live content.

## 9. What needs code changes instead?

| Task | Where to do it |
|---|---|
| Change introductory wording or portrait | Wagtail homepage editor |
| Add/edit a post, recipe, or photo | Wagtail |
| Save drafts or publish | Wagtail |
| Change fonts, layout, colors, logo files | Code → GitHub checks → AWS release |
| Add recipe fields or a new kind of content page | Django/Wagtail code and a database migration |
| Change server size, backups, or AWS permissions | AWS administrator console/server tools |

For deployment, account recovery, and backups, return to [the AWS guide](aws-deployment.md).
