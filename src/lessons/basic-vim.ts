import type { Lesson } from './types'
import { pickNum, pickString } from './variants.ts'

// Section 1 — Basic Vim. All lesson text and code snippets are original.

export const basicVim: Lesson[] = [
  {
    slug: 'intro-to-modes',
    title: 'Intro to Modes',
    keys: 'modes',
    theory: `Vim's one big idea is **modes**. The same key does something different depending on the mode you're in.

- **Normal mode** is home base: move around, delete, copy, run commands. Vim always drops you here.
- **Insert mode** is for typing text like a regular editor.

Press \`i\` to enter insert mode. Press \`Esc\` to jump back to normal mode. Try both below — the mode indicator under the editor tells you where you are.`,
    tasks: [
      {
        prompt: 'Press `i` to enter insert mode, then `Esc` to return to normal mode. Watch the mode badge.',
        buffer: 'const greeting = "hello"\nconsole.log(greeting)',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const greeting = "hello"\nconsole.log(greeting)',
        goalCursor: { line: 0, ch: 0 },
        solution: 'i<Esc>',
        command: 'modes',
        parSeconds: 5,
      },
    ],
  },
  {
    slug: 'basic-movement',
    title: 'Basic Movement',
    keys: 'h j k l',
    theory: `In normal mode you never touch the arrow keys — your fingers stay on home row:

- \`h\` — left
- \`j\` — down
- \`k\` — up
- \`l\` — right

Feels odd for a day, automatic by the end of the week. Move the cursor onto the \`X\` on line 3.`,
    tasks: [
      {
        prompt: 'Move the cursor onto the `X` at the end of line 3 using h/j/k/l only.',
        buffer: 'const a = 1\nconst b = 2\nconst c = X\nconst d = 4',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const a = 1\nconst b = 2\nconst c = X\nconst d = 4',
        goalCursor: { line: 2, ch: 9 },
        solution: 'jjllllllllll',
        command: 'hjkl',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'moving-with-words',
    title: 'Moving by Words',
    keys: 'w e b',
    theory: `Jumping word by word beats holding \`l\`:

- \`w\` — jump to the **start** of the next word
- \`e\` — jump to the **end** of the current/next word
- \`b\` — jump **back** to the start of the current/previous word

A "word" is letters/digits — punctuation like \`=\` or \`(\` counts as its own tiny word. Get to the \`X\` using word motions.`,
    tasks: [
      {
        prompt: 'Use `w` (or `e`/`b`) to land on the `X` in `target` on line 4.',
        buffer: 'function setup(opts) {\n  const mode = "fast"\n  const retries = 3\n  return target(opts)\n}',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'function setup(opts) {\n  const mode = "fast"\n  const retries = 3\n  return target(opts)\n}',
        goalCursor: { line: 3, ch: 9 },
        solution: '17w',
        command: 'web',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'insert',
    title: 'Insert Mode',
    keys: 'i a esc',
    theory: `Two ways in, one way out:

- \`i\` — insert **before** the cursor
- \`a\` — insert **after** the cursor (append)

\`Esc\` always brings you back to normal mode. Fix the typo: jump next to it, enter insert mode, type the missing letters, \`Esc\`.`,
    tasks: [
      {
        prompt: 'The output says `Helo`. Insert the missing `l` — cursor is on the `l`. Use `i`, type, then `Esc`.',
        buffer: 'console.log("Helo")',
        cursor: { line: 0, ch: 15 },
        goalBuffer: 'console.log("Hello")',
        goalCursor: { line: 0, ch: 15 },
        solution: 'il<Esc>',
        command: 'i',
        parSeconds: 10,
      },
      {
        prompt: 'Append a missing semicolon at the end of the line with `a` (cursor on the last `2`).',
        buffer: 'let total = 42',
        cursor: { line: 0, ch: 13 },
        goalBuffer: 'let total = 42;',
        goalCursor: { line: 0, ch: 14 },
        solution: 'a;<Esc>',
        command: 'a',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'uppercase-commands',
    title: 'Uppercase Commands',
    keys: 'shift',
    theory: `Uppercase variants are close relatives:

- \`I\` — insert at the **first non-blank** character of the line
- \`A\` — insert at the **end** of the line

No more navigating to the spot first — the command takes you there. Add \`done\` to the end of the todo line with one keypress + typing.`,
    tasks: [
      {
        prompt: 'Use `A` to append ` // done` (space, //, space, done) at the end of the line, then `Esc`.',
        buffer: 'deploy --prod',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'deploy --prod // done',
        goalCursor: { line: 0, ch: 20 },
        solution: 'A // done<Esc>',
        command: 'A',
        parSeconds: 12,
      },
      {
        prompt: 'Use `I` to insert `# ` at the very start of the line, then `Esc`.',
        buffer: 'TODO fix the parser',
        cursor: { line: 0, ch: 10 },
        goalBuffer: '# TODO fix the parser',
        goalCursor: { line: 0, ch: 1 },
        solution: 'I# <Esc>',
        command: 'I',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'insert-at-line-ends',
    title: 'Insert at Line Ends',
    keys: 'I A esc',
    theory: `Practice round: \`I\` and \`A\` work on **every line you jump to**. Combine with \`j\`/\`k\` to fix several lines fast.

The classic rhythm: \`A\` + type + \`Esc\` + \`j\` + \`.\` (repeat last change — more on that later). Here, do it manually on two lines.`,
    tasks: [
      {
        prompt: 'Append `;` to both lines. `A;` then `Esc`, `j`, `.` (dot repeats your last change!).',
        buffer: 'const x = 1\nconst y = 2',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const x = 1;\nconst y = 2;',
        goalCursor: { line: 1, ch: 10 },
        solution: 'A;<Esc>j.;',
        command: 'A',
        parSeconds: 15,
      },
    ],
  },
  {
    slug: 'open',
    title: 'Opening New Lines',
    keys: 'o O',
    theory: `Stay in normal mode to create lines:

- \`o\` — open a line **below** and start inserting
- \`O\` — open a line **above** and start inserting

Both drop you into insert mode at the right spot, automatically indented to match the line above.`,
    tasks: [
      {
        prompt: 'With the cursor on the first line, use `o` to open a line below and type `return true`, then `Esc`.',
        buffer: 'function ok() {',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'function ok() {\n  return true',
        goalCursor: { line: 1, ch: 12 },
        solution: 'oreturn true<Esc>',
        command: 'o',
        parSeconds: 12,
      },
      {
        prompt: 'Use `O` to open a line above and add the import, then `Esc`.',
        buffer: 'const app = express()',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'import express from "express"\nconst app = express()',
        goalCursor: { line: 0, ch: 29 },
        solution: 'Oimport express from "express"<Esc>',
        command: 'O',
        parSeconds: 14,
      },
    ],
  },
  {
    slug: 'small-edits',
    title: 'Making Small Edits',
    keys: 's x r',
    theory: `Quick fixes without entering insert mode "properly":

- \`x\` — delete the character under the cursor (stay in normal mode)
- \`r\` — replace exactly **one** character, then back to normal
- \`s\` — delete the character and start inserting (substitute)

Use \`x\` to strip the trailing \`.\` off the string.`,
    tasks: [
      {
        prompt: 'Delete the stray `.` at the end of the string with `x` (cursor is on it).',
        gen: () => {
          const s = pickString()
          const buf = `const msg = "${s}."`
          const dot = buf.length - 2
          return {
            buffer: buf,
            cursor: { line: 0, ch: dot },
            goalBuffer: `const msg = "${s}"`,
            goalCursor: { line: 0, ch: dot - 1 },
          }
        },
        solution: 'x',
        command: 'x',
        parSeconds: 6,
      },
      {
        prompt: 'Replace the last digit with `2` using `r` (cursor is on it).',
        gen: () => {
          const n = pickNum()
          const buf = `const version = ${n}`
          const c = buf.length - 1
          return {
            buffer: buf,
            cursor: { line: 0, ch: c },
            goalBuffer: buf.slice(0, c) + '2',
            goalCursor: { line: 0, ch: c },
          }
        },
        solution: 'r2',
        command: 'r',
        parSeconds: 6,
      },
    ],
  },
  {
    slug: 'moving-by-upper-words',
    title: 'Moving by WORDs',
    keys: 'W E B',
    theory: `Uppercase word motions move by **WORDS** — whitespace-separated chunks, punctuation ignored:

- \`W\` — next WORD start
- \`E\` — end of WORD
- \`B\` — back a WORD

In \`user.profile.name\`, lowercase \`w\` stops at every dot; \`W\` sails past the whole token. Cross the dotted mess to the \`X\`.`,
    tasks: [
      {
        prompt: 'Use `W` to jump over the dotted chain and land on `X` (the `e` of `end`).',
        buffer: 'config.services.auth.token.refreshMs = X',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'config.services.auth.token.refreshMs = X',
        goalCursor: { line: 0, ch: 40 },
        solution: 'WW',
        command: 'W',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'moving-to-line-ends',
    title: 'Moving to Line Ends',
    keys: '0 _ $',
    theory: `Line-scope jumps:

- \`0\` — column 0, very start of the line
- \`^\` — first **non-blank** character (usually what you want)
- \`$\` — end of the line
- \`_\` — first non-blank of the current line

Land the cursor on the last character of line 2.`,
    tasks: [
      {
        prompt: 'Jump to the end of line 2 with `$` (cursor starts on line 1).',
        buffer: 'const a = 1\nconst longer = 200\nconst c = 3',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const a = 1\nconst longer = 200\nconst c = 3',
        goalCursor: { line: 1, ch: 17 },
        solution: 'j$',
        command: '$',
        parSeconds: 6,
      },
      {
        prompt: 'Get to the first non-blank character of the indented line using `j` then `^`.',
        buffer: 'if (ready) {\n  launch()\n}',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'if (ready) {\n  launch()\n}',
        goalCursor: { line: 1, ch: 2 },
        solution: 'j^',
        command: '^',
        parSeconds: 6,
      },
    ],
  },
  {
    slug: 'find',
    title: 'Find Character',
    keys: 'f F ;',
    theory: `\`f{char}\` jumps **forward** to the next occurrence of \`char\` on the same line. \`F{char}\` searches backward.

- \`;\` — repeat the last find in the same direction
- \`,\` — repeat opposite direction

Cursor is a flat jump — the fastest way across a line. Find the \`;\`.`,
    tasks: [
      {
        prompt: 'Use `f;` to jump onto the semicolon.',
        buffer: 'const total = price * quantity;',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const total = price * quantity;',
        goalCursor: { line: 0, ch: 30 },
        solution: 'f;',
        command: 'f',
        parSeconds: 6,
      },
      {
        prompt: 'Jump to the second `e` in the line: `fe` then `;`.',
        buffer: 'let settled = false',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'let settled = false',
        goalCursor: { line: 0, ch: 5 },
        solution: 'fe;',
        command: 'f;',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'till',
    title: 'Till Character',
    keys: 't T ;',
    theory: `\`t{char}\` jumps **till** just *before* the char; \`T{char}\` does it backward. Perfect when you want to land one column short — e.g. inside quotes.

\`f(\` puts you on the paren; \`t(\` puts you right before it. Land between the quotes.`,
    tasks: [
      {
        prompt: 'Use `t"` to land just before the opening quote.',
        buffer: 'const tag = "beta"',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const tag = "beta"',
        goalCursor: { line: 0, ch: 11 },
        solution: 't"',
        command: 't',
        parSeconds: 6,
      },
    ],
  },
  {
    slug: 'intro-to-operators',
    title: 'Intro to Operators',
    keys: 'operators',
    theory: `Now the real power: **operator + motion**. An operator says *what to do*, a motion says *how far*:

\`d$\` = delete to end of line · \`d w\` = delete a word · \`c\` is like \`d\` but drops you into insert mode (change).

Grammar, not memorization: every motion you learned (\`w\`, \`$\`, \`f-\`, ...) now works as an argument to every operator (\`d\`, \`c\`, \`y\`). Try the first one below.`,
    tasks: [
      {
        prompt: 'Delete from the cursor to the end of the line with `d$`.',
        buffer: 'const err = new Error("boom"); // TODO',
        cursor: { line: 0, ch: 30 },
        goalBuffer: 'const err = new Error("boom");',
        goalCursor: { line: 0, ch: 29 },
        solution: 'd$',
        command: 'd$',
        parSeconds: 6,
      },
    ],
  },
]
