from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


class PhotoBlock(blocks.StructBlock):
    image = ImageChooserBlock()
    alt_text = blocks.CharBlock(help_text="Describe the image for someone who cannot see it.")
    caption = blocks.CharBlock(required=False)

    class Meta:
        icon = "image"
        template = "blocks/photo.html"


class CodeBlock(blocks.StructBlock):
    language = blocks.CharBlock(required=False, default="Python")
    code = blocks.TextBlock()

    class Meta:
        icon = "code"
        template = "blocks/code.html"


class ArticleBody(blocks.StreamBlock):
    heading = blocks.CharBlock(template="blocks/heading.html")
    paragraph = blocks.RichTextBlock(features=["bold", "italic", "link", "ol", "ul", "h3"])
    photo = PhotoBlock()
    code = CodeBlock()
    quote = blocks.BlockQuoteBlock()
