import { useEffect, useRef, useState } from 'react'
import { EditorState, StateEffect, StateField } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, Decoration } from '@codemirror/view'
import type { DecorationSet } from '@codemirror/view'
import { StreamLanguage, indentUnit } from '@codemirror/language'
import { javascript } from '@codemirror/legacy-modes/mode/javascript'
import { defaultKeymap } from '@codemirror/commands'
import { vim, getCM } from '@replit/codemirror-vim'
import { store } from '../store'

const ROUND_SECONDS = 30

const PARAGRAPHS = [
  `The vim editor keeps your hands on the home row at all times, which means every
motion you learn compounds into speed. Instead of reaching for the arrow keys,
you hop through the buffer with letters that sit right under your fingers.
Over time the keystrokes stop being commands you recall and become gestures
you simply perform, the same way a pianist does not think about individual notes.`,

  `Refactoring in vim is built on a small grammar: an operator, a number, and a
text object. Delete two words, change inside the quotes, yank everything in
this paragraph. Because every operator accepts every object, you do not
memorize hundreds of shortcuts. You learn a dozen pieces and combine them,
which is why old vim users look calm while their buffers rearrange themselves.`,

  `The fastest way through a file is rarely a straight line. Search jumps to
the next match, marks pin the places you will return to, and folds collapse
the noise. Good vim users navigate by meaning first and adjust with small
motions second, arriving at any character in the file in a heartbeat.`,

  `Muscle memory is built by repetition under a little pressure. Each round
of this drill drops a target somewhere in the text, and you ride your
motions to it before the clock runs down. Misses cost nothing, so keep
the pace high and let your fingers find the way without your eyes.`]

const setTarget = StateEffect.define<number | null>()

const targetField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    let next = value.map(tr.changes)
    for (const e of tr.effects) {
      if (e.is(setTarget)) {
        next = e.value == null
          ? Decoration.none
          : Decoration.set([Decoration.mark({ class: 'target-char' }).range(e.value, e.value + 1)])
      }
    }
    return next
  },
  provide: (f) => EditorView.decorations.from(f),
})

function randomTarget(docText: string, avoid: number[], cursor: number): number {
  const lines = docText.split('\n')
  const candidates: number[] = []
  let off = 0
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch !== ' ' && ch !== '\t') candidates.push(off + i)
    }
    off += line.length + 1
  }
  const pool = candidates.filter((p) => !avoid.includes(p) && Math.abs(p - cursor) > 4)
  const list = pool.length ? pool : candidates
  return list[Math.floor(Math.random() * list.length)]
}

export function MotionDrill() {
  const host = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const targetRef = useRef<number | null>(null)
  const hitsRef = useRef(0)
  const runningRef = useRef(false)
  const [phase, setPhase] = useState<'idle' | 'running' | 'over'>('idle')
  const [round, setRound] = useState(0)
  const [buffer, setBuffer] = useState(PARAGRAPHS[0])
  const [hits, setHits] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [best, setBest] = useState(() => store.motionBest())

  const plantTarget = (view: EditorView, keepClear = true) => {
    const cursor = view.state.selection.main.head
    const prev = targetRef.current
    const avoid = keepClear && prev != null ? [prev] : []
    const pos = randomTarget(view.state.doc.toString(), avoid, cursor)
    targetRef.current = pos
    view.dispatch({ effects: setTarget.of(pos) })
  }

  const startRound = () => {
    hitsRef.current = 0
    setHits(0)
    setTimeLeft(ROUND_SECONDS)
    setBuffer(PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)])
    setRound((r) => r + 1)
    runningRef.current = true
    setPhase('running')
  }

  // mount / remount editor each round
  useEffect(() => {
    if (phase === 'idle') return
    const view = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: buffer,
        extensions: [
          vim(),
          targetField,
          lineNumbers(),
          keymap.of(defaultKeymap),
          StreamLanguage.define(javascript),
          indentUnit.of('  '),
          EditorView.lineWrapping,
          EditorView.domEventHandlers({
            mousedown: (e, view) => { e.preventDefault(); view.focus(); return true },
          }),
          EditorView.updateListener.of((u) => {
            if (!runningRef.current) return
            const target = targetRef.current
            if (target == null) return
            const head = u.state.selection.main.head
            if (head === target || head === (target as number) + 1) {
              hitsRef.current += 1
              setHits(hitsRef.current)
              plantTarget(u.view)
            }
          }),
        ],
      }),
    })
    view.focus()
    plantTarget(view, false)
    viewRef.current = view
    ;(window as unknown as Record<string, unknown>).__vh = view
    ;(window as unknown as Record<string, unknown>).__vht = targetRef
    return () => { view.destroy(); viewRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  // countdown
  useEffect(() => {
    if (phase !== 'running') return
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          runningRef.current = false
          setPhase('over')
          const finalHits = hitsRef.current
          if (finalHits > best) {
            setBest(finalHits)
            store.setMotionBest(finalHits)
          }
          targetRef.current = null
          viewRef.current?.dispatch({ effects: setTarget.of(null) })
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase, best])

  return (
    <div className="content">
      <h1>Practice — Motion Drill</h1>
      <p className="theory">
        A target letter lights up somewhere in the paragraph. Ride your motions to it —
        the moment your cursor touches it, the next one lights up. Most targets in {ROUND_SECONDS}s wins.
      </p>

      <div className="drill-hud">
        <span className="drill-time" style={phase === 'running' && timeLeft <= 5 ? { color: 'var(--bad)' } : undefined}>
          {phase === 'running' ? `${timeLeft}s` : phase === 'over' ? 'done' : `${ROUND_SECONDS}s`}
        </span>
        <span className="drill-score">hits <strong>{hits}</strong></span>
        <span className="drill-score">best <strong>{best}</strong></span>
        {phase !== 'running' && (
          <button className="primary" onClick={startRound}>
            {phase === 'over' ? '▶ Run it again' : '▶ Start 30s round'}
          </button>
        )}
      </div>

      <div className="task-card">
        <div className="editor-host" ref={host} />
        <div className="editor-statusbar">
          <span className="mode-badge normal">NORMAL</span>
          <span className="timer">{phase === 'over' ? `round over — ${hits} targets` : 'hjkl w e b f t — go get it'}</span>
        </div>
      </div>
    </div>
  )
}
