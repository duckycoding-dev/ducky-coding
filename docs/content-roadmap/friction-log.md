---
created: 2026-08-08
updated: 2026-08-08
summary: Raw capture of friction encountered while working — the source of post ideas
---

# Friction Log

Append a line whenever any of these fire:

- you searched for something and there was no clear answer
- something took ~30+ minutes that should have taken 5
- you chose between two options and the reason wasn't obvious
- something behaved differently than you expected

**Capture without judging.** Whether it's "too trivial" is decided at monthly
triage, not now — in the moment you are the worst possible judge of your own
friction. Reader calibration is *developers about two years behind you*; almost
everything here clears that bar.

Format: `- [date] what happened — why it was surprising` and, once triaged, a
`→` line pointing at the archetype or backlog item it became.

See [`content-roadmap.md`](./content-roadmap.md) for the editorial line and
archetypes.

---

## 2026-08

- [2026-08-08] `` sql`... ESCAPE '\'` `` in a JS template literal emits
  `ESCAPE ''`, and SQLite rejects it with *"ESCAPE expression must be a single
  character"*. Needs `'\\'` to emit one backslash. Caught only because the test
  ran against a real database instead of asserting on the generated SQL string.
  → **Test report.** Strong candidate: escaping bugs that survive code review
  because the code *looks* right.

- [2026-08-08] Hosted Turso aborts interactive transactions after ~5s by
  default, and a long transaction blocks all writes on the primary. Wrapping a
  whole per-item sync in one transaction would work locally on `file:` forever
  and start failing in production as content grows.
  → **Decision record.** Ties directly to backlog item 1.

- [2026-08-08] `yaml` and `zod` were imported across the codebase while declared
  in neither `dependencies` nor `devDependencies` — they resolved purely because
  npm hoisted them from transitive trees. Any dependency shuffle breaks the
  production build's frontmatter parsing.
  → **Test report** or a short "phantom dependencies" piece. How would you even
  detect these? (`depcheck`? a lint rule?) Worth actually investigating.

- [2026-08-08] JS destructuring defaults fire on an explicit `undefined`, so
  `postFile({ title: undefined })` still produced a valid title. Two tests
  written to reproduce known bugs passed for entirely the wrong reason.
  → **Failure narrative.** A test that passes for the wrong reason is worse than
  no test, and this is a very repeatable way to write one.

- [2026-08-08] Orphan cleanup keyed on which files *synced successfully* rather
  than which files were *seen on disk*: one typo in a post's frontmatter meant
  the row and its tag links were hard-deleted from production on the next build.
  → Already backlog item 3, the strongest one.

- [2026-08-08] `src/db/client.ts` builds its libSQL client at module scope and
  `utils/env.ts` parses env at module scope, so importing any repository throws
  before a test can run. The entire data layer is untestable by construction.
  → **Decision record.** "Module-scope side effects are a testability decision
  you make by accident." Tracked as CLEANUP-002.

- [2026-08-08] BSD `sed` doesn't support `\b` word boundaries, so a rename across
  the codebase reported success and changed nothing. GNU `sed` would have worked;
  macOS silently did not.
  → Small, but exactly the kind of thing the target reader loses an hour to.

- [2026-08-08] Netlify's `durable` cache directive *is* invalidated on every
  deploy — so a one-year `s-maxage` on an SSR route is correct, not reckless,
  when the data only changes at deploy time. The scary-looking header was right
  all along.
  → Already backlog item 2. The "this looks like a bug and isn't" angle is the
  hook.

- [2026-08-08] `commitlint`'s `type-enum` here is a *subset* of conventional
  commits — `ci:`, `test:` and `perf:` are all rejected. Standard-looking tooling
  with a non-standard config produces confusing failures.
  → Probably too small alone; may fold into a tooling post.

---

## Triage notes

- **Next triage:** 2026-09
- At triage: for each entry, try to fill the post contract from
  `content-roadmap.md`. If the artifact line won't fill, leave it here — some
  entries need a second occurrence before they're worth a post.
- Entries that become posts keep their `→` line and get struck through rather
  than deleted, so the log stays a record of what converted.
