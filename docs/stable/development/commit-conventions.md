---
created: 2026-04-01
updated: 2026-04-02
summary: Conventional Commits format enforced by commitlint
---

# Commit Conventions

Commits follow the **Conventional Commits** format, enforced automatically by
commitlint on every `git commit`.

---

## Format

```
type(optional-scope): subject

optional body

optional footer
```

The first line (`type(scope): subject`) is the **header** — the only required part.

### Rules enforced by commitlint

- Header must be ≤ 100 characters
- Type must be lowercase and from the allowed list
- Subject must not be empty
- Subject must not end with a `.`
- Subject must not start with a capital letter (sentence-case, pascal-case, etc.)
- Body and footer must each be ≤ 100 characters per line
- Body must be separated from the header by a blank line

---

## Types

| Type | Use it when… |
|------|-------------|
| `feat` | Adding or changing functionality on the site itself (new page, new component, new feature) |
| `fix` | Fixing a bug or broken behaviour |
| `content` | Writing or editing blog posts, memes, or topics — anything in `src/content/` |
| `chore` | Maintenance work: dependency updates, config changes, build tweaks |
| `docs` | Updating documentation: `CLAUDE.md`, `README.md`, files in `docs/` |
| `style` | CSS or visual-only changes that don't affect logic |
| `refactor` | Restructuring code without changing what it does |
| `revert` | Reverting a previous commit |

---

## Scope (optional)

The scope narrows down *which area* of the project changed. Use it when the type
alone is ambiguous. Keep it short and lowercase.

```
fix(db): post tags deleted on every sync
feat(memes): add tiktok link field
chore(deps): update drizzle-orm to 0.45.2
style(navbar): reduce mobile padding
content(astro): publish intro to content collections
```

There is no enforced list of scopes — use your judgement. Good candidates:
`db`, `deps`, `seo`, `navbar`, `card`, `memes`, `posts`, `topics`, `api`.

---

## Subject

The subject is a short description of the change. Write it like completing the
sentence *"This commit will…"*:

```
feat: add dark mode toggle          ✓ ("will add dark mode toggle")
feat: Added dark mode toggle        ✗ (past tense, sentence-case rejected)
feat: Add dark mode toggle.         ✗ (trailing full stop rejected)
```

---

## Body (optional)

Use the body to explain *why* the change was made, not *what* — the diff shows
what. Separate from the header with a blank line.

```
fix(db): post tags deleted on every sync

The delete/re-insert block ran outside the someDataChanged guard,
causing unnecessary writes on every build even when nothing changed.
```

---

## Footer (optional)

Used for breaking change notices. Separate from the body with a blank line.

```
refactor(db): replace file URL with remote client interface

BREAKING CHANGE: TURSO_DATABASE_URL must now be set even in local dev.
Update .env.development to point to your local Turso instance.
```

---

## Real examples for this project

```
content: publish post about css grid layout
content(astro): add meme about framework fatigue
feat(topics): add gradient background to topic cards
fix: banner image missing on post pages with spaces in slug
chore(deps): update astro to 6.2.0
chore: lock all dep versions, remove ^ ranges
docs: document build flow and db sync chain
style(card): tighten post card spacing on mobile
refactor(sync): move tag delete inside someDataChanged guard
revert: revert feat(topics): add gradient background
```
