### For components and DB tables (maybe for other stuff too)

The folder structure is the following

```
/ComponentName
  |__ComponentName.ts (or .astro)
  |__ComponentName.test.ts  // if it requires tests
  |__ComponentName.style.modules.css  if it's a component
  |__index.ts (or .astro)
```

ComponentName.ts (.astro) is where the component, db table, etc,... itself is defined and gets exported.\
The index.ts file imports the component and reexports it immediately like so:

```
export { default as ComponentName } from './ComponentName.astro';
```

This way we can import it in other files without having to write both the folder name and the file name: this makes it much cleaner
