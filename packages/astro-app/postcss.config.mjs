/** @type {import('postcss')} */
export default {
  plugin: {
    'postcss-import': {}, // this (`postcss-import': {}`) was set like this because @import was not working inside Tailwind's @layer directive for defining css variables to use inside tailwind.config.mjs
  },
};
