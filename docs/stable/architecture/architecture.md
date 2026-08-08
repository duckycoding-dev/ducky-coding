---
created: 2026-04-01
updated: 2026-08-08
summary: System architecture diagrams — content pipeline, build system, DB layer, theming
---

# Architecture Overview

## Content Flow

Content is managed through Astro Content Collections (authoritative source) with
a sync to a Turso/SQLite database at build time for dynamic features:

```mermaid
graph LR
    A[MDX/JSON Files] -->|Content Collections| B[Astro Build]
    A -->|Build Sync| C[Turso DB]
    B --> D[Static Pages]
    C --> E[Dynamic Features]
    E -.->|future: search, etc.| D
```

## High-Level System Diagram

```mermaid
graph TB
    subgraph "Content Authoring"
        MD[MDX Posts]
        JSON[JSON Topics]
        MEME[MDX Memes]
    end

    subgraph "Astro Build Pipeline"
        CC[Content Collections - Zod validation]
        SSG[Static Site Generation]
        SSR[Server-Side Rendering - API endpoints]
    end

    subgraph "Database Layer"
        SYNC[Content Sync API]
        DRIZZLE[Drizzle ORM]
        TURSO[(Turso/libSQL)]
    end

    subgraph "Deployment"
        NETLIFY[Netlify CDN]
        STATIC[Static HTML/CSS/JS]
        SERVERLESS[Netlify Functions - SSR + API routes]
    end

    MD --> CC
    JSON --> CC
    MEME --> CC
    CC --> SSG
    CC --> SSR
    SSG --> STATIC
    SSR --> SERVERLESS
    STATIC --> NETLIFY
    SERVERLESS --> NETLIFY

    CC -->|sync trigger| SYNC
    SYNC --> DRIZZLE
    DRIZZLE --> TURSO
    SERVERLESS -->|reads| DRIZZLE
```

## Content Collections Schema

```mermaid
erDiagram
    POST {
        string title
        string summary
        string content
        string author
        string topicTitle
        string[] tags
        string language
        number timeToRead
        enum status "draft | published | deleted"
        boolean isFeatured
        string bannerImagePath
    }

    TOPIC {
        string title
        string slug
        string imagePath
        string description
        string backgroundGradient
        string externalLink
    }

    MEME {
        string title
        string author
        string imagePath
        string imageAlt
        date createdAt
        string[] tags
        object externalLinks
    }

    TOPIC ||--o{ POST : "topicTitle"
    POST }o--o{ TAG : "tags[]"
```

## Database Schema (Drizzle ORM)

```mermaid
erDiagram
    posts {
        text slug PK
        text title
        text summary
        text bannerImagePath
        text topicTitle FK
        integer timeToRead
        text language
        text status
        integer isFeatured
        text createdAt
        text updatedAt
    }

    topics {
        text slug PK
        text title
        text imagePath
        text description
        text backgroundGradient
        text externalLink
        integer postCount
        text lastPostDate
    }

    tags {
        integer id PK
        text name UK
        text topicSlug FK
    }

    posts_tags {
        integer id PK
        text postSlug FK
        integer tagId FK
    }

    images {
        integer id PK
        text path UK
        text alt
    }

    topics ||--o{ tags : "topicSlug"
    topics ||--o{ posts : "topicTitle"
    posts ||--o{ posts_tags : "postSlug"
    tags ||--o{ posts_tags : "tagId"
```

## Database Layer (Repository/Service Pattern)

Each entity follows a three-layer pattern:

```mermaid
graph TD
    A[Service Layer] -->|business logic| B[Repository Layer]
    B -->|queries| C[Drizzle ORM]
    C --> D[Turso/SQLite]
    E[Model] -->|schema + types| B
    E -->|Zod inference| A
```

Files per entity in `src/db/features/`:
- `*.model.ts` — Drizzle schema + Zod types (via drizzle-zod)
- `*.repository.ts` — Database queries
- `*.service.ts` — Business logic wrapper

Entities: `posts`, `topics`, `tags`, `images`, `memes` — each a full
model/repository/service triple.

Service and repository objects are exported in PascalCase
(`PostsService`, `SearchRepository`, …) across every feature.

`memes` is written by the build-time sync and read by search; the meme *pages*
read the content collection directly, because the files are the source of
truth and the database is only the search index.

## Data Fetching

All data fetching goes through the **service layer** (`src/db/features/**/*.service.ts`).
Pages never query the database directly.

**Data flow:** `page frontmatter → service layer → repository layer → database`

- Service calls are only allowed inside `.astro` frontmatter
- ESLint rules enforce this: `*.service.ts` imports are blocked in `<script>` tags
- Each service file is organized by domain (topics, posts, tags, ...)

```ts
// In .astro frontmatter
import { TopicsService } from '@db/features/topics/topics.service';
const topicsWithImages = (await TopicsService.getAllTopicsWithImage()).filter(
  (topic) => (topic.postCount ?? 0) > 0,
);
```

## Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant N as Netlify CDN
    participant S as Static HTML

    Note over U,S: All pages are prerendered (SSG)
    U->>N: GET /blog
    N->>S: Serve cached HTML
    S-->>U: Static page
```

DB sync happens at build time via the `astro:build:start` hook, not at request
time. There are no runtime API endpoints.

## Component Variant Pattern (CVA)

Components use `cva` (Class Variance Authority) for variant-based styling:

```mermaid
graph LR
    A[Component Props] -->|variant props| B[CVA Function]
    C[Tailwind Classes] --> B
    B -->|computed classes| D[clsx + tailwind-merge]
    D --> E[Final className]
```

The pattern combines:
- `cva` for defining variant-to-class mappings
- `clsx` for conditional class composition
- `tailwind-merge` for deduplicating conflicting Tailwind classes

For components with only 1-2 conditional classes, prefer `class:list` over CVA.

```ts
// button.variants.ts
import { cva, type VariantProps } from 'class-variance-authority';
export const buttonVariants = cva('base-classes', { variants: { ... } });
export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

## Theming System

```mermaid
graph TD
    A["html[data-theme='default']"] --> B[default.css]
    A2["html[data-theme='dark']"] --> C[dark-theme.css]

    B --> D[CSS Custom Properties]
    C --> D

    D --> E[Tailwind Theme Config - bg-primary, text-secondary, etc.]
    E --> F[Component Classes]
```

Color allocation follows the **60-30-10 rule**:
- **60% Primary** - backgrounds, large surfaces
- **30% Secondary** - text, borders, structure
- **10% Accents** - CTAs, interactive elements, highlights
