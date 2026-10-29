import type { Lesson } from './types'
import { pickDistinct, pickIdent, pickWord } from './variants.ts'

// Section 7 — Text Objects: Words & Paragraphs. Original text and snippets.

export const wordsParagraphs: Lesson[] = [
  {
    slug: 'delete-inside-word',
    title: 'Delete Inside Word',
    keys: 'd i w',
    theory: `\`diw\` deletes the word under the cursor — wherever it is in the word. No need to park on the first letter like \`dw\` requires.

Note the asymmetry: on the space before a word, \`diw\` still grabs the word, not the space. Kill the typo word.`,
    tasks: [
      {
        prompt: 'Delete every highlighted word with `diw` — three to go, deletions stay deleted.',
        chain: {
          genBuffer: () => {
            const [w1, w2, w3] = pickDistinct(3, pickWord)
            const ids = [pickIdent(), pickIdent(), pickIdent()]
            return [
              `// review notes: the ${w1} flag and the ${ids[0]} bucket`,
              `// second pass: mark the ${w2} rows and audit ${ids[1]}`,
              `// final pass: clear the ${w3} queue, then sync ${ids[2]}`,
            ].join('\n')
          },
          parts: (buf) => {
            const words = buf.split(/\s+/).filter((w) => ['broken', 'stale', 'cached', 'dirty', 'empty', 'offset', 'marker', 'sample', 'draft', 'legacy'].includes(w))
            if (words.length !== 3) throw new Error(`diw chain: expected 3 target words, got ${words.length}`)
            return words.map((w) => ({ find: w, label: `delete the word "${w}" with diw` }))
          },
        },
        solution: 'diw',
        command: 'diw',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'delete-around-word',
    title: 'Delete Around Word',
    keys: 'd a w',
    theory: `\`daw\` deletes the word **plus** one adjacent space — words come out clean, without leaving double gaps.

This is the one for removing a word from a sentence.`,
    tasks: [
      {
        prompt: 'Remove every highlighted word cleanly with `daw` — no double spaces left, deletions stay deleted.',
        chain: {
          genBuffer: () => {
            const [w1, w2, w3] = pickDistinct(3, pickWord)
            return [
              `this run treats the ${w1} flag as required`,
              `the scheduler skips the ${w2} rows by default`,
              `operators agree the ${w3} queue drains last`,
            ].join('\n')
          },
          parts: (buf) => {
            const words = buf.split(/\s+/).filter((w) => ['broken', 'stale', 'cached', 'dirty', 'empty', 'offset', 'marker', 'sample', 'draft', 'legacy'].includes(w))
            if (words.length !== 3) throw new Error(`daw chain: expected 3 target words, got ${words.length}`)
            return words.map((w) => ({ find: w + ' ', label: `remove the word "${w}" (and its space) with daw` }))
          },
        },
        solution: 'daw',
        command: 'daw',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'change-inside-word',
    title: 'Change Inside Word',
    keys: 'c i w',
    theory: `\`ciw\` — the rename command. Stand anywhere on the identifier, \`ciw\`, type the new name, \`Esc\`. No precise cursor placement, ever.

Rename the variable.`,
    tasks: [
      {
        prompt: 'Rename the identifier to `user` with `ciw`, then `Esc`.',
        gen: () => {
          const id = pickIdent()
          const buf = `const ${id} = getSession()`
          return {
            buffer: buf,
            cursor: { line: 0, ch: 6 },
            goalBuffer: 'const user = getSession()',
            goalCursor: { line: 0, ch: 9 },
          }
        },
        solution: 'ciwuser<Esc>',
        command: 'ciw',
        parSeconds: 18,
      },
    ],
  },
  {
    slug: 'words-review',
    title: 'Words Review',
    keys: 'review',
    theory: `Mixed drill: \`diw\` \`daw\` \`ciw\`, plus a count — \`c2iw\` changes two words at once (or \`d2aw\` deletes two).`,
    tasks: [
      {
        prompt: 'Change the word `broken` to `fixed` with `ciw`, then `Esc`.',
        buffer: 'let value = broken here',
        cursor: { line: 0, ch: 12 },
        goalBuffer: 'let value = fixed here',
        goalCursor: { line: 0, ch: 16 },
        solution: 'ciwfixed<Esc>',
        command: 'ciw',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'delete-inside-paragraph',
    title: 'Delete Inside Paragraph',
    keys: 'd i p',
    theory: `A paragraph = a block of text surrounded by blank lines. \`dip\` empties the block you're in; the blank lines stay.

Handy for clearing a docstring or a block of config.`,
    tasks: [
      {
        prompt: 'Clear each highlighted paragraph with `dip` — the blank lines stay, deletions stay deleted.',
        chain: {
          genBuffer: () => {
            const [w1, w2, w3] = pickDistinct(3, pickWord)
            const ids = [pickIdent(), pickIdent(), pickIdent(), pickIdent()]
            return [
              `keep: this block stays`,
              ``,
              `scratch ${w1} notes here`,
              `more scratch ${ids[0]} lines`,
              ``,
              `keep: this block survives too`,
              ``,
              `scratch ${w2} remarks below`,
              `extra scratch ${ids[1]} detail`,
              ``,
              `keep: untouched block`,
              ``,
              `scratch ${w3} leftovers`,
              `last scratch ${ids[2]} trailing`,
              ``,
              `keep: ending block ${ids[3]}`,
            ].join('\n')
          },
          parts: (buf) => {
            const targets = buf.split('\n').filter((l) => l.startsWith('scratch ') || l.startsWith('extra scratch ') || l.startsWith('more scratch ') || l.startsWith('last scratch '))
            if (targets.length !== 6) throw new Error(`dip chain: expected 6 scratch lines, got ${targets.length}`)
            const out = []
            for (let i = 0; i < targets.length; i += 2) {
              // dip consumes the paragraph text AND one trailing newline
              out.push({ find: targets[i] + '\n' + targets[i + 1] + '\n', label: 'clear the scratch paragraph with dip' })
            }
            return out
          },
        },
        solution: 'dip',
        command: 'dip',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'delete-around-paragraph',
    title: 'Delete Around Paragraph',
    keys: 'd a p',
    theory: `\`dap\` removes the paragraph **and** one of its surrounding blank lines — blocks collapse together. It's the delete-a-whole-function-body move.

Delete the dead function block outright.`,
    tasks: [
      {
        prompt: 'Delete the whole middle block with `dap`.',
        buffer: 'function keep() {\n  return 1\n}\n\nfunction dead() {\n  return null\n}\n\nfunction keep2() {\n  return 2\n}',
        cursor: { line: 4, ch: 0 },
        goalBuffer: 'function keep() {\n  return 1\n}\n\nfunction keep2() {\n  return 2\n}',
        goalCursor: { line: 4, ch: 0 },
        solution: 'dap',
        command: 'dap',
        parSeconds: 12,
      },
    ],
  },
  {
    slug: 'change-inside-paragraph',
    title: 'Change Inside Paragraph',
    keys: 'c i p',
    theory: `\`cip\` clears the block and lets you retype it — rewrite a comment block or a config stanza in one command.`,
    tasks: [
      {
        prompt: 'Rewrite the paragraph to a single line `export default config` with `cip`, then `Esc`.',
        buffer: 'const config = {\n  retries: 3,\n  timeout: 1000,\n}',
        cursor: { line: 1, ch: 0 },
        goalBuffer: 'export default config',
        goalCursor: { line: 0, ch: 20 },
        solution: 'cipexport default config<Esc>',
        command: 'cip',
        parSeconds: 16,
      },
    ],
  },
  {
    slug: 'paragraphs-review',
    title: 'Paragraphs Review',
    keys: 'review',
    theory: `\`dip\` / \`dap\` / \`cip\` — inner keeps the blank lines, around collapses them, change lets you retype.`,
    tasks: [
      {
        prompt: 'Empty the middle paragraph, keep the blank lines, with `dip`.',
        buffer: 'alpha\n\nscratch one\nscratch two\n\nomega',
        cursor: { line: 2, ch: 0 },
        goalBuffer: 'alpha\n\n\nomega',
        goalCursor: { line: 2, ch: 0 },
        solution: 'dip',
        command: 'dip',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'text-objects-mega-review',
    title: 'Text Objects Mega Review',
    keys: 'review',
    theory: `The whole grammar in one screen: \`{d|c|y}{i|a}{w|p|(|"|{|\`}\`}\`.

You now know every piece. Three final tasks mix them.`,
    tasks: [
      {
        snapCursor: true,
        prompt: 'Duplicate the line below itself: `yy` then `p`.',
        buffer: 'export const VERSION = "9"',
        cursor: { line: 0, ch: 13 },
        goalBuffer: 'export const VERSION = "9"\nexport const VERSION = "9"',
        goalCursor: { line: 1, ch: 0 },
        solution: 'yyp',
        command: 'yyp',
        parSeconds: 12,
      },
      {
        snapCursor: true,
        prompt: 'Change the quoted URL path to `/v2/health` with `ci"`.',
        buffer: 'const ping = "/v1/status"',
        cursor: { line: 0, ch: 8 },
        goalBuffer: 'const ping = "/v2/health"',
        goalCursor: { line: 0, ch: 23 },
        solution: 'ci"/v2/health<Esc>',
        command: 'ci"',
        parSeconds: 14,
      },
      {
        snapCursor: true,
        prompt: 'Delete the whole array including brackets with `da[`.',
        buffer: 'const seeds = [3, 1, 4];\nshuffle(seeds)',
        cursor: { line: 0, ch: 18 },
        goalBuffer: 'const seeds = ;\nshuffle(seeds)',
        goalCursor: { line: 0, ch: 14 },
        solution: 'da[',
        command: 'da[',
        parSeconds: 10,
      },
    ],
  },
]
