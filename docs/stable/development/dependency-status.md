---
created: 2026-04-01
updated: 2026-08-10
summary: Version ceilings, accepted advisories and deliberate non-upgrades
---

# Dependency Status

All versions are pinned exactly in `package.json` — no `^` ranges. See
`docs/issues/discovered.md` for the full context behind each entry.

---

## Version Ceilings

Packages that cannot go to their latest published version.

| Package | Pinned | Latest | Ceiling imposed by | Issue |
|---------|--------|--------|--------------------|-------|
| `typescript` | 6.0.3 | 7.0.2 | `@astrojs/check` peer dep is `^5.0.0 \|\| ^6.0.0` | — |
| `schema-dts` | 1.1.5 | 2.0.0 | `astro-seo-schema@7` peer dep is `^1.1.0` | DEP-002 |

`schema-dts` is types-only, so the pin has no runtime or build cost and
DEP-002 is recorded as accepted rather than pending.

---

## Accepted Advisories

`npm audit` reports 17 advisories (13 high, 0 critical). All of the high ones
come from a single chain rooted in the Netlify adapter's local dev tooling:

`@astrojs/netlify` → `@netlify/vite-plugin` → `@netlify/dev` → …

There is no fix to apply — npm's suggested resolution downgrades the adapter to
`6.4.1`, which requires Astro 6. The chain is build- and dev-time only and
never reaches the browser, and `imageCDN: false` keeps the `sharp` path out of
the deploy. Tracked as DEP-003; re-check periodically for an upstream release.

---

## Decision Log

Intentional choices that deviate from "always latest" and should not be
revisited unless the situation changes.

| Package | Decision | Reason |
|---------|----------|--------|
| `cva` | Stay at `1.0.0-beta.4` | No stable release exists. npm's `latest` tag points at `0.0.0`, which is *older* than the pinned beta — `npm outdated` will keep suggesting a downgrade. Ignore it. The beta API is stable in practice. |
| `astro-icon` | Stay at `1.1.5` | Last published December 2024 and declares no peer dependencies, so nothing flags it. Verified working on Astro 7: sprite symbol ids and `<use>` references are unchanged, only the emission order differs. |

---

## Node

`.nvmrc` pins the Node version and is the single source of truth: the Netlify
`NODE_VERSION` environment variable, which used to override it, was removed on
2026-08-09.

Currently `v24.19.0` — the active LTS. Node 26 is released but does not enter
LTS until October 2026. Astro 7 requires `>=22.12.0`.

## takumi-js — pinned to an exact version

`takumi-js` renders the build-time OG cards (`src/utils/og/`). It is pinned with
`--save-exact`, no caret: the package first published on 2026-03-26 and had shipped
119 versions by August, so a range would pull breaking changes into a build.

Native bindings ship per platform; all eight variants are in `package-lock.json`,
including `@takumi-rs/core-linux-x64-gnu` for Netlify. A WASM fallback is bundled
in the same package. The dependency adds no new audit findings.
