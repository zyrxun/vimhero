import type { Lesson } from './types'
import { pick, pickDistinct, pickIdent, pickNum, pickWord } from './variants.ts'

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
        prompt: 'Delete the word (cursor is on it) with `dw`.',
        gen: () => {
          const n = pickIdent()
          const w = pickWord()
          const pre = `const ${n} = [`
          return {
            buffer: `${pre}${w}];`,
            cursor: { line: 0, ch: pre.length },
            goalBuffer: `${pre}];`,
            goalCursor: { line: 0, ch: pre.length },
          }
        },
        solution: 'dw',
        command: 'dw',
        parSeconds: 6,
      },
      {
        prompt: 'Delete two words at once with `d2w` — remove `dead code` (cursor on `d`).',
        buffer: 'return dead code; // result',
        cursor: { line: 0, ch: 7 },
        goalBuffer: 'return ; // result',
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
        prompt: 'Change the word in quotes to `fast` with `cw` (cursor is on it), then `Esc`.',
        gen: () => {
          const k = pick(['mode', 'env', 'tag', 'role'])
          const pre = `const ${k} = "`
          return {
            buffer: `${pre}slow"`,
            cursor: { line: 0, ch: pre.length },
            goalBuffer: `${pre}fast"`,
            goalCursor: { line: 0, ch: pre.length + 3 },
          }
        },
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
        prompt: 'Delete every highlighted dead line with `dd` — three to go, deletions stay deleted.',
        chain: {
          genBuffer: () => {
            const [w1, w2, w3] = pickDistinct(3, pickWord)
            const ids = [pickIdent(), pickIdent(), pickIdent()]
            return [
              `// ${pick(['wiring', 'runtime', 'module'])} — remove the dead lines`,
              `const ${ids[0]} = ${pickNum()}`,
              `// TODO: debug ${w1}`,
              `const ${ids[1]} = ${pickNum()}`,
              `// FIXME: stale ${w2}`,
              `const DEAD_${w3} = null`,
              `const ${ids[2]} = ${pickNum()}`,
              `export { ${ids[0]}, ${ids[1]}, ${ids[2]} }`,
            ].join('\n')
          },
          parts: (buf) => {
            const targets = buf.split('\n').filter((l) => l.includes('TODO') || l.includes('FIXME') || l.startsWith('const DEAD'))
            if (targets.length !== 3) throw new Error(`dd chain: expected 3 junk lines, got ${targets.length}`)
            return targets.map((t) => ({ find: t + '\n', label: 'delete the dead line with dd' }))
          },
        },
        solution: 'dd',
        command: 'dd',
        parSeconds: 6,
      },
      {
        prompt: 'Empty each highlighted comment line with `D` (cursor at line start) — deletions stay deleted.',
        chain: {
          genBuffer: () => {
            const [w1, w2, w3] = pickDistinct(3, pickWord)
            const ids = [pickIdent(), pickIdent(), pickIdent()]
            return [
              `const ${ids[0]} = ${pickNum()}`,
              `// pending: ${w1} checks`,
              `const ${ids[1]} = ${pickNum()}`,
              `// pending: ${w2} rollout`,
              `const ${ids[2]} = ${pickNum()}`,
              `// pending: ${w3} cleanup`,
              `export default ${ids[0]}`,
            ].join('\n')
          },
          parts: (buf) => {
            const targets = buf.split('\n').filter((l) => l.includes('pending:'))
            if (targets.length !== 3) throw new Error(`D chain: expected 3 comment lines, got ${targets.length}`)
            return targets.map((t) => ({ find: t, label: 'wipe the comment line with D' }))
          },
        },
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
        prompt: 'Delete each highlighted two-line block with `dj` — deletions stay deleted.',
        chain: {
          genBuffer: () => {
            const [w1, w2, w3] = pickDistinct(3, pickWord)
            const ids = [pickIdent(), pickIdent(), pickIdent()]
            return [
              `// batch run — clear the stale pairs`,
              `// stale ${w1} cache`,
              `const dropped_${w1} = true`,
              `const ${ids[0]} = ${pickNum()}`,
              `// stale ${w2} index`,
              `const dropped_${w2} = true`,
              `const ${ids[1]} = ${pickNum()}`,
              `// stale ${w3} queue`,
              `const dropped_${w3} = true`,
              `export { ${ids[0]}, ${ids[1]} }`,
            ].join('\n')
          },
          parts: (buf) => {
            const targets = buf.split('\n').filter((l) => l.includes('// stale '))
            if (targets.length !== 3) throw new Error(`dj chain: expected 3 stale pairs, got ${targets.length}`)
            return targets.map((t) => {
              const lines = buf.split('\n')
              const i = lines.indexOf(t)
              return { find: t + '\n' + lines[i + 1] + '\n', label: 'delete the stale pair with dj' }
            })
          },
        },
        solution: 'dj',
        command: 'dj',
        parSeconds: 8,
      },
      {
        prompt: 'Delete each highlighted three-line debug block with `3dd` — deletions stay deleted.',
        chain: {
          genBuffer: () => {
            const [w1, w2, w3] = pickDistinct(3, pickWord)
            const ids = [pickIdent(), pickIdent()]
            const block = (w: string, i: number) => [`// debug ${w} start`, `console.log("${w}", ${ids[i % 2]})`, `// debug ${w} end`]
            return [
              `// nightly job — strip the debug blocks`,
              ...block(w1, 0),
              `const ${ids[0]} = ${pickNum()}`,
              ...block(w2, 1),
              `const ${ids[1]} = ${pickNum()}`,
              ...block(w3, 0),
              `export default ${ids[0]}`,
            ].join('\n')
          },
          parts: (buf) => {
            const targets = buf.split('\n').filter((l) => l.includes('debug ') && l.includes('start'))
            if (targets.length !== 3) throw new Error(`3dd chain: expected 3 debug blocks, got ${targets.length}`)
            return targets.map((t) => {
              const lines = buf.split('\n')
              const i = lines.indexOf(t)
              return { find: [lines[i], lines[i + 1], lines[i + 2]].join('\n') + '\n', label: 'delete the debug block with 3dd' }
            })
          },
        },
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
        gen: () => {
          const line = `const ${pickIdent()} = ${pickNum()}`
          return {
            buffer: line,
            cursor: { line: 0, ch: 0 },
            goalBuffer: `${line}\n${line}`,
            goalCursor: { line: 1, ch: 0 },
          }
        },
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
