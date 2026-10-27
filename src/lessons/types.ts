// Core types for the lesson curriculum and challenge engine.
// A task is a small editing puzzle: start from `buffer` with the cursor at
// `cursor`, end with text exactly `goalBuffer` and cursor at `goalCursor`.

export type Pos = { line: number; ch: number }

export type Task = {
  prompt: string
  buffer: string
  cursor: Pos
  goalBuffer: string
  goalCursor: Pos
  /** Reference keystrokes shown via "Show solution", e.g. `ciwconst<Esc>` */
  solution: string
  /** Command this task drills, used for stats/practice grouping */
  command: string
  parSeconds: number
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
