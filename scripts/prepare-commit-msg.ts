import { appendFileSync } from 'fs';

const [_, __, commitMsgFile, source] = process.argv;

// Only inject hints when the editor opens for a new message.
// Skip when -m is used (source === 'message'), during merges
// (source === 'merge'), squashes, etc.
if (source) process.exit(0);

if (!commitMsgFile) {
  console.error('prepare-commit-msg: no commit message file path provided');
  process.exit(1);
}

appendFileSync(
  commitMsgFile,
  `
# Types (scope is optional):  type(scope): subject
# ─────────────────────────────────────────────────
# feat     : new site functionality
# fix      : bug fixes
# content  : writing or editing posts, memes, topics
# chore    : maintenance, deps, config
# docs     : CLAUDE.md, README, docs/
# style    : CSS / visual-only changes
# refactor : code restructuring, no behaviour change
# revert   : reverting a previous commit

# Examples:
# feat: add new topic page

# ------ Example with scope and body ----------------
# fix(db): post tags deleted on every sync

# The delete/re-insert block ran outside the someDataChanged guard,
# causing unnecessary writes on every build even when nothing changed.
# ---------------------------------------------------
`,
);
