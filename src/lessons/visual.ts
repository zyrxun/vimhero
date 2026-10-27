import type { Lesson } from './types'

// Section 8 — Visual Mode. Original text and snippets.

export const visual: Lesson[] = [
  {
    slug: 'intro-to-visual-mode',
    title: 'Intro to Visual Mode',
    keys: 'v',
    theory: `Press \`v\` in normal mode to enter **visual mode**: move with any motion and select text as you go. Then apply an operator to the selection (\`d\` delete, \`y\` yank, \`c\` change).

It's "click and drag, but with motions". Select the word \`broken\`.`,
    tasks: [
      {
        prompt: 'Press `v`, move over `broken` with `w`-style motions (`e` works too). Selecting the exact word is enough.',
        buffer: 'the pipeline is broken again',
        cursor: { line: 0, ch: 15 },
        goalBuffer: 'the pipeline is broken again',
        goalCursor: { line: 0, ch: 21 },
        solution: 've',
        command: 'v',
        parSeconds: 10,
      },
    ],
  },
  {
    slug: 'visual-mode-operators',
    title: 'Visual Mode Operators',
    keys: 'v d y c',
    theory: `Once text is selected:

- \`d\` — delete selection
- \`y\` — yank selection
- \`c\` — change selection
- \`u\` / \`U\` — lowercase / uppercase selection (bonus)

Select the annotation and delete it.`,
    tasks: [
      {
        prompt: 'Visually select `@deprecated` and delete it: `v`, extend the selection with `e`, then `d`.',
        buffer: '@deprecated\nexport function old() {}',
        cursor: { line: 0, ch: 0 },
        goalBuffer: '\nexport function old() {}',
        goalCursor: { line: 0, ch: 0 },
        solution: 'ved',
        command: 'vd',
        parSeconds: 12,
      },
    ],
  },
  {
    slug: 'visual-mode-switch-end',
    title: 'Switch Selection Ends',
    keys: 'o',
    theory: 'Selected the wrong end? Press `o` — the cursor jumps to the **other end** of the selection and you extend from there. Fix mistakes without re-selecting.',
    tasks: [
      {
        prompt: 'Select `alpha`, then press `o` and extend to `omega` before deleting — final text should keep only `---`.',
        buffer: 'alpha beta omega\n---',
        cursor: { line: 0, ch: 0 },
        goalBuffer: '---',
        goalCursor: { line: 0, ch: 0 },
        solution: 'vo$jd',
        command: 'vo',
        parSeconds: 16,
      },
    ],
  },
  {
    slug: 'visual-line-mode',
    title: 'Visual Line Mode',
    keys: 'V',
    theory: `\`V\` (shift-v) = **line-wise** visual mode: selections always cover whole lines, whatever motions you press.

Perfect for deleting/moving complete blocks. Select both lines.`,
    tasks: [
      {
        prompt: 'Press `V` then `j` to select both lines (line-wise selection is automatic).',
        buffer: 'import fs from "fs"\nimport path from "path"',
        cursor: { line: 0, ch: 0 },
        goalBuffer: 'import fs from "fs"\nimport path from "path"',
        goalCursor: { line: 1, ch: 0 },
        solution: 'Vj',
        command: 'V',
        parSeconds: 8,
      },
    ],
  },
  {
    slug: 'visual-line-switch-end',
    title: 'Switch Visual Line Ends',
    keys: 'V o',
    theory: '`o` works in visual-line mode too — flip to the other line end of the block. Same trick, coarser grain.',
    tasks: [
      {
        prompt: 'Select the middle two lines: `V`, then `k` — if you went the wrong way, `o` flips the end. Finish with `d` so only `start` and `end` remain.',
        buffer: 'start\nmid one\nmid two\nend',
        cursor: { line: 2, ch: 0 },
        goalBuffer: 'start\nend',
        goalCursor: { line: 1, ch: 0 },
        solution: 'VkOd',
        command: 'Vo',
        parSeconds: 16,
      },
    ],
  },
  {
    slug: 'visual-line-operators',
    title: 'Visual Line Operators',
    keys: 'V y p',
    theory: `Line-wise yank + paste moves whole blocks: \`V\`, extend, \`y\`, park the cursor, \`p\`.

Move the config line above the imports (yank it, then paste above from line 1).`,
    tasks: [
      {
        prompt: 'Yank the `PORT` line (`Vy`), jump to line 1 (`gg`), paste above with `P`.',
        buffer: 'import server from "./server"\nconst PORT = 3000',
        cursor: { line: 1, ch: 0 },
        goalBuffer: 'const PORT = 3000\nimport server from "./server"',
        goalCursor: { line: 1, ch: 0 },
        solution: 'VyggP',
        command: 'Vy',
        parSeconds: 14,
      },
    ],
  },
]
