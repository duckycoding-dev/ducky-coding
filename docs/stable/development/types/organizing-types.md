---
updated: 2026-04-01
---

## Type definition organization

Types live in two places depending on their purpose:

```
src/
  types/
    entities/       ← content collection entity schemas (Zod + inferred types)
  db/
    features/
      <entity>/
        <entity>.model.ts       ← DB table schema + inferred types (drizzle-zod)
        <entity>.repository.ts  ← DB queries
        <entity>.service.ts     ← business logic
```

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

The service layer is the boundary between the DB and the rest of the app. API endpoints and page data-loading logic should interact with the service layer, not the repository directly.

### Validation

Data flowing into the service layer is validated against Zod schemas. At API endpoints, validate incoming request data before passing it to the service. The DB model schemas (inferred via drizzle-zod) serve as the authoritative shape for DB rows.

### Inversion of Control (future consideration)

Currently the service layer imports its repository directly. If the project grows to need multiple interchangeable repository implementations (e.g. swapping ORMs), consider passing the repository as a dependency to the service instead of importing it:

```ts
// users.service.ts
export function getAllUsers(repository: IRepository): UserDTO[] { ... }
```

This is not implemented today — document it here when adopted.
