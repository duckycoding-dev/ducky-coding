# How was this project initiated:
## Lerna and NX:
- ```npx lerna init```
- ```npm i typescript --save-dev```
- ```npx tsc --init```
- ```npx nx init```
- edit the package.json and tsconfig files with personal config options: set the "name" property in the package.json as "_@ducky-coding/root_"; this will be used to identifiy the root directory as the root of the monorepo.
- set _useNx_ true inide lerna.json
- set different options inside nx.json, such as commands dependencies.

## Monorepo Packages
For each package of the monorepo run the following (example for the "_astro-app_" package)
- ```npx lerna create astro-app```  (creates the package directory and basic sub directories and package.json)
- ```cd packages/astro-app```
- ```npm create astro@latest```

Inside each package we had to configure the package.json and tsconfig files.\
For each pacakge you can declare the "name" property in the package.json as *@ducky-coding/_package_name_"\
For the tsconfig file, we can extend the one from the root of the monorepo, to have the same configs shared between all the packages.
You will most likely need to change the "files", "directories" and "main" properties in each package.json

## NPM packages
Node packages from NPM can be installed both inside the root of the monorepo, making them accessible by every package, ensuring consistent versions among all of them, or inside a single package, useful  for example if a package uses a framework and needs a package that works only for that framework.\


## Prettier
```npm install --save-dev --save-exact prettier```\
Create in the root of the monorepo a .prettierrc.json file for setting up Prettier's configuration options.

## ESlint
Since ESlint might depend on the type of code you are writing (different frameworks used, typescript, pure js, css, etc) we can have a default .eslintrc.json file in the root directory and then extend its configs with a specific .eslintrc.json file for each package.\
(example: https://github.com/eslint/eslint/discussions/16960#discussioncomment-5212286)\
In the root directory run ```npm init @eslint/config``` to create a basic ESlint config file.\

Add Airbnb base linter configs ```npm i eslint-config-airbnb-base``` and add ```"extends": "airbnb-base"``` to your .eslintrc.json


