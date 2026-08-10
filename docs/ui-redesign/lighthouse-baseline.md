---
created: 2026-08-10
updated: 2026-08-10
summary: Pre-redesign Lighthouse baseline for comparison after the UI redesign lands
---

# Lighthouse Baseline (pre-redesign)

Captured on 2026-08-10, immediately before Task 1 of
`docs/ui-redesign/implementation-plan.md`, on branch `feat/ui-redesign` with no
code changes applied.

**Measurement conditions — read before comparing.**

- Audited against the **dev server** (`astro dev`, port 4321), not a production
  build. `astro preview` is unavailable with the Netlify adapter (the preview
  process exits before becoming ready), so a production-parity audit would need
  `netlify dev`.
- The available tooling audits **accessibility, best practices, SEO and agentic
  browsing only — it excludes performance**. Performance needs a separate trace
  and is not part of this baseline.
- Device: desktop.

## Scores

| Page | Accessibility | Best Practices | SEO | Agentic Browsing | Failed audits |
|------|---------------|----------------|-----|------------------|---------------|
| `/` | **95** | 100 | 100 | 100 | 1 |
| `/topics/astro` | **100** | 100 | 100 | 100 | 0 |
| `/blog` | **100** | 100 | 100 | 100 | 0 |

## The one pre-existing failure

`/` fails `color-contrast`. Both instances are external project links inside
project cards, using the `Link` `default` variant's `text-accent-700`
(`#d600be`) against the card surface:

- `https://github.com/duckycoding-dev/pvverdict`
- `https://github.com/duckycoding-dev/ducky-coding`

This is **pre-existing and outside the redesign's scope** — it lives in
`ProjectCard` / `Link`, none of which this work touches.

Two consequences for the redesign:

1. `/` must not drop below **95**, and the redesign must not add *new*
   `color-contrast` failures. All new components use `text-secondary` on light
   tints, and the topic pills derive from `color-mix(… 55%, white)`, so they stay
   well clear.
2. `/topics/astro` and `/blog` are at **100** and must stay there. The topic page
   is the most heavily rewritten surface in the plan, so this is the tightest
   constraint in the whole change.

## Before screenshots

- `.superpowers/shots/before-topic-astro.png` — the current topic hero, showing
  the Astro logo scaled to `h-[200%]` until it reads as an abstract shape, with
  the opaque title plate on top of it, plus the six equal-weight nav links.

(`.superpowers/` is gitignored, so screenshots are local-only and will not be
committed.)
