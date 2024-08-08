# Database package

This package is used to define everything related to the database of DuckyCoding.dev, from content data to user related data, exporting services functions, DTO types, schema types, etc,...

## Folder structure

```
  packages/
  │   ├── db/
  │   │   ├── src/
  │   │   │   ├── models/
  │   │   │   │   ├── user.ts
  │   │   │   │   |── content.ts
  │   │   │   │   └── index.ts
  │   │   │   ├── repositories/
  │   │   │   │   ├── user.repository.ts
  │   │   │   │   |── content.repository.ts
  │   │   │   │   └── index.ts
  │   │   │   ├── services/
  │   │   │   │   ├── user.service.ts
  │   │   │   │   |── content.service.ts
  │   │   │   │   └── index.ts
  |   │   │   ├── client.ts
  |   │   │   ├── migrations/
  |   │   │   |   ├── migrations/
  │   │   │   └── index.ts
  │   │   ├── [__tests__]/
  │   │   ├── database/
  │   │   │   ├── content.db
  │   │   │   ├── content.db-shm
  │   │   │   └── content.db-wal
  │   │   ├── env.development
  │   │   ├── drizzle.config.ts
  │   │   ├── package.json
  │   │   └── tsconfig.json
  |   |__ ...
  |   |__ ...
  |   |__ ...
....
```

- `database/` : where the sqlite database files are generated
- `src/models/`: where tables schemas are defined, together with their basic TS types
- `src/repositories/`: where sql queries (raw or by using drizzle) are created and exported to use
- `src/services/`: where repositories queries are called from, together with other data handling related actions (eg. sanitizing content before running the queries)
- `src/client.ts`: exports the database client that will be used by repositories functions

## What gets exported for external use

This package will only export the `models/` and `services/` contents: everything else is for internal use only, so there is no need to export them.

### Future

We might want to consider switching to a structure like the following instead, following a "Feature-Based" project structure:

```
src/
├── topics/
│   ├── topics.model.ts
│   ├── topics.service.ts
│   ├── topics.repository.ts
│   └── topics.schema.ts
├── images/
│   ├── images.model.ts
│   ├── images.service.ts
│   ├── images.repository.ts
│   └── images.schema.ts
├── shared/
│   ├── types.ts
│   └── utils.ts
└── database/
    ├── client.ts
    └── migrations/
```

I like the idea of having everything together in a single folder, but for now I'll stick to ther previously explained structure, since that's what I use at work and thus I'm more familiar with it at the moment.
