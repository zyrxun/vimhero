import { useEffect, useRef, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { StreamLanguage, indentUnit } from '@codemirror/language'
import { javascript } from '@codemirror/legacy-modes/mode/javascript'
import { vim, getCM } from '@replit/codemirror-vim'
import type { Task } from '../lessons/types'
import { checkTask } from '../engine'
import { store } from '../store'

type Mode = 'normal' | 'insert' | 'visual' | 'visual-line' | 'unknown'

function readMode(view: EditorView): Mode {
  const v = getCM(view)?.state?.vim
  if (!v) return 'unknown'
  if (v.insertMode) return 'insert'
  if (v.visualMode) return v.visualLine ? 'visual-line' : 'visual'
  return 'normal'
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

  // scroll tasks (<C-d>) never change doc/selection — detect the key directly.
  // Listen on the host div (exists before the view mounts); keydown bubbles up.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (task.command !== '<C-d>' || solvedRef.current) return
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        solvedRef.current = true
        setSolved(true)
        const ms = Date.now() - startRef.current
        setElapsed(ms)
        if (record) store.recordSolve(statSlug, statIdx, task, ms)
        onSolve(ms)
      }
    }
    const dom = host.current
    dom?.addEventListener('keydown', onKey)
    return () => dom?.removeEventListener('keydown', onKey)
  }, [editorKey, task, record, statSlug, statIdx, onSolve])

  useEffect(() => {
    // reset everything when the task changes
    solvedRef.current = false
    everInsert.current = false
    startRef.current = Date.now()
    setSolved(false)
    setShowSolution(false)
    setElapsed(0)

    const view = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: task.buffer,
        selection: { anchor: posToOffset(task.buffer, task.cursor) },
        extensions: [
          vim(),
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
            if (solvedRef.current) return
            const text = u.state.doc.toString()
            const sel = u.state.selection.main
            let head = sel.head
            // vim visual selections are char-inclusive; cm6 head sits one past the
            // char — normalize so visual selection tasks compare on the same column
            const v = getCM(u.view)?.state?.vim
            if (v?.visualMode && head !== sel.anchor) head += head > sel.anchor ? -1 : 1
            const line = u.state.doc.lineAt(head)
            const cursor = { line: line.number - 1, ch: head - line.from }
            const check = checkTask(text, cursor, task)

            const complete = () => {
              solvedRef.current = true
              setSolved(true)
              const ms = Date.now() - startRef.current
              setElapsed(ms)
              if (record) store.recordSolve(statSlug, statIdx, task, ms)
              onSolve(ms)
            }

            // no-op tasks (goal == start): the insert→normal round trip IS the task
            const noOp = normEqual(task.buffer, task.goalBuffer) && samePos(task.cursor, task.goalCursor)
            if (noOp) {
              if (everInsert.current && m === 'normal') complete()
              return
            }
            // visual-LINE selections: the line span is the unit, cursor column is
            // meaningless — compare the selection's end line only
            if (v?.visualLine && v?.visualMode) {
              if (cursor.line === task.goalCursor.line && check.textOk) complete()
              return
            }
            if (check.done) complete()
          }),
        ],
      }),
    })
    viewRef.current = view
    ;(window as unknown as Record<string, unknown>).__vh = view
    // eslint-disable-next-line no-inner-declarations
    function posToOffset(doc: string, pos: { line: number; ch: number }): number {
      const lines = doc.split('\n')
      let off = 0
      for (let i = 0; i < pos.line && i < lines.length; i++) off += lines[i].length + 1
      return Math.min(off + pos.ch, doc.length)
    }
    view.focus()
    return () => { view.destroy(); viewRef.current = null }
  }, [editorKey])

  const secs = (ms: number) => (ms / 1000).toFixed(1) + 's'

  const reset = () => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: task.buffer },
      selection: { anchor: (() => {
        const lines = task.buffer.split('\n')
        let off = 0
        for (let i = 0; i < task.cursor.line && i < lines.length; i++) off += lines[i].length + 1
        return Math.min(off + task.cursor.ch, task.buffer.length)
      })() },
    })
    solvedRef.current = false
    startRef.current = Date.now()
    setSolved(false)
    setElapsed(0)
    view.focus()
  }

  // live timer while unsolved
  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setElapsed(Date.now() - startRef.current), 250)
    return () => clearInterval(t)
  }, [editorKey, solved])

  const over = elapsed > task.parSeconds * 1000

  return (
    <div className="task-card">
      <div className="task-head">
        <div className="prompt" dangerouslySetInnerHTML={{ __html: inlinePrompt(task.prompt) }} />
        <div className="task-num">{task.command ? <span className="keys">{task.command}</span> : null}</div>
      </div>
      <div className="editor-host" ref={host} />
      <div className="editor-statusbar">
        <span className={`mode-badge ${mode}`}>
          {mode === 'visual-line' ? 'VISUAL LINE' : mode.toUpperCase()}
        </span>
        <span className="timer" style={over ? { color: 'var(--warn)' } : solved ? { color: 'var(--accent)' } : undefined}>
          {solved ? secs(elapsed) : secs(elapsed)} <span style={{ color: 'var(--dim)' }}>/ par {task.parSeconds}s</span>
        </span>
      </div>
      {solved && <div className="solved-banner">✓ Solved in {secs(elapsed)}</div>}
      {showSolution && <div className="solution-reveal">solution: {escapeKeys(task.solution)}</div>}
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

/** make control keys readable: <Esc> <CR> <C-d> */
function escapeKeys(s: string): string {
  return s
}
