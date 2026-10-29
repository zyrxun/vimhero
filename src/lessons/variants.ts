// Random-variant pools for task generators. A generator rebuilds a task's
// buffer/goal from these so every attempt is a fresh puzzle with the same
// solution shape. All pieces are original filler — no external content.

import type { Pos } from './types'

const IDENTIFIERS = ['items', 'values', 'results', 'entries', 'records', 'rows', 'props', 'opts', 'state', 'query']
const WORDS = ['broken', 'stale', 'cached', 'dirty', 'empty', 'offset', 'marker', 'sample', 'draft', 'legacy']
const STRINGS = ['production', 'staging', 'development', 'preview', 'sandbox', 'canary']
const NUMS = ['3', '7', '12', '42', '80', '99', '128', '256']
const ARGS = ['alpha, beta', 'input, flags', 'req, res', 'value, index', 'payload, opts']

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function pickIdent(): string {
  return pick(IDENTIFIERS)
}

export function pickWord(): string {
  return pick(WORDS)
}

export function pickString(): string {
  return pick(STRINGS)
}

export function pickNum(): string {
  return pick(NUMS)
}

export function pickArgs(): string {
  return pick(ARGS)
}

/** Random lowercase letter (used for find/till style targets). */
export function pickLetter(): string {
  return 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
}

/** n distinct draws — chain targets must never repeat inside one buffer. */
export function pickDistinct<T>(n: number, draw: () => T): T[] {
  const out: T[] = []
  while (out.length < n) {
    const v = draw()
    if (!out.includes(v)) out.push(v)
  }
  return out
}

// ---------- generic token shuffle for static tasks ----------

const STOPWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'export', 'import', 'default', 'console', 'log', 'true', 'false', 'null',
  'undefined', 'this', 'new', 'class', 'require', 'module',
])
const SHUFFLE_POOL = [...IDENTIFIERS, ...WORDS]

function posOff(doc: string, pos: { line: number; ch: number }): number {
  const lines = doc.split('\n')
  let off = 0
  for (let i = 0; i < pos.line && i < lines.length; i++) off += lines[i].length + 1
  return Math.min(off + pos.ch, doc.length)
}

/**
 * Consistently substitute 1-3 random identifiers across buffer AND goal so the
 * same keystrokes still reach the (shifted) goal. Skips: js keywords, tokens
 * that appear in the solution, tokens containing a cursor, position-sensitive
 * solutions (digits / f F t T / ? *). Line count never changes.
 */
export function shuffleTokens(
  buffer: string,
  goal: string,
  solution: string,
  startCursor: { line: number; ch: number },
  goalCursor: { line: number; ch: number },
): { buffer: string; goal: string; startCursor: Pos; goalCursor: Pos } {
  // position-exact solutions can't survive content shifts — leave them alone
  if (/[0-9fFtT/?*]/.test(solution)) {
    return { buffer, goal, startCursor, goalCursor }
  }
  const sOff = posOff(buffer, startCursor)
  const gOff = posOff(goal, goalCursor)

  const subs: Array<[string, string]> = []
  const seen = new Set<string>()
  const re = /[A-Za-z_][A-Za-z0-9_]{2,}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(buffer)) && subs.length < 3) {
    const tok = m[0]
    if (seen.has(tok) || STOPWORDS.has(tok) || solution.includes(tok)) continue
    // never substitute a token the cursor sits inside (either state)
    let containsCursor = false
    let i = buffer.indexOf(tok)
    while (i !== -1) {
      if (sOff >= i && sOff <= i + tok.length) containsCursor = true
      i = buffer.indexOf(tok, i + 1)
    }
    i = goal.indexOf(tok)
    while (i !== -1) {
      if (gOff >= i && gOff <= i + tok.length) containsCursor = true
      i = goal.indexOf(tok, i + 1)
    }
    if (containsCursor) continue
    seen.add(tok)
    subs.push([tok, pick(SHUFFLE_POOL.filter((p) => p !== tok))])
  }
  if (!subs.length) return { buffer, goal, startCursor, goalCursor }

  const apply = (text: string) => subs.reduce((acc, [a, b]) => acc.split(a).join(b), text)
  // shift = sum of length deltas for occurrences strictly before the offset
  const shift = (text: string, off: number) => {
    let d = 0
    for (const [a, b] of subs) {
      let i = text.indexOf(a)
      while (i !== -1) {
        if (i < off) d += b.length - a.length
        i = text.indexOf(a, i + 1)
      }
    }
    return d
  }

  return {
    buffer: apply(buffer),
    goal: apply(goal),
    startCursor: {
      line: startCursor.line,
      ch: Math.max(0, startCursor.ch + shift(buffer, posOff(buffer, startCursor))),
    },
    goalCursor: {
      line: goalCursor.line,
      ch: Math.max(0, goalCursor.ch + shift(goal, posOff(goal, goalCursor))),
    },
  }
}
