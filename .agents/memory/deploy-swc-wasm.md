---
name: Deploy build SWC WASM fallback OOM
description: Replit autoscale deploy builds fall back to WASM SWC if native SWC isn't installed, OOMing on 4GB machines
---
Deploy builds (`[deployment]` in `.replit`, cr-2-4 = 4GB/2vCPU) crash right after "Creating an optimized production build ..." when Next falls back to **WASM SWC bindings** — much heavier than the native `@next/swc-linux-x64-gnu` binary. A local clean build on the 7.8GB machine passes, so it's not a pure code error; it reproduces under a memory cap.

**Why:** In the deploy env, `npm install` sometimes omits the native SWC optional dep, so Next falls back to WASM, which exceeds the 4GB build container (WASM OOM / cryptic TypeError). The one good build used native SWC (zero SWC warnings in its log).

**How to apply:** Force native SWC in the deploy build command:
`build = ["bash", "-c", "npm install --no-save @next/swc-linux-x64-gnu@16.2.12 && npx next build --webpack"]`
Verify a clean `next build --webpack` locally after reinstalling the native binary. Diagnostic signal: grep deploy logs for "not installed" / "using WASM bindings" vs a success build with no such lines.
