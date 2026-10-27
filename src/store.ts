// Progress + per-command stats persisted in localStorage. No accounts.
import type { Task } from './lessons/types'

export type TaskAttempt = { tries: number; solved: boolean; bestMs: number; lastAt: number }
export type CmdStat = { attempts: number; solves: number; msTotal: number; bestMs: number; lastAt: number }

type Store = {
  done: Record<string, TaskAttempt> // key: `${slug}/${taskIndex}`
  lessonsDone: Record<string, true>
  cmds: Record<string, CmdStat>
}

const KEY = 'vimtrainer.v1'

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { done: {}, lessonsDone: {}, cmds: {}, ...JSON.parse(raw) }
  } catch {
    /* corrupted store -> start fresh */
  }
  return { done: {}, lessonsDone: {}, cmds: {} }
}

let state: Store = typeof localStorage !== 'undefined' ? load() : { done: {}, lessonsDone: {}, cmds: {} }

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* private mode etc. — progress just won't persist */
  }
}

export const store = {
  get taskKey() {
    return (slug: string, i: number) => `${slug}/${i}`
  },

  isTaskSolved(slug: string, i: number): boolean {
    return !!state.done[`${slug}/${i}`]?.solved
  },

  isLessonDone(slug: string): boolean {
    return !!state.lessonsDone[slug]
  },

  recordSolve(slug: string, i: number, task: Task, ms: number) {
    const key = `${slug}/${i}`
    const prev = state.done[key]
    state.done[key] = {
      tries: (prev?.tries ?? 0) + 1,
      solved: true,
      bestMs: prev?.bestMs ? Math.min(prev.bestMs, ms) : ms,
      lastAt: Date.now(),
    }
    const c = (state.cmds[task.command] ??= { attempts: 0, solves: 0, msTotal: 0, bestMs: 0, lastAt: 0 })
    c.attempts += 1
    c.solves += 1
    c.msTotal += ms
    c.bestMs = c.bestMs ? Math.min(c.bestMs, ms) : ms
    c.lastAt = Date.now()
    save()
  },

  recordAttempt(task: Task) {
    const c = (state.cmds[task.command] ??= { attempts: 0, solves: 0, msTotal: 0, bestMs: 0, lastAt: 0 })
    c.attempts += 1
    c.lastAt = Date.now()
    save()
  },

  markLessonDone(slug: string) {
    state.lessonsDone[slug] = true
    save()
  },

  reset() {
    state = { done: {}, lessonsDone: {}, cmds: {} }
    save()
  },

  /** All per-command stats sorted worst-first (lowest success rate, stalest last practice). */
  cmdStats(): Array<CmdStat & { command: string }> {
    return Object.entries(state.cmds)
      .map(([command, c]) => ({ command, ...c }))
      .sort((a, b) => a.solves / Math.max(1, a.attempts) - b.solves / Math.max(1, b.attempts))
  },

  statsRaw(): Store {
    return state
  },
}
