import type { Lesson } from './types'

// Section 4 — Search. Original text and snippets.

export const search: Lesson[] = [
  {
    slug: 'search',
    title: 'Search',
    keys: '/ ?',
    theory: `- \`/pattern\` + \`Enter\` — search **forward** through the file
- \`?pattern\` + \`Enter\` — search **backward**

After a search, \`n\` jumps to the next match, \`N\` to the previous. This is usually faster than \`f\` across multiple lines. Find the needle.`,
    tasks: [
      {
        prompt: 'Search for `needle` — type `/needle` then `Enter`.',
        buffer: 'const hay = ["x", "y"]\nconst found = "needle"\nconsole.log(found)',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const hay = ["x", "y"]\nconst found = "needle"\nconsole.log(found)',
        goalCursor: { line: 1, ch: 14 },
        solution: '/needle<CR>',
        command: '/',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'repeat-search',
    title: 'Repeat Search',
    keys: 'n N',
    theory: `- \`n\` — go to the **next** match (same direction)
- \`N\` — previous match (flip direction)

Search once, then hop through every hit with \`n\`. Land on the last of the three \`todo\` matches.`,
    tasks: [
      {
        prompt: 'Search for `todo`, then press `n` twice to reach the third match.',
        buffer: '// todo: cleanup\nconst items = []\n// todo: tests\nexport const ready = false\n// todo: ship it',
        cursor: { line: 0, ch: 0 },
        goalBuffer: '// todo: cleanup\nconst items = []\n// todo: tests\nexport const ready = false\n// todo: ship it',
        goalCursor: { line: 4, ch: 3 },
        solution: '/todo<CR>nn',
        command: 'n',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'quick-word-search',
    title: 'Quick Word Search',
    keys: '* #',
    theory: `- \`*\` — search for the word **under the cursor**, forward
- \`#\` — same, backward

Zero typing: put the cursor on any identifier, hit \`*\`, and every occurrence lights up. From the first \`count\`, jump to the next one.`,
    tasks: [
      {
        prompt: 'Cursor is on the first `count`. Press `*` to jump to the next occurrence.',
        buffer: 'const count = items.length\nif (count > 0) {\n  console.log(count)\n}',
        cursor: { line: 0, ch: 6 },
        goalBuffer: 'const count = items.length\nif (count > 0) {\n  console.log(count)\n}',
        goalCursor: { line: 1, ch: 5 },
        solution: '*',
        command: '*',
        parSeconds: 6,
      },
    ],
  },
  {
    slug: 'search-review',
    title: 'Search Review',
    keys: 'review',
    theory: `The full search toolkit: \`/\` + \`n\`/\`N\` for text, \`*\`/\`#\` for the word under the cursor, \`?\` to sweep backward.

Warm-up: three quick finds, one motion each.`,
    tasks: [
      {
        prompt: 'Search for `deploy` and land on it.',
        buffer: 'const env = "prod"\nconst script = "deploy.sh"\nconst key = "K1"',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const env = "prod"\nconst script = "deploy.sh"\nconst key = "K1"',
        goalCursor: { line: 1, ch: 16 },
        solution: '/deploy<CR>',
        command: '/',
        parSeconds: 8,
      },
      {
        prompt: 'From the first `port`, hit `*` to find the next one.',
        buffer: 'const port = 8080\nstart(port)',
        cursor: { line: 0, ch: 6 },
        goalBuffer: 'const port = 8080\nstart(port)',
        goalCursor: { line: 1, ch: 6 },
        solution: '*',
        command: '*',
        parSeconds: 6,
      },
    ],
  },
]
