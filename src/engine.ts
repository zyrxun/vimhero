import type { Pos, Task } from './lessons/types'

/** Normalize a buffer string: strip trailing whitespace per line + trailing newline. */
export function normBuffer(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '')
}

/** Compare cursor positions with a small char tolerance. */
export function cursorEq(a: Pos, b: Pos, tol = 1): boolean {
  return a.line === b.line && Math.abs(a.ch - b.ch) <= tol
}

export type TaskCheck = {
  textOk: boolean
  cursorOk: boolean
  done: boolean
}

export function checkTask(current: string, cursor: Pos, task: Task): TaskCheck {
  const textOk = normBuffer(current) === normBuffer(task.goalBuffer)
  const cursorOk = cursorEq(cursor, task.goalCursor)
  return { textOk, cursorOk, done: textOk && cursorOk }
}

/** 0..1 score used for stats: text match is the main thing, cursor is a bonus. */
export function taskScore(current: string, cursor: Pos, task: Task): number {
  const c = checkTask(current, cursor, task)
  return c.textOk ? (c.cursorOk ? 1 : 0.8) : 0
}
