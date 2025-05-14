# How was this project initiated:

## Lerna, Typescript and NX:

- `npx lerna init`
- `npm i typescript --save-dev`
- `npx tsc --init`
- `npx nx init`
- edit the package.json and tsconfig files with personal config options: set the "name" property in the package.json as "_@ducky-coding/root_"; this will be used to identifiy the root directory as the root of the monorepo.
- set _useNx_ true inide lerna.json
- set different options inside nx.json, such as commands dependencies.

## Monorepo Packages

For each package of the monorepo run the following (example for the "_astro-app_" package)

- `npx lerna create astro-app` (creates the package directory and basic sub directories and package.json)
- `cd packages/astro-app`
- `npm create astro@latest`

Inside each package we had to configure the package.json and tsconfig files.\
For each pacakge you can declare the "name" property in the package.json as \*@ducky-coding/_package_name_"\
For the tsconfig file, we can extend the one from the root of the monorepo, to have the same configs shared between all the packages.
You will most likely need to change the "files", "directories" and "main" properties in each package.json

## NPM packages

Node packages from NPM can be installed both inside the root of the monorepo, making them accessible by every package, ensuring consistent versions among all of them, or inside a single package, useful for example if a package uses a framework and needs a package that works only for that framework.\

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
