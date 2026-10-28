import { useEffect, useRef, useState } from 'react'
import { EditorState, StateEffect, StateField } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, Decoration } from '@codemirror/view'
import type { DecorationSet } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { StreamLanguage, indentUnit } from '@codemirror/language'
import { javascript } from '@codemirror/legacy-modes/mode/javascript'
import { vim, getCM } from '@replit/codemirror-vim'
import { resolveTask } from '../lessons/types'
import type { Task } from '../lessons/types'
import { checkTask } from '../engine'
import { store } from '../store'

type Mode = 'normal' | 'insert' | 'visual' | 'visual-line' | 'unknown'

/** Force the editor back to normal mode (drills must always start in movement mode). */
function forceNormal(view: EditorView) {
  const cm = getCM(view)
  const v = cm?.state?.vim
  if (cm && v && (v.insertMode || v.visualMode)) {
    cm.cm6.contentDOM.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
  }
}

function readMode(view: EditorView): Mode {
  const v = getCM(view)?.state?.vim
  if (!v) return 'unknown'
  if (v.insertMode) return 'insert'
  if (v.visualMode) return v.visualLine ? 'visual-line' : 'visual'
  return 'normal'
}

// objective highlight: shows WHERE the edit lands / WHERE to move, cleared on solve
const setHl = StateEffect.define<DecorationSet | null>()

const hlField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    let next = value.map(tr.changes)
    for (const e of tr.effects) {
      if (e.is(setHl)) next = e.value ?? Decoration.none
    }
    return next
  },
  provide: (f) => EditorView.decorations.from(f),
})

function hlDecoration(from: number, to: number): DecorationSet {
  return Decoration.set([Decoration.mark({ class: 'hl-char' }).range(from, to)])
}

/**
 * Where should the objective highlight sit? Derived from the buffer→goal diff:
 * changed text = the region to edit; unchanged text = the destination position.
 */
function objectiveRange(buf: string, goal: string, goalCursor: { line: number; ch: number }): { from: number; to: number } {
  const norm = (s: string) => s.replace(/[ \t]+$/gm, '').replace(/\n+$/, '')
  if (norm(buf) === norm(goal)) {
    // movement task: highlight the destination character
    const lines = buf.split('\n')
    let off = 0
    for (let i = 0; i < goalCursor.line && i < lines.length; i++) off += lines[i].length + 1
    const at = Math.max(0, Math.min(off + goalCursor.ch, buf.length - 1))
    return { from: at, to: at + 1 }
  }
  let p = 0
  while (p < buf.length && p < goal.length && buf[p] === goal[p]) p++
  let s = 0
  while (s < buf.length - p && s < goal.length - p && buf[buf.length - 1 - s] === goal[goal.length - 1 - s]) s++
  if (p >= buf.length - s) {
    // pure insertion — highlight the insertion point character
    const at = Math.max(0, Math.min(p - 1, buf.length - 1))
    return { from: at, to: at + 1 }
  }
  // expand the changed span to word-ish boundaries
  let from = p
  while (from > 0 && !/[ \t\n]/.test(buf[from - 1])) from--
  let to = buf.length - s
  while (to < buf.length && !/[ \t\n]/.test(buf[to])) to++
  if (to <= from) to = from + 1
  return { from, to }
}

function posToOffset(doc: string, pos: { line: number; ch: number }): number {
  const lines = doc.split('\n')
  let off = 0
  for (let i = 0; i < pos.line && i < lines.length; i++) off += lines[i].length + 1
  return Math.min(off + pos.ch, doc.length)
}

type Props = {
  task: Task
  /** stable key: changes reset the editor */
  editorKey: string
  onSolve: (ms: number) => void
  /** false during practice-replay of solved tasks: don't re-record solves */
  record: boolean
}

