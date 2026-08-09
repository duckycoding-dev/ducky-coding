---
created: 2026-04-02
updated: 2026-08-09
summary: Where entity, DB and query types live, and what each layer is responsible for
---

## Type definition organization

Types live in two places depending on their purpose:

```
src/
  types/
    entities/       ← content collection entity schemas (Zod + inferred types)
  db/
    create-db.ts              ← createDb factory + the Db type
    client.ts                 ← getDb(), the memoised shared handle
    features/
      <entity>/
        <entity>.model.ts       ← DB table schema + inferred types (drizzle-zod)
        <entity>.repository.ts  ← DB queries
        <entity>.service.ts     ← business logic
```

`search/` additionally holds `search.types.ts` (request and response shapes for
`/search`) and `search.sql.ts` (client-free SQL helpers).

### Entity types (`src/types/entities/`)

These define the shape of content collection entries (MDX/JSON frontmatter). Each file exports a Zod schema and its inferred type:

```ts
// src/types/entities/postContent.entity.ts
export const PostContentSchema = z.object({ ... });
export type PostContent = z.infer<typeof PostContentSchema>;
```

These are used in `src/content.config.ts` to define content collection schemas.

### Database types (`src/db/features/<entity>/<entity>.model.ts`)

Each entity's model file defines the Drizzle table schema and uses `drizzle-zod` to infer select/insert/update Zod schemas and their TypeScript types:

```ts
export const postsTable = sqliteTable('posts', { ... });

export const postSchema = createSelectSchema(postsTable);
export const insertPostSchema = createInsertSchema(postsTable);
export const updatePostSchema = createUpdateSchema(postsTable);

export type Post = z.infer<typeof postSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
```

### Responsibilities of each layer

- **Entity types**: describe the shape of content files (frontmatter). Used by Astro Content Collections at build time.
- **DB model types**: describe table rows. Used only at the repository layer.
- **Repository layer**: executes DB queries, returns typed model objects.
- **Service layer**: contains business logic, calls repositories, maps data as needed.

The service layer is the boundary between the DB and the rest of the app. Page
data-loading logic — `.astro` frontmatter — interacts with the service layer,
never with a repository directly. ESLint enforces this. The site has no runtime
API endpoints; `/search` is the only SSR route and it goes through
`SearchService` like any page.

### Validation

Data flowing into the service layer is validated against Zod schemas.
`SearchService.search()` is the live example: it `safeParse`s the raw query
string params against `SearchParamsSchema` and returns a discriminated
`{ success: false, error }` rather than throwing. The DB model schemas
(inferred via drizzle-zod) serve as the authoritative shape for DB rows.

### Injecting the database handle

Repositories do not reach for a module-scope client. Every repository function
takes the handle as an optional trailing parameter that defaults to the shared
one:

```ts
const getPostsBySlugs = async (
  slugs: string[],
  db: Db = getDb(),
): Promise<Post[]> => { ... };
```

`getDb()` is memoised and evaluated at call time, so importing a repository
neither validates env nor opens a connection. Callers pass nothing; tests pass
a handle pointing at a throwaway SQLite file, which is what makes
`tests/search-repository.test.ts` possible.

Services are deliberately *not* injected — they import their repository
directly. Injecting the repository into the service as well would only pay off
with multiple interchangeable repository implementations (e.g. swapping ORMs),
which the project does not have. Revisit if that changes.
