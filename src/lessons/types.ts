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
   * Paragraph-chain mode: ONE large buffer rolled per session, an ordered list
   * of deletion targets. Each rep deletes the next target; deletions PERSIST
   * (the buffer shrinks across reps). Deleting anything that isn't the current
   * target trips the "press u to undo" guide until the buffer is restored.
   */
  chain?: ChainSpec
  /**
   * Snap the start cursor to the first letter of the word/region it's working
   * with (never an arbitrary mid-line offset). Set on object-family tasks.
   */
  snapCursor?: boolean
  /** Re-roll random identifier/word substitutions every attempt (static tasks). */
  shuffle?: boolean
}

/** One deletion target inside a chain buffer. `find` must occur EXACTLY ONCE. */
export type ChainPart = {
  /** Exact text to delete (the cursor auto-starts at its first character). */
  find: string
  /** Short instruction shown in the status bar, e.g. "delete the TODO line". */
  label?: string
}

export type ChainSpec = {
  /** Roll the large paragraph — once per task session (Reset re-rolls). */
  genBuffer: () => string
  /** Derive the ordered deletion targets for a freshly rolled buffer. */
  parts: (buffer: string) => ChainPart[]
}

export type ChainObjective = {
  /** Buffer at the start of this objective (previous targets already gone). */
  running: string
  /** Buffer once this objective's target is deleted. */
  expected: string
  /** Highlight span of the target, in `running` offsets. */
  from: number
  to: number
  /** Start cursor for this objective (the target's first character). */
  cursor: Pos
  label?: string
}

export function offsetToPos(doc: string, offset: number): Pos {
  const lines = doc.split('\n')
  let off = Math.min(offset, doc.length)
  let li = 0
  while (li < lines.length && off > lines[li].length) {
    off -= lines[li].length + 1
    li++
  }
  return { line: li, ch: Math.max(0, off) }
}

/** Roll a chain: resolve every part against the buffer left by the previous one. */
export function resolveChain(spec: ChainSpec): ChainObjective[] {
  const buffer = spec.genBuffer()
  const out: ChainObjective[] = []
  let running = buffer
  for (const part of spec.parts(buffer)) {
    const at = running.indexOf(part.find)
    if (at === -1 || running.indexOf(part.find, at + 1) !== -1) {
      throw new Error(`chain target not unique: ${JSON.stringify(part.find.slice(0, 50))}`)
    }
    const to = at + part.find.length
    const expected = running.slice(0, at) + running.slice(to)
    out.push({
      running,
      expected,
      from: at,
      to,
      cursor: offsetToPos(running, at),
      label: part.label,
    })
    running = expected
  }
  if (out.length === 0) throw new Error('chain has no parts')
  return out
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
