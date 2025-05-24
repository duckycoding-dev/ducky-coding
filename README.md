# How was this project initiated:

## Typescript:

- `npm i typescript --save-dev`
- `npx tsc --init`

## Prettier

Prettier job is to format code: this can be done, for example, whenever we save the file.\
To install Prettier, run `npm install --save-dev --save-exact prettier`\
Create in the root of the monorepo a .prettierrc.json file for setting up Prettier's configuration options.\
Setup the file as preferred.
Install the VSCode extension and edit VSCode settings to make it run on save: without extension you would need to run the CLI commands to format the files.

```
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.formatOnSave": true,
```

### Prettier config for Astro files

Astro-tips guide: https://astro-tips.dev/tips/prettier/ \
We can setup Prettier to work on .astro files by installing prettier-pluging-astro: run `npm install --save-dev prettier-plugin-astro`.\
Then edit the `prettier.config.js` by adding the following

```
plugins: ['prettier-plugin-astro']
overrides: [
    {
      files: '**/+.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
```

### Prettier config for Tailwindcss

Astro-tips guide: https://astro-tips.dev/tips/prettier/ \
We can also install a prettier plugin that automatically sorts tailwind classes for us: run `npm install --save-dev prettier-plugin-tailwindcss`.\
Then edit the `prettier.config.js` by adding `'prettier-plugin-tailwindcss'` to the `plugins` array.

## ESlint with "Flat config" system

Readings:

- Official eslint blog articles:
  - https://eslint.org/blog/2022/08/new-config-system-part-1/
  - https://eslint.org/blog/2022/08/new-config-system-part-2/
- Good article about differences between .eslintrc (default) and eslint.config.js (flat config):
  - https://www.raulmelo.me/en/blog/migration-eslint-to-flat-config

ESlint job is to lint code: this means finding poorly written code / dangerous code that don't follow the defined guidelines (ours or recommended from others)\
Install the VSCode extension to see the warnings and errors directly inside the code editor: without extension you would need to run the CLI commands to lint the code.

In the root directory run `npm install --save-dev eslint` and create a basic eslint.config.js file.\
Since ESlint might depend on the type of code you are writing (different frameworks used, typescript, pure js, css, etc) we can have a default generic eslint.config.js file in the root directory and then extend its configs with a specific eslint.config.js file for each package.

**_ATTENTION-1!_** In order to use import/export expressions inside the eslint.config.js it's required to set `"type": "module"` in the package.json or use ".mjs" instead of ".js".\
**_ATTENTION-2!_** As of 03/15/2024 Flat config is still experimental, it will become stable with eslint@9.0: in order to use it in VSCode, enable the following rule by setting it to true: `"eslint.experimental.useFlatConfig": true`\
Setup the file as preferred\
Docs for Flat config: https://eslint.org/docs/latest/use/configure/configuration-files-new

Install typescript-eslint tooling which enables ESlint to be used with Typescript code by running `npm install --save-dev typescript-eslint`

typescript-eslint official installation guide and docs: https://typescript-eslint.io/packages/typescript-eslint/

## Prettier for ESlint

We might want to be warned when some of our code is not following the rules we defined for our Prettier formatter: in order to do this, we can have ESlint include Prettier's configuration when linting our files.

In order to use Prettier's configurations, first of all, run `npm install --save-dev eslint-plugin-prettier eslint-config-prettier`: this installs the packages that contain the plugin and the config.\
Import the prettier plugin by adding it to the flat config eslint configuration file by importing it with `import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';` and adding`eslintPluginPrettierRecommended` as the last element of the exported array: this will apply _eslint-plugin-prettier_, which will also apply _eslint-config-prettier_ automatically: the PLUGIN lets ESlint use Prettier's configurations for linting, whereas the CONFIG specifies the different rules and overrides previously defined rules, including the default ESlint ones if they overlap (that's why it's needed to be placed as last, since ESlint configs are cascading).\

You can actually add some other custom objects after the Prettier plugin to override some ESlint rule or to add even more!

Official installation guide: https://github.com/prettier/eslint-plugin-prettier

# Database

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
