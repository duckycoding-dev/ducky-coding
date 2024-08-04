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
  │   │   │   ├── entities/
  │   │   │   │   ├── userDTO.ts
  │   │   │   │   ├── contentDTO.ts
  │   │   │   │   └── index.ts
  │   │   │   └── index.ts
  │   │   ├── [__tests__]/
  │   │   ├── database/
  |   │   │   ├── client.ts
  |   │   │   ├── migrations/
  |   │   │   |   ├── migrations/
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
- `models/`: where tables schemas are defined, together with their basic TS types
- `repositories/`: where sql queries (raw or by using drizzle) are created and exported to use
- `services/`: where repositories queries are called from, together with other data handling related actions (eg. sanitizing content before running the queries).
- `entities/`: where DTO types are defined; this is experimental, the objective is to be able to define types that are then used by services as final return types.\
  Let's make an exampe:\
  Topics need a banner image to be defined, and there is both a "topics" and "images" tables: a record in the topics table references an id of a record from the images table.\
  Inside the models though we export the relative types for "topics" and "images", but most of the times, when fetching a topic, we also want to retrieve its banner image: to do so, we must do a join between the two tables.\
  The output type will then be a mix of the two types, thus the need for the DTO type, that incorporates properties of both Topic and Image types.\
  NB: maybe there is some way of handling this via Drizzle directly, but for now this is the way we will follow, as it's most straigtforward, even if it creates some overhead code to handle.
- `client.ts`: exports the database client that will be used by repositories functions

## What gets exported for external use

This package will only export the `entities/`, `models/`, and `services/` contents: everything else is for internal use only, so there is no need to export them.

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
├── entities/
│   ├── topicWithImage.ts
│   └── ...
├── shared/
│   ├── types.ts
│   └── utils.ts
└── database/
    ├── client.ts
    └── migrations/
```

I like the idea of having everything together in a single folder, but for now I'll stick to ther previously explained structure, since that's what I use at work and thus I'm more familiar with it at the moment.
