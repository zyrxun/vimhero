// Random-variant pools for task generators. A generator rebuilds a task's
// buffer/goal from these so every attempt is a fresh puzzle with the same
// solution shape. All pieces are original filler — no external content.

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
