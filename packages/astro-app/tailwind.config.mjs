// tailwind custom variables are not applying when editing classes in the developer tools? remember that if a class
// is not used tailwind will purge it from the css file on load in dev and on build in production!!
// import typography from '@tailwindcss/typography';

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

const accentColor = {
  DEFAULT: 'var(--color-accent)',
  100: 'var(--color-accent-100)',
  200: 'var(--color-accent-200)',
  300: 'var(--color-accent-300)',
  400: 'var(--color-accent-400)',
  500: 'var(--color-accent-500)',
  600: 'var(--color-accent-600)',
  700: 'var(--color-accent-700)',
  800: 'var(--color-accent-800)',
  900: 'var(--color-accent-900)',
};

const accentColor2 = {
  DEFAULT: 'var(--color-accent2)',
  100: 'var(--color-accent2-100)',
  200: 'var(--color-accent2-200)',
  300: 'var(--color-accent2-300)',
  400: 'var(--color-accent2-400)',
  500: 'var(--color-accent2-500)',
  600: 'var(--color-accent2-600)',
  700: 'var(--color-accent2-700)',
  800: 'var(--color-accent2-800)',
  900: 'var(--color-accent2-900)',
};

const accentColor3 = {
  DEFAULT: 'var(--color-accent3)',
  100: 'var(--color-accent3-100)',
  200: 'var(--color-accent3-200)',
  300: 'var(--color-accent3-300)',
  400: 'var(--color-accent3-400)',
  500: 'var(--color-accent3-500)',
  600: 'var(--color-accent3-600)',
  700: 'var(--color-accent3-700)',
  800: 'var(--color-accent3-800)',
  900: 'var(--color-accent3-900)',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        accent2: accentColor2,
        accent3: accentColor3,
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
      spacing: {}, // once we have some layout done we can judge if it would be useful to have classes like m-sm, m-md, m-xl and so on to describe spaces without using numbers like m-4, m-16, etc,...
      textColor: {
        primary: secondaryColor,
        secondary: primaryColor,
      },
      boxShadow: {
        comic: '0.1rem 0.1rem 0rem 0.1rem',
        'comic-lg': '0.3rem 0.3rem 0rem 0.1rem',
        'comic-xl': '0.5rem 0.65rem 0rem 0.1rem',
        'comic-pressed': '-0.1rem -0.075rem 0rem 0.1rem',
      },
      borderWidth: {
        comic: '2px',
      },
    },
    screens: {
      xs: '375px',
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    // borderRadius: { // this is the example from tailwind's docs: maybe we'll need something like this for border radius consistency
    //   none: '0',
    //   sm: '.125rem',
    //   DEFAULT: '.25rem',
    //   lg: '.5rem',
    //   full: '9999px',
    // },
  },
  // plugins: [typography],
};
