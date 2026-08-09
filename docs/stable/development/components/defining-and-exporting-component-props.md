---
created: 2026-04-02
updated: 2026-08-09
summary: Naming and exporting a component's own props type alongside Astro's Props
---

### For any .astro file

`Astro.props` **always** takes its type from the type or interface named
`Props`, so that name is reserved and carries no meaning of its own. Define a
second, meaningfully-named type for the props that actually belong to the
component.

Name it _ComponentName + Props_. It should describe only the attributes the
component itself introduces, ignoring standard HTML attributes. That way,
another file needing an object of that shape — a utility function, say — can
import just the meaningful attributes.

`Props` then extends the component's own type together with whatever else it
needs, such as `HTMLAttributes<'button'>`.

### Example

```astro
// Button.astro

export type ButtonProps = VariantProps<typeof buttonVariants>;
interface Props extends HTMLAttributes<'button'>, ButtonProps {}
```

`ButtonProps` defines only what is specific to this component — here derived
from its CVA variants — while `Props` combines it with every attribute a native
`<button>` accepts.

Components are imported directly from their `.astro` file
(`@components/button/Button.astro`); there is no per-component `index.ts`
barrel re-exporting the component and its props type. See
[components and folders organization](./components-and-folders-organization.md)
for when a barrel is warranted.

### Naming variance

Where the type is purely a CVA variant set and is not the component's full
public surface, `ComponentName + Variants` is used instead — `Card.astro`
exports `CardVariants`. Both conventions are in use; prefer `…Props` unless the
type genuinely only describes variants.
