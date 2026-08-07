# DuckyCoding

DuckyCoding is my developer blog and portfolio. I use it to publish web-development articles, experiments and memes, document the projects I build and maintain a personal space on the web.

The site is built with Astro and TypeScript. Most pages are statically generated, while search is server-rendered and cached at the CDN until the next deployment or cache expiration.

## What you can find

- Web-development articles and technical notes
- Developer memes
- A searchable content archive
- Selected personal projects
- My professional background and links

## Stack

| Area | Technologies |
|---|---|
| Application | Astro, TypeScript, MDX |
| Styling | Tailwind CSS |
| Data | libSQL/Turso, Drizzle ORM |
| Hosting | Netlify |
| Tooling | ESLint, Prettier, Husky |

## Local development

This project uses Node.js. The expected version is recorded in `.nvmrc`.

```sh
nvm use
npm install
npm run astro:dev
```

Astro prints the local URL when the development server starts.

## Quality checks

```sh
npm run astro:check
npm run lint
npm run format:check
npm run astro:build
```

Database migrations and seed commands require the appropriate local environment configuration. See the scripts in `package.json` before running them.

## Live site

[duckycoding.dev](https://duckycoding.dev)
