---
name: AI blog media persistence
description: Durable handling for generated blog images and provider URLs
---

Generated blog image providers can return temporary URLs that expire or are rejected by the image optimizer. The database must store a stable application image path backed by Replit App Storage after the server downloads the image, rather than storing the provider URL or a filesystem path.

**Why:** AI-generated articles otherwise appear to save successfully while their hero images disappear later, fail to render after a restart, or are absent in a published deployment.

**How to apply:** Route every provider result through the shared image persistence helper before inserting or returning the featured-image URL, then serve stored image bytes through the app's public image route. Keep generated article HTML free of inline color/class styling so the site's readable palette remains authoritative.