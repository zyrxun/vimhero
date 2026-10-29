import type { Lesson } from './types'
import { pick, pickArgs, pickDistinct, pickIdent, pickNum, pickString } from './variants.ts'

// Section 5 — Text Objects: Bracket Pairs. Original text and snippets.

export const brackets: Lesson[] = [
  {
    slug: 'intro-to-text-objects',
    title: 'Intro to Text Objects',
    keys: 'text objects',
    theory: `Text objects let an operator act on a **structural unit** instead of a motion:

\`{operator}{i|a}{object}\` — \`i\` = **i**nner (contents only), \`a\` = **a**ll (contents + the wrapper).

So \`di(\` = delete what's inside the parens; \`da(\` = delete the parens too. Objects exist for brackets, quotes, words, paragraphs. This section: brackets \`(\`, \`{\`, \`[\`.`,
    tasks: [
      {
        prompt: 'Delete the contents of every highlighted call with `di(` — three to go, deletions stay deleted.',
        chain: {
          genBuffer: () => {
            const [a1, a2, a3] = pickDistinct(3, pickArgs)
            const fns = [pickIdent(), pickIdent(), pickIdent(), pickIdent(), pickIdent()]
            return [
              `run(${a1})`,
              `load(${a2})`,
              `const ${fns[0]} = ${pickNum()}`,
              `send(${a3})`,
              `const ${fns[1]} = pair(${fns[2]}, ${pickNum()})`,
              `const parsed = join(${fns[3]}, ${fns[4]})`,
            ].join('\n')
          },
          parts: (buf) => {
            const targets = buf.split('\n').filter((l) => /^[a-z]+\((?!$)/.test(l)).map((l) => l.slice(l.indexOf('(') + 1, l.indexOf(')')))
            if (targets.length !== 3) throw new Error(`di( chain: expected 3 call targets, got ${targets.length}`)
            return targets.map((a) => ({ find: a, label: 'empty the highlighted call with di(' }))
          },
        },
        solution: 'di(',
        command: 'di(',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'delete-inside-brackets',
    title: 'Delete Inside Brackets',
    keys: 'd i {',
    theory: `\`di{\` (mnemonic: **d**elete **i**nner **{**) empties a \`{...}\` block, leaving the braces. Works from anywhere **inside** the block — no precise positioning needed.

Common aliases: \`di{\` = \`diB\`. Empty the object.`,
    tasks: [
      {
        prompt: 'Empty the object with `di{` — cursor is on `name`.',
        buffer: 'const user = { name: "Ada", id: 7 }',
        cursor: { line: 0, ch: 16 },
        goalBuffer: 'const user = {}',
        goalCursor: { line: 0, ch: 14 },
        solution: 'di{',
        command: 'di{',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'delete-around-brackets',
    title: 'Delete Around Brackets',
    keys: 'd a {',
    theory: `\`da{\` = delete **a**ll of it — braces included. One more keypress than \`di{\`, kills the whole block.

Delete the stale config block entirely.`,
    tasks: [
      {
        prompt: 'Delete the whole `{ ... }` block, braces and all, with `da{`.',
        buffer: 'const config = { retries: 3 };\nstart()',
        cursor: { line: 0, ch: 20 },
        goalBuffer: 'const config = ;\nstart()',
        goalCursor: { line: 0, ch: 15 },
        solution: 'da{',
        command: 'da{',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'change-inside-brackets',
    title: 'Change Inside Brackets',
    keys: 'c i {',
    theory: `\`ci{\` = empty the block **and** start typing the replacement. The swap-the-arguments move: \`ci{\` + new args + \`Esc\`.

Rewrite the function body.`,
    tasks: [
      {
        prompt: 'Replace the object contents with `mode: "fast"` using `ci{`, then `Esc`.',
        gen: () => {
          const pairs = pick(['slow: true, retries: 9', 'debug: false, depth: 4', 'cache: true, ttl: 60', 'retries: 3, verbose: true'])
          const cursor = 15
          return {
            buffer: `const opts = { ${pairs} }`,
            cursor: { line: 0, ch: cursor },
            goalBuffer: 'const opts = {mode: "fast"}',
            goalCursor: { line: 0, ch: 25 },
          }
        },
        solution: 'ci{mode: "fast"<Esc>',
        command: 'ci{',
        parSeconds: 14,
      },
    ],
  },
  {
    slug: 'change-around-brackets',
    title: 'Change Around Brackets',
    keys: 'c a {',
    theory: `\`ca{\` changes the block **including** the braces — for when the shape itself is wrong, e.g. turning an object into a plain value. After typing your replacement you'll add the new wrapper yourself.

Swap the object for a plain number.`,
    tasks: [
      {
        prompt: 'Replace the entire `{ "v1" }` (braces included) with just `2` using `ca{`, then `Esc`.',
        buffer: 'const schema = { "v1" }',
        cursor: { line: 0, ch: 18 },
        goalBuffer: 'const schema = 2',
        goalCursor: { line: 0, ch: 15 },
        solution: 'ca{2<Esc>',
        command: 'ca{',
        parSeconds: 12,
      },
    ],
  },
  {
    slug: 'brackets-review',
    title: 'Brackets Review',
    keys: 'review',
    theory: `Drill: \`di(\` \`da(\` \`ci{\` \`ca{\` — inner vs around, parens vs braces. Three rapid-fire tasks.`,
    tasks: [
      {
        prompt: 'Empty the array (works with `[` too) using `di[`.',
        gen: () => {
          const nums = pick(['1, 2, 3', '10, 20, 30', '5', '60, 12'])
          return {
            buffer: `const nums = [${nums}]`,
            cursor: { line: 0, ch: 15 },
            goalBuffer: 'const nums = []',
            goalCursor: { line: 0, ch: 14 },
          }
        },
        solution: 'di[',
        command: 'di[',
        parSeconds: 8,
      },
      {
        prompt: 'Delete the whole call including parens with `da(`.',
        gen: () => {
          const fn = pick(['setup', 'init', 'boot', 'start'])
          const args = pickArgs()
          const cursor = fn.length + 5
          return {
            buffer: `${fn}(debug(${args}))\nrun()`,
            cursor: { line: 0, ch: cursor },
            goalBuffer: `${fn}\nrun()`,
            goalCursor: { line: 0, ch: fn.length },
          }
        },
        solution: 'da(',
        command: 'da(',
        parSeconds: 10,
      },
      {
        snapCursor: true,
        prompt: 'Swap the block contents for `return 0` with `ci{`, then `Esc`.',
        buffer: 'function exit() {\n  process.exit(1)\n}',
        cursor: { line: 1, ch: 2 },
        goalBuffer: 'function exit() {return 0}',
        goalCursor: { line: 0, ch: 23 },
        solution: 'ci{return 0<Esc>',
        command: 'ci{',
        parSeconds: 14,
      },
    ],
  },
]
