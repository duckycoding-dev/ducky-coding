/*
https://github.com/dcastil/tailwind-merge/issues/368#issuecomment-1890460054

This is used to prevent twMerge from purging classes with same name prefix that are used for different things
For example the class output of an element with a classlist containing shadow-comic (my custom class defined in tailwindconfig.mjs)
and shadow-secondary (where secondary refers to the color) would normally have the first one being removed: by extending twMerge we
tell twMerge what to avoid merging together
*/

import { extendTailwindMerge } from 'tailwind-merge';

export const extendedTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: ['shadow-comic', 'shadow-comic-pressed'],
      'border-style': ['border-comic'],
      'border-w': ['border-comic'],
    },
  },
});
