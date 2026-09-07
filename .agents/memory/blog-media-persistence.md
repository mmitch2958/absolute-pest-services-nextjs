---
name: AI blog media persistence
description: Durable handling for generated blog images and provider URLs
---

Generated blog image providers can return temporary URLs that expire or are rejected by the image optimizer. The database must store a stable local image path after the server downloads the image, rather than storing the provider URL.

**Why:** AI-generated articles otherwise appear to save successfully while their hero images disappear later or fail to render after a restart.

**How to apply:** Route every provider result through the shared image persistence helper before inserting or returning the featured-image URL. Keep generated article HTML free of inline color/class styling so the site's readable palette remains authoritative.