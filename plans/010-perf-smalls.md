# Plan 010: Small performance cleanups — redundant DB fetches, glob-in-loop, dead public images

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- "src/pages/posts/[...id]/index.astro" src/pages/blog.astro public/images/`
> On mismatch with the excerpts below, skip the affected sub-task and report.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf

## Why this matters

Three cheap wins, all confirmed by reading: the post page queries the same
image row twice per generated page (and `getStaticPaths` queries per-post
instead of batching — each query is a network round-trip against remote Turso
in prod builds); `blog.astro` re-invokes `import.meta.glob` inside a loop
against the codebase's own convention; and ~648 KB of images ship to the CDN
that nothing references. All small today (3 posts) but they scale with
content, and the dead bytes are just dead.

## Current state

**A. Redundant image fetches** — `src/pages/posts/[...id]/index.astro`:

```ts
// :36-45  getStaticPaths: one query PER post
const bannerImagesPromises = postsEntries.map((entry) => {
  const imagePath = entry.data.bannerImagePath;
  if (imagePath) {
    return ImagesService.getImageByPath(imagePath);
  }
  return Promise.resolve(undefined);
});
// :47-50  bannerImage passed as prop
return postsEntries.map((entry, id) => ({
  params: { id: decodeURI(entry.id) },
  props: { entry, bannerImage: bannerImages[id] },
}));
// :70-72  page body RE-fetches the same row
const bannerImageFromDb = imageToFindPath
  ? await ImagesService.getImageByPath(imageToFindPath)
  : undefined;
