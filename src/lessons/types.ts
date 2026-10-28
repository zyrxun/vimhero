// Core types for the lesson curriculum and challenge engine.
// A task is a small editing puzzle: start from `buffer` with the cursor at
// `cursor`, end with text exactly `goalBuffer` and cursor at `goalCursor`.

import { shuffleTokens } from './variants.ts'

export type Pos = { line: number; ch: number }

export type Task = {
  prompt: string
  /** Static state — omit when `gen` is present (it supplies these at mount). */
  buffer?: string
  cursor?: Pos
  goalBuffer?: string
  goalCursor?: Pos
  /** Reference keystrokes shown via "Show solution", e.g. `ciwconst<Esc>` */
  solution: string
  /** Command this task drills, used for stats/practice grouping */
  command: string
  parSeconds: number
  /**
   * Optional random-variant generator: re-rolls the puzzle each time the task
   * mounts. Must return internally-consistent state (goal reachable by the
   * same `solution` keystrokes from the new start).
   */
  gen?: () => { buffer: string; cursor: Pos; goalBuffer: string; goalCursor: Pos }
  /**
   * Snap the start cursor to the first letter of the word/region it's working
   * with (never an arbitrary mid-line offset). Set on object-family tasks.
   */
  snapCursor?: boolean
  /** Re-roll random identifier/word substitutions every attempt (static tasks). */
  shuffle?: boolean
}

/** Snap a cursor to the first letter of the word it's on (or the next word char forward). */
function snapToWord(text: string, cursor: Pos): Pos {
  const lines = text.split('\n')
  const line = lines[cursor.line] ?? ''
  let ch = Math.min(cursor.ch, line.length)
  const isWord = (c: string) => /[A-Za-z0-9_-]/.test(c)
  if (isWord(line[ch] ?? '')) {
    while (ch > 0 && isWord(line[ch - 1])) ch--
    return { line: cursor.line, ch }
  }
  while (ch < line.length && !isWord(line[ch])) ch++
  if (ch < line.length) return { line: cursor.line, ch }
  // fall back: last word char on the line
  let end = line.length
  while (end > 0 && !isWord(line[end - 1])) end--
  return { line: cursor.line, ch: end }
}

/** Resolve a task's concrete start/goal state, rolling a fresh variant if it has one. */
export function resolveTask(task: Task): Task & {
  buffer: string
  cursor: Pos
  goalBuffer: string
  goalCursor: Pos
} {
  const base = task.gen
    ? { ...task, ...task.gen() }
    : (task as Task & { buffer: string; cursor: Pos; goalBuffer: string; goalCursor: Pos })
  if (base.shuffle) {
    const r = shuffleTokens(base.buffer, base.goalBuffer, base.solution, base.cursor, base.goalCursor)
    return { ...base, buffer: r.buffer, goalBuffer: r.goal, cursor: r.startCursor, goalCursor: r.goalCursor }
  }
  if (base.snapCursor) {
    return { ...base, cursor: snapToWord(base.buffer, base.cursor) }
  }
  return base
}

export type Lesson = {
  slug: string
  title: string
  /** Sidebar key badge, e.g. "h j k l" */
  keys: string
  /** Theory shown above the editor (markdown-ish subset) */
  theory: string
  tasks: Task[]
}

export type Section = {
  name: string
  lessons: Lesson[]
}