export function ChallengeEditor({ task, editorKey, onSolve, record }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const startRef = useRef<number>(Date.now())
  const solvedRef = useRef(false)
  const [mode, setMode] = useState<Mode>('normal')
  const [solved, setSolved] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const sep = editorKey.indexOf('|')
  const statSlug = editorKey.slice(0, sep)
  const statIdx = Number(editorKey.slice(sep + 1))
  const everInsert = useRef(false)
  // timer + validation stay cold until the user touches the editor
  const [armed, setArmed] = useState(false)
  const armedRef = useRef(false)
  // concrete (possibly generated) task state for this mount
  const resolved = useRef(resolveTask(task))
  // rep-chaining: each solve spawns the next objective until REPS reached
  const REPS = task.command === 'modes' || task.command === '<C-d>' ? 1 : 3
  const repRef = useRef(0)
  const [repDone, setRepDone] = useState(0)
  const [mountId, setMountId] = useState(0)

  const reroll = () => {
    // fresh editor mount: guarantees the vim engine starts from the exact
    // task.cursor (in-place doc swaps desync cm6-vim's internal cursor)
    setMountId((m) => m + 1)
  }

  const arm = () => {
    if (armedRef.current) return
    armedRef.current = true
    ;(window as unknown as Record<string, unknown>).__armed = true
    setArmed(true)
    startRef.current = Date.now()
    store.recordAttempt(task)
  }

  /** One objective cleared. Chain the next rep, or finish the task on the last. */
  const finishRep = (view: EditorView) => {
    // re-entry guard: several updates can land in the same tick; the remount
    // (rep chain) or the solved state (final rep) clears it
    if (solvedRef.current) return
    solvedRef.current = true
    const ms = Date.now() - startRef.current
    if (repRef.current + 1 >= REPS) {
      setSolved(true)
      setElapsed(ms)
      if (record) store.recordSolve(statSlug, statIdx, resolved.current, ms)
      onSolve(ms)
      view.dispatch({ effects: setHl.of(null) })
    } else {
      repRef.current += 1
      setRepDone(repRef.current)
      reroll()
    }
  }

  // scroll tasks (<C-d>) never change doc/selection — detect the key directly.
  // Listen on the host div (exists before the view mounts); keydown bubbles up.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (task.command !== '<C-d>' || solvedRef.current) return
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        arm()
        const view = viewRef.current
        if (view) finishRep(view)
      }
    }
    const dom = host.current
    // capture phase: CM6's vim layer stops propagation on handled keys,
    // so bubble-phase listeners never see them
    dom?.addEventListener('keydown', onKey, true)
    return () => dom?.removeEventListener('keydown', onKey, true)
  }, [editorKey, task, record, statSlug, statIdx])

  // timer starts on the first attempt — a keypress anywhere in the editor
  useEffect(() => {
    const onKey = () => arm()
    const dom = host.current
    dom?.addEventListener('keydown', onKey, true)
    return () => dom?.removeEventListener('keydown', onKey, true)
  }, [editorKey])

  useEffect(() => {
    // reset meta-state when the task changes (rep/armed/timer)
    solvedRef.current = false
    everInsert.current = false
    armedRef.current = false
    repRef.current = 0
    startRef.current = Date.now()
    setSolved(false)
    setArmed(false)
    setRepDone(0)
    setShowSolution(false)
    setElapsed(0)
  }, [editorKey])

  useEffect(() => {
    // (re)mount the editor — fresh vim state, cursor exactly at task.cursor.
    // Re-runs per rep: resolveTask rolls a fresh variant when the task has one.
    resolved.current = resolveTask(task)
    const t = resolved.current

    const view = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: t.buffer,
        selection: { anchor: posToOffset(t.buffer, t.cursor) },
        extensions: [
          vim(),
          hlField,
          lineNumbers(),
          history(),
          keymap.of(defaultKeymap),
          keymap.of(historyKeymap),
          StreamLanguage.define(javascript),
          indentUnit.of('  '),
          EditorView.lineWrapping,
          // clicks focus the editor but must NOT reposition the cursor —
          // tasks assume you start from task.cursor and navigate with motions
          EditorView.domEventHandlers({
            mousedown: (e, view) => { e.preventDefault(); view.focus(); return true },
          }),
          EditorView.updateListener.of((u) => {
            const m = readMode(u.view)
            setMode(m)
            if (m === 'insert') everInsert.current = true
            // objectives complete in normal mode: mid-insert matches don't count
            // (the user hasn't confirmed with Esc yet)
            if (m === 'insert') return
            if (solvedRef.current || !armedRef.current) return
            const tt = resolved.current
            const text = u.state.doc.toString()
            const sel = u.state.selection.main
            let head = sel.head
            // vim visual selections are char-inclusive; cm6 head sits one past the
            // char — normalize so visual selection tasks compare on the same column
            const v = getCM(u.view)?.state?.vim
            if (v?.visualMode && head !== sel.anchor) head += head > sel.anchor ? -1 : 1
            const line = u.state.doc.lineAt(head)
            const cursor = { line: line.number - 1, ch: head - line.from }
            const check = checkTask(text, cursor, tt)

            // no-op tasks (goal == start): the insert→normal round trip IS the task
            const noOp = normEqual(tt.buffer, tt.goalBuffer) && samePos(tt.cursor, tt.goalCursor)
            if (noOp) {
              if (everInsert.current && m === 'normal') finishRep(u.view)
              return
            }
            // visual-LINE selections: the line span is the unit, cursor column is
            // meaningless — compare the selection's end line only
            if (v?.visualLine && v?.visualMode) {
              if (cursor.line === tt.goalCursor.line && check.textOk) finishRep(u.view)
              return
            }
            if (check.done) finishRep(u.view)
          }),
        ],
      }),
    })
    viewRef.current = view
    ;(window as unknown as Record<string, unknown>).__vh = view
    // fresh mount = unsolved: clears the finishRep re-entry guard
    solvedRef.current = false
    view.dispatch({ effects: setHl.of(hlDecoration(...Object.values(objectiveRange(t.buffer, t.goalBuffer, t.goalCursor)) as [number, number])) })
    view.focus()
    forceNormal(view)
    return () => { view.destroy(); viewRef.current = null }
  }, [editorKey, mountId])

  const secs = (ms: number) => (ms / 1000).toFixed(1) + 's'

  const reset = () => {
    // full restart: re-roll the variant, reset rep chain, timer restarts on
    // the next keypress (armed state is kept)
    resolved.current = resolveTask(task)
    solvedRef.current = false
    repRef.current = 0
    startRef.current = Date.now()
    setSolved(false)
    setRepDone(0)
    setElapsed(0)
    setMountId((m) => m + 1)
  }

  // live timer while armed and unsolved
  useEffect(() => {
    if (solved || !armed) return
    const t = setInterval(() => setElapsed(Date.now() - startRef.current), 250)
    return () => clearInterval(t)
  }, [editorKey, solved, armed])

  const over = elapsed > task.parSeconds * 1000

  return (
    <div className="task-card">
      <div className="task-head">
        <div className="task-tabs">
          <span className="task-tab active">Challenge</span>
          <span className="task-par">
            objective {Math.min(repDone + 1, REPS)}/{REPS} · par {task.parSeconds}s · {task.command}
          </span>
        </div>
        <div className="prompt" dangerouslySetInnerHTML={{ __html: inlinePrompt(task.prompt) }} />
      </div>
      <div className="editor-host" ref={host} />
      <div className="editor-statusbar">
        <span className={`mode-badge ${mode}`}>
          {mode === 'visual-line' ? 'VISUAL LINE' : mode.toUpperCase()}
        </span>
        {!armed && !solved && (
          <span style={{ color: 'var(--dim)', fontSize: 12.5 }}>timer starts on your first keypress</span>
        )}
        <span className="timer" style={over ? { color: 'var(--warn)' } : solved ? { color: 'var(--accent)' } : undefined}>
          {secs(elapsed)} <span style={{ color: 'var(--dim)' }}>/ par {task.parSeconds}s</span>
        </span>
      </div>
      {solved && <div className="solved-banner">✓ Solved in {secs(elapsed)} — saved</div>}
      {showSolution && <div className="solution-reveal">solution: {task.solution}</div>}
      <div className="task-actions">
        <button onClick={reset}>Reset</button>
        <button onClick={() => setShowSolution((s) => !s)}>{showSolution ? 'Hide solution' : 'Show solution'}</button>
      </div>
    </div>
  )
}

function inlinePrompt(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function normEqual(a: string, b: string): boolean {
  return a.replace(/[ \t]+$/gm, '').replace(/\n+$/, '') === b.replace(/[ \t]+$/gm, '').replace(/\n+$/, '')
}
function samePos(a: { line: number; ch: number }, b: { line: number; ch: number }): boolean {
  return a.line === b.line && a.ch === b.ch
}
