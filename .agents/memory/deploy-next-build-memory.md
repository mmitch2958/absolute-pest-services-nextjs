---
name: Next deployment build memory controls
description: 4GB autoscale builds need explicit Next webpack worker isolation and limited static generation concurrency
---
For this Next app’s 4GB/2vCPU autoscale publish builder, native SWC alone is insufficient: the project’s custom webpack configuration disables Next’s separate webpack build worker by default. Enable `webpackBuildWorker` and `webpackMemoryOptimizations`, limit `cpus` to one, and cap Node’s heap at 3072MB in the publish build command.

**Why:** The app pre-renders a large SEO route set. Keeping compilation and static generation in a single unrestricted process caused an opaque `TypeError` during optimized production compilation in the publish container even though clean builds passed locally.

**How to apply:** Preserve the low-memory worker settings when changing `next.config.ts` or deploy build commands. Verify with a clean native-SWC webpack build using the same 3GB heap limit before publishing.

As the route count grows (219+ pages), these settings alone stopped being enough — 5 consecutive publish builds crashed mid-compile (garbled output, exit code 1, no clean error message; classic container-level OOM-kill signature, not a V8 "heap out of memory" fatal). The build always succeeds locally (7.8GB dev box) even at a 1.5GB heap cap, confirming it's the 4GB container's total memory, not V8 heap size. Added `config.cache = false` for production-only webpack builds in `next.config.ts` — Next's persistent filesystem cache adds a real memory spike during "Creating an optimized production build," and buys nothing on a publish builder that starts from a clean container every time anyway. If that's still insufficient, the remaining lever is bumping the publish machine's RAM in Publishing → Advanced settings (not something the agent can set programmatically).
