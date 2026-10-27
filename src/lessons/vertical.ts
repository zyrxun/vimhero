import type { Lesson } from './types'

// Section 3 — Advanced Vertical Movement. Original text and snippets.

export const vertical: Lesson[] = [
  {
    slug: 'relative-line-jumps',
    title: 'Relative Line Jumps',
    keys: '{n} j k',
    theory: `Prefixing a count makes motions fly: \`5j\` is "down 5 lines" in one keypress.

Pro tip: turn on \`relativenumber\` in your real editor and line distances become readable — jump exactly what the gutter says. Take the express elevator down.`,
    tasks: [
      {
        prompt: 'Jump down 6 lines in one move with `6j`.',
        buffer: 'line 0\nline 1\nline 2\nline 3\nline 4\nline 5\nline 6 target\nline 7',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'line 0\nline 1\nline 2\nline 3\nline 4\nline 5\nline 6 target\nline 7',
        goalCursor: { line: 6, ch: 0 },
        solution: '6j',
        command: '{n}j',
        parSeconds: 6,
      },
    ],
  },
  {
    slug: 'absolute-line-jumps',
    title: 'Absolute Line Jumps',
    keys: 'g g G',
    theory: `- \`gg\` — first line of the file
- \`G\` — last line of the file
- \`{n}G\` — jump to line \`n\` (e.g. \`42G\`)

When a test suite says "error at line 87", \`87G\` gets you there instantly.`,
    tasks: [
      {
        prompt: 'Jump to the last line with `G`.',
        buffer: 'const a = 1\nconst b = 2\nconst c = 3',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const a = 1\nconst b = 2\nconst c = 3',
        goalCursor: { line: 2, ch: 0 },
        solution: 'G',
        command: 'G',
        parSeconds: 5,
      },
      {
        prompt: 'Jump to line 2 with `2G` (lines are counted from 1).',
        buffer: 'one\ntwo\nthree\nfour',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'one\ntwo\nthree\nfour',
        goalCursor: { line: 1, ch: 0 },
        solution: '2G',
        command: '{n}G',
        parSeconds: 5,
      },
    ],
  },
  {
    slug: 'paragraph-jumps',
    title: 'Paragraph Jumps',
    keys: '} {',
    theory: `- \`}\` — next blank-line boundary (next paragraph)
- \`{\` — previous paragraph

Functions in most files are separated by blank lines, so these two keys hop function-to-function. Ride to the next function.`,
    tasks: [
      {
        prompt: 'Jump to the start of the next function with `}`.',
        buffer: 'function alpha() {\n  return 1\n}\n\nfunction beta() {\n  return 2\n}',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'function alpha() {\n  return 1\n}\n\nfunction beta() {\n  return 2\n}',
        goalCursor: { line: 3, ch: 0 },
        solution: '}',
        command: '}',
        parSeconds: 6,
      },
    ],
  },
  {
    slug: 'window-scrolls',
    title: 'Window Scrolls',
    keys: 'Ctrl+u Ctrl+d',
    theory: `For big files, scroll by half-screens without moving the cursor mode:

- \`Ctrl+d\` — scroll **d**own half a window
- \`Ctrl+u\` — scroll **u**p half a window

(\`Ctrl+f\`/\`Ctrl+b\` do full pages if you want more.) Scroll down once.`,
    tasks: [
      {
        prompt: 'Scroll down half a screen with `Ctrl+d` (the view moves — cursor stays on its line if possible).',
        buffer: Array.from({ length: 12 }, (_, i) => `// padding line ${i + 1}`).join('\n'),
        cursor: { line: 0, ch: 0 },
        goalBuffer: Array.from({ length: 12 }, (_, i) => `// padding line ${i + 1}`).join('\n'),
        // scrolling doesn't change text or cursor position in this sandbox
        goalCursor: { line: 0, ch: 0 },
        solution: '<C-d>',
        command: '<C-d>',
        parSeconds: 5,
      },
    ],
  },
]
