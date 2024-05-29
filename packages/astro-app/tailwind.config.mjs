/** @type {import('tailwindcss').Config} */

// tailwind custom variables are not applying when editing classes in the developer tools? remember that if a class
// is not used tailwind will purge it from the css file on load in dev and on build in production!!

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
        secondary: {
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
        },
        primary: {
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
        },
        accent: {
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
        },
        accent2: {
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
        },
        accent3: {
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
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
    },
  },
  plugins: [],
};
