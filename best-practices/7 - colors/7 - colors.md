### Color themes

For the default theme, colors have been choosen trying to follow the 60-30-10 design rule as follow:

- 60 - primary color: the one that is viewed the most throught the pages; mostly used as the background
- 30 - secondary color: the one that is viewed a lot everywhere but that takes up a smaller percentage of the screen; mostly used for the text
- 10 - accent colors: I came up with a list of three different colors that will be used to catch user attention or call them to do something; mostly used with buttons, links, borders, etc,...; of the three colors the idea is to use them in order, meaning that the accent-color-1 will be used more often than the other two
- info colors: the ones used to transmit some meaning to the user, like errors, warning, successful actions, etc; mostly used in pop ups, snackbars and things like that

The colors have been chosen so that their contrast is accessible: the idea is that a text using the secondary color over a background of either primary color or accent colors should always be highly visible to the user.\
This means that for other themes we will need to follow this pattern as well, so that we don't need to handle complicated logic in css to handle one theme or the other.

For example, if I'm using the default theme and I'm making a button with text color of secondary color and background color of accent color, and it's highly visible, my code would look something like this:

```html
<button class="text-secondary background-accent-1">Click me!</button>
```

Now, if I were to change theme, I would want to **NOT CHANGE THE HTML** and to **keep the same class names**: the color changes will be handled by tailwind referencing the css variable that changes value at runtime based on the current theme;

### Text colors

Since, as we said, text colors would mostly use the secondary color most of the times, would it make sense to override the colors just for the texts?\
The result I'm thinking about would be the following:\

- text-primary -> uses color-secondary
- background-primary -> uses color-primary

This is because for us it might be more intuitive to think like "what text color do I use here? oh the one that I use the most, so it must be text-primary", and to write classes that use either one of `primary` or `secondary`.

To do so we need to customize tailwind configs to make text reference the right color.\
We create two javascript const variables that contain the colors and then use them like so in tailwind.config.mjs:

```js
/* tailwind.config.mjs */

const primaryColor = {
  DEFAULT: 'var(--color-primary)',
  100: 'var(--color-primary-100)',
  200: 'var(--color-primary-200)',
  300: 'var(--color-primary-300)',
  400: 'var(--color-primary-400)',
  500: 'var(--color-primary-500)',
  600: 'var(--color-primary-600)',
  700: 'var(--color-primary-700)',
  800: 'var(--color-primary-800)',
  900: 'var(--color-primary-900)',
};

const secondaryColor = {
  DEFAULT: 'var(--color-secondary)',
  100: 'var(--color-secondary-100)',
  200: 'var(--color-secondary-200)',
  300: 'var(--color-secondary-300)',
  400: 'var(--color-secondary-400)',
  500: 'var(--color-secondary-500)',
  600: 'var(--color-secondary-600)',
  700: 'var(--color-secondary-700)',
  800: 'var(--color-secondary-800)',
  900: 'var(--color-secondary-900)',
};

...

export default {
  theme: {
    extend: {
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        ...
      },
      textColor: {
        primary: secondaryColor,
        secondary: primaryColor,
      },
      ...
    },
  },
};
```

We could save all colors and other config object in const variables to clean up the final exported config object as well, for readibility.
