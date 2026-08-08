---
created: 2026-04-01
updated: 2026-08-08
summary: Marking components that are usable but intentionally incomplete
---

> No component in `src/` currently carries the marker. The convention is still
> declared in CLAUDE.md and applies to the next one that needs it.

### Fast progress for a working result

In order to progress the development at a decent speed to achieve a usable product, we might need to create some components without covering every scenario: this will most likely happen talking about styles, like variants for sizes, colors, etc,...

To keep track of "usable components that are not yet completed" we will write a component at the end of the files like this: `{/* USABLE BUT NOT COMPLETED */}`\
This it will be easy to find components to complete later on, just by searching for that sentece globally
