import type { Lesson } from './types'

// Section 6 — Text Objects: Quotes. Original text and snippets.

export const quotes: Lesson[] = [
  {
    slug: 'delete-inside-quotes',
    title: 'Delete Inside Quotes',
    keys: 'd i "',
    theory: `\`di"\` deletes everything **inside** the nearest quoted string — double or single quotes both work. The cursor doesn't even need to be inside the quotes; Vim finds the nearest pair.

Classic use: emptying a string before retyping it.`,
    tasks: [
      {
        prompt: 'Empty the string with `di"` (cursor anywhere on the line).',
        buffer: 'const env = "production"',
        cursor: { line: 0, ch: 6 },
        goalBuffer: 'const env = ""',
        goalCursor: { line: 0, ch: 13 },
        solution: 'di"',
        command: 'di"',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'delete-around-quotes',
    title: 'Delete Around Quotes',
    keys: 'd a "',
    theory: `\`da"\` deletes the quotes **and** their contents — the string ceases to exist.

Remove the noisy label argument completely.`,
    tasks: [
      {
        prompt: 'Delete the string including its quotes with `da"`.',
        buffer: 'log("debug-tag", payload)',
        cursor: { line: 0, ch: 8 },
        goalBuffer: 'log(, payload)',
        goalCursor: { line: 0, ch: 4 },
        solution: 'da"',
        command: 'da"',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'change-inside-quotes',
    title: 'Change Inside Quotes',
    keys: 'c i "',
    theory: `\`ci"\` = retype a string in place: \`ci"\` + new text + \`Esc\`. You'll use this daily — changing URLs, flags, env names.

Update the value.`,
    tasks: [
      {
        prompt: 'Change the string contents to `staging` with `ci"`, then `Esc`.',
        buffer: 'const env = "dev"',
        cursor: { line: 0, ch: 12 },
        goalBuffer: 'const env = "staging"',
        goalCursor: { line: 0, ch: 19 },
        solution: 'ci"staging<Esc>',
        command: 'ci"',
        parSeconds: 12,
      },
    ],
  },
  {
    slug: 'change-around-quotes',
    title: 'Change Around Quotes',
    keys: 'c a "',
    theory: `\`ca"\` swaps the whole quoted token — quotes included. Use it when a string must become something that isn't a string.

Turn the string into a bare number.`,
    tasks: [
      {
        prompt: 'Replace `"60"` (quotes too) with `60` using `ca"`, then `Esc`.',
        buffer: 'const ttl = "60"',
        cursor: { line: 0, ch: 12 },
        goalBuffer: 'const ttl = 60',
        goalCursor: { line: 0, ch: 13 },
        solution: 'ca"60<Esc>',
        command: 'ca"',
        parSeconds: 12,
      },
    ],
  },
  {
    slug: 'quotes-review',
    title: 'Quotes Review',
    keys: 'review',
    theory: `Four quote commands, one review: \`di"\` \`da"\` \`ci"\` \`ca"\`.`,
    tasks: [
      {
        prompt: 'Empty the string with `di\'` (single quotes work the same).',
        buffer: "const sep = ','",
        cursor: { line: 0, ch: 6 },
        goalBuffer: "const sep = ''",
        goalCursor: { line: 0, ch: 12 },
        solution: "di'",
        command: "di'",
        parSeconds: 8,
      },
      {
        prompt: 'Rewrite the string as `wss://` with `ci"`, then `Esc`.',
        buffer: 'const proto = "https://"',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'const proto = "wss://"',
        goalCursor: { line: 0, ch: 19 },
        solution: 'ci"wss://<Esc>',
        command: 'ci"',
        parSeconds: 14,
      },
    ],
  },
]
