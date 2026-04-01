/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // new site functionality
        'fix',      // bug fixes
        'content',  // writing or editing posts, memes, topics
        'chore',    // maintenance, deps, config
        'docs',     // documentation (CLAUDE.md, README, docs/)
        'style',    // CSS / visual-only changes
        'refactor', // code restructuring, no behaviour change
        'revert',   // reverting a previous commit
      ],
    ],
  },
};