```

The only later use of `bannerImageFromDb` is `.alt` (`:93`), and the
`bannerImage` prop already carries `path` and `alt`. A batch service method
exists: `src/db/features/images/images.service.ts:19-22` —
`getImagesByPaths(paths: string[]): Promise<Image[]>` (each `Image` has
`.path`).

**B. glob-in-loop** — `src/pages/blog.astro:38-52`:

```ts
postsWithBannerImage.map(async (post) => {
  ...
  if (imageToFindPath) {
    const images = import.meta.glob<{ default: ImageMetadata }>(
      `/src/assets/images/**/*.{jpeg,jpg,png,gif,webp,svg}`,
    );
    processedImage = await matchImageFromGlobImport(...)
```

Every other page hoists the glob once outside the loop (exemplar:
`src/pages/posts/[...id]/index.astro:57-59`).

**C. Dead public images** — `public/images/` contains
`DuckyCoding_logo.png` (420,430 bytes) and `default_profile_icon.png`
(227,526 bytes). Everything in the codebase imports the `src/assets/images/`
copies of these instead (via `@assets/...`); `public/site.webmanifest`
references only the `android-chrome-*` files; the favicon set +
`apple-touch-icon.png` are referenced by `src/layouts/base-head/BaseHead.astro`.
The two files are copied verbatim into every deploy and served by nothing.

## Commands you will need

| Purpose   | Command               | Expected |
|-----------|-----------------------|----------|
| Typecheck | `npm run astro:check` | exit 0   |
| Lint      | `npm run lint`        | exit 0   |
| Tests     | `npm test`            | pass (if plan 002 landed) |

## Scope

**In scope**: `src/pages/posts/[...id]/index.astro`, `src/pages/blog.astro`,
`public/images/DuckyCoding_logo.png` + `public/images/default_profile_icon.png`
(delete), `plans/README.md`.

**Out of scope**: recompressing the ~2.2 MB source PNGs under
`src/assets/images/posts/` and the ~8.8 MB demo videos (they pass through
Astro's optimizer / are content-owned — recompression is an editorial call,
deferred; see Maintenance notes); the images service/repository; any other
page.

## Git workflow

- Branch from `develop`: `advisor/010-perf-smalls`
- Commits: `perf(posts): batch banner image lookups and drop duplicate fetch`,
  `perf(blog): hoist import.meta.glob out of map loop`,
  `chore(public): remove unreferenced duplicate images`. No AI trailer.

## Steps

### Step 1: Batch + dedupe image fetch on the post page

In `getStaticPaths` (`:36-45`): collect
`postsEntries.map((e) => e.data.bannerImagePath).filter(Boolean)`, make ONE
`await ImagesService.getImagesByPaths(paths)` call, build a
`Map<string, Image>` keyed by `.path`, and look each entry up when building
props. In the page body: delete the `bannerImageFromDb` query (`:70-72`) and
replace its one usage at `:93` with `bannerImage?.alt`. Keep explicit types
(repo rule: explicit return types, `noUncheckedIndexedAccess` means Map
`.get()` returns `T | undefined` — the existing `bannerImage` prop is already
optional, so the types flow).

**Verify**: `npm run astro:check` → exit 0;
`grep -n "bannerImageFromDb" "src/pages/posts/[...id]/index.astro"` → no matches;
`grep -c "getImageByPath\b" "src/pages/posts/[...id]/index.astro"` → 0.

### Step 2: Hoist the glob in blog.astro

Move the `import.meta.glob` call to a `const images = ...` above the
`.map()` (match the shape at `posts/[...id]/index.astro:57-59`).

**Verify**: `npm run astro:check` → exit 0; the string `import.meta.glob`
appears exactly once in `src/pages/blog.astro`
(`grep -c "import.meta.glob" src/pages/blog.astro` → 1).

### Step 3: Delete the two dead public images

First re-confirm nothing references them (they'd be referenced by URL path,
not import):
`grep -rn "images/DuckyCoding_logo.png\|images/default_profile_icon.png" src/ public/ docs/ --include="*"`
→ the only acceptable hits are `src/assets/images/...` imports (different
files) — there must be NO hit on `public/`-served URL paths (i.e. no
`"/images/DuckyCoding_logo.png"` string). Then `git rm` both files from
`public/images/`.

**Verify**: the grep shows no `/images/DuckyCoding_logo.png` or
`/images/default_profile_icon.png` URL references; `ls public/images/` no
longer lists them; `npm run astro:check` → exit 0.

## Test plan

Existing suite (plan 002) must stay green: `npm test`. No new tests — these
paths are exercised at build time and covered by `astro:check` + the greps.

## Done criteria

- [ ] Zero `ImagesService.getImageByPath` calls remain in `src/pages/posts/[...id]/index.astro`; one `getImagesByPaths` call in `getStaticPaths`
- [ ] One `import.meta.glob` in `blog.astro`
- [ ] Two dead files removed from `public/images/`
- [ ] `npm run astro:check`, `npm run lint` exit 0; `npm test` green if present
- [ ] No files outside scope modified; `plans/README.md` updated

## STOP conditions

- The grep in Step 3 finds a real URL reference to either public image
  (e.g. hardcoded in a meta tag or webmanifest) — keep that file, delete only
  the unreferenced one, report.
- `getImagesByPaths` does not behave as documented (returns fewer rows than
  paths, no `.path` on results) — check
  `src/db/features/images/images.repository.ts` and report instead of
  changing the repository.
- Post pages render differently (alt text changes) — the swap at `:93` must
  be value-identical (`bannerImage.alt` and `bannerImageFromDb.alt` come from
  the same row; if they somehow differ, report).

## Maintenance notes

- Deferred: `src/assets/images/posts/*.png` at ~2.2 MB each and the two
  `.mp4` demo videos (~8.8 MB) — downscaling/re-encoding is worth doing when
  touching those posts editorially; Astro optimizes PNG output but pays Sharp
  CPU per build (`limitInputPixels: false` in `astro.config.mjs:60-64`).
- If a future avatar/logo needs to be publicly addressable by stable URL
  (e.g. for external embeds), put it BACK in `public/` deliberately and
  reference it — don't resurrect by accident.
