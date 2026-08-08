---
name: Next deployment build memory controls
description: 4GB autoscale builds need explicit Next webpack worker isolation and limited static generation concurrency
---
For this Next app’s 4GB/2vCPU autoscale publish builder, native SWC alone is insufficient: the project’s custom webpack configuration disables Next’s separate webpack build worker by default. Enable `webpackBuildWorker` and `webpackMemoryOptimizations`, limit `cpus` to one, and cap Node’s heap at 3072MB in the publish build command.

**Why:** The app pre-renders a large SEO route set. Keeping compilation and static generation in a single unrestricted process caused an opaque `TypeError` during optimized production compilation in the publish container even though clean builds passed locally.

**How to apply:** Preserve the low-memory worker settings when changing `next.config.ts` or deploy build commands. Verify with a clean native-SWC webpack build using the same 3GB heap limit before publishing.
