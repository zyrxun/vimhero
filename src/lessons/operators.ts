import type { Lesson } from './types'

// Section 2 — Basic Operators. Original text and snippets.

export const operators: Lesson[] = [
  {
    slug: 'delete-words',
    title: 'Delete Words',
    keys: 'd w',
    theory: `\`dw\` deletes from the cursor to the start of the next word. Put a count in front to chain it: \`d2w\` deletes two words.

The deleted text lands in the unnamed register (more on that in the copy/paste lesson). Delete the word \`junk\` — cursor starts on \`j\`.`,
    tasks: [
      {
        prompt: 'Delete the word `junk` with `dw` (cursor is on the `j`).',
        buffer: 'const list = [junk];',
        cursor: { line: 0, ch: 14 },
        goalBuffer: 'const list = [];',
        goalCursor: { line: 0, ch: 14 },
        solution: 'dw',
        command: 'dw',
        parSeconds: 6,
      },
      {
        prompt: 'Delete two words at once with `d2w` — remove `dead code` (cursor on `d`).',
        buffer: 'return dead code; // result',
        cursor: { line: 0, ch: 7 },
        goalBuffer: 'return; // result',
        goalCursor: { line: 0, ch: 6 },
        solution: 'd2w',
        command: 'd2w',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'change-word',
    title: 'Change Words',
    keys: 'c w',
    theory: `\`cw\` deletes the word **and** drops you into insert mode — delete + type in one command. It's the verb you'll use most.

Finish the rename: cursor is on \`slow\`, change it to \`fast\`.`,
    tasks: [
      {
        prompt: 'Change the word `slow` to `fast` with `cw` (cursor on `s`), then `Esc`.',
        buffer: 'const mode = "slow"',
        cursor: { line: 0, ch: 14 },
        goalBuffer: 'const mode = "fast"',
        goalCursor: { line: 0, ch: 17 },
        solution: 'cwfast<Esc>',
        command: 'cw',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'delete-lines',
    title: 'Delete Lines',
    keys: 'd d D',
    theory: `- \`dd\` deletes the whole current line
- \`D\` deletes from the cursor to the **end** of the line (stays on the line)

Both keep you in normal mode. Remove the dead line entirely with \`dd\`.`,
    tasks: [
      {
        prompt: 'Delete the middle line with `dd` (cursor starts on it).',
        buffer: 'const a = 1\nconst TODO = null\nconst b = 2',
        cursor: { line: 1, ch: 0 },
        goalBuffer: 'const a = 1\nconst b = 2',
        goalCursor: { line: 1, ch: 0 },
        solution: 'dd',
        command: 'dd',
        parSeconds: 6,
      },
      {
        prompt: 'Cut the trailing comment off with `D` (cursor is on the `/`).',
        buffer: 'export default App // remove this',
        cursor: { line: 0, ch: 19 },
        goalBuffer: 'export default App',
        goalCursor: { line: 0, ch: 17 },
        solution: 'D',
        command: 'D',
        parSeconds: 6,
      },
    ],
  },
  {
    slug: 'delete-multiple-lines',
    title: 'Delete Multiple Lines',
    keys: 'd j k',
    theory: `Line operators take vertical counts: \`d2j\` deletes the current line **and** the two below. \`3dd\` deletes three lines starting here.

These combos are why \`j\`/\`k\` live on home row. Clear the block.`,
    tasks: [
      {
        prompt: 'Delete this line and the one below it with `dj`.',
        buffer: 'keep me\nconst x = TODO1\nconst y = TODO2\nkeep me too',
        cursor: { line: 1, ch: 0 },
        goalBuffer: 'keep me\nkeep me too',
        goalCursor: { line: 1, ch: 0 },
        solution: 'dj',
        command: 'dj',
        parSeconds: 8,
      },
      {
        prompt: 'Delete three lines with `3dd` (or `d3j` minus one — try `3dd`).',
        buffer: 'header\ndebug one\ndebug two\ndebug three\nfooter',
        cursor: { line: 1, ch: 0 },
        goalBuffer: 'header\nfooter',
        goalCursor: { line: 1, ch: 0 },
        solution: '3dd',
        command: '3dd',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'copy-paste-lines',
    title: 'Copy/Paste Lines',
    keys: 'y p P',
    theory: `- \`yy\` copies ("yanks") the current line
- \`p\` pastes **below**; \`P\` pastes **above**
- \`y\` is an operator too: \`yw\` yanks a word, \`y$\` to end of line

Duplicate the config line with \`yy\` then \`p\`.`,
    tasks: [
      {
        prompt: 'Yank the line with `yy`, then paste a copy below with `p`.',
        buffer: 'const retries = 3',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const retries = 3\nconst retries = 3',
        goalCursor: { line: 1, ch: 0 },
        solution: 'yyp',
        command: 'yy',
        parSeconds: 8,
      },
      {
        prompt: 'Yank the line, then paste it above with `P` (line ends up on top).',
        buffer: 'console.log("ping")',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'console.log("ping")\nconsole.log("ping")',
        goalCursor: { line: 0, ch: 0 },
        solution: 'yyP',
        command: 'yy',
        parSeconds: 8,
      },
    ],
  },
]
