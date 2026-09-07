# Editorial blog layout and supporting images

## Goal

Make public blog posts feel like readable editorial articles instead of a full-width banner followed by a continuous wall of text.

## Approved design

- Keep the warm cream and forest-green public-site system.
- Constrain the lead image to the article container instead of stretching it edge to edge.
- Use a readable 65–75 character line length, stronger heading rhythm, generous paragraph spacing, and a modest first-line indent.
- Store two or three supporting images per post in a dedicated `blog_post_images` table.
- Place supporting images between major article sections with descriptive alt text and optional captions.
- Generate images only through authenticated admin workflows. Never generate images during a public page request.
- Store generated files durably in App Storage.
- Serve responsive, lazy-loaded images at modest display sizes so mobile and desktop visitors download appropriately sized files.

## Existing posts

The typography and contained lead image apply immediately. Admins can select existing posts and generate their supporting images in bulk.

## New AI posts

When image generation is enabled, the AI batch workflow also creates supporting images based on the article’s section headings and content.