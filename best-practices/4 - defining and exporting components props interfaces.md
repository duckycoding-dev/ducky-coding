### For any .astro file

Since Astro.props **always** reflects the type/interface (from now on only called "type" in either case) named `Props`, we need to first create a custom type with a more meaningful name.\

We will be naming the specific type as _ComponentName + Props_: this type will only define the attributes needed by the component's content, ignoring all the standard html attributes.\
This way, if we need to import the type in another file (e.g. we need an object of that type for a utily function) we will only import and use the meaningful attributes.\

The Props type inside the component will then extend from the Component's own type and from any other needed type (e.g. from HTMLAttributes<"div">)

In our index.ts file we will then re export the Component's own type just like we re export the component itself, to avoid imports written as '...<path>.../ComponentName/ComponentName.astro' and instead have imports written as '...<path>.../ComponentName'. How much cleaner is this!? Right?\

### Example

```
index.ts

export { type ComponentNameProps } from './ComponentName.astro';
export { default as ComponentName } from './ComponentName.astro';
```

```
Button.astro

export type ButtonProps = VariantProps<typeof buttonVariants>;
interface Props extends ButtonProps, HTMLAttributes<"button"> {}
```

See how the custom type (in this example ButtonProps) defines only the attributes that are needed for our specific component (taken from CVA utility in this case) and is then used by the Props type together with other generic attributes (HTMLAttributes<"button"> since the component is a button and we want all the props defined in the basic HTML <button>)
