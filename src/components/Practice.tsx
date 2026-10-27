import { useMemo, useState } from 'react'
import { allTasks, allLessons } from '../lessons'
import { ChallengeEditor } from './ChallengeEditor'
import { store } from '../store'

/** Pick the weakest practiced task: lessons you've finished, weighted by error rate + staleness. */
function pickTask(): (typeof allTasks)[number] {
  const pool = allTasks.filter((t) => store.isLessonDone(t.slug))
  const fallback = pool.length ? pool : allTasks
  const scored = fallback.map((t) => {
    const st = store.statsRaw().done[`${t.slug}/${t.i}`]
    const tries = st?.tries ?? 0
    const attempts = store.statsRaw().cmds[t.task.command]?.attempts ?? 0
    const solves = store.statsRaw().cmds[t.task.command]?.solves ?? 0
    const errRate = attempts ? 1 - solves / attempts : 0.5
    const stale = st?.lastAt ? (Date.now() - st.lastAt) / 86_400_000 : 7
    return { t, w: errRate + Math.min(stale, 14) / 14 + tries * 0.1 }
  })
  const total = scored.reduce((a, s) => a + s.w, 0)
  let r = Math.random() * total
  for (const s of scored) {
    r -= s.w
    if (r <= 0) return s.t
  }
  return scored[scored.length - 1].t
}

export function Practice() {
  const [current, setCurrent] = useState(() => pickTask())
  const [streak, setStreak] = useState(0)
  const [round, setRound] = useState(0)

  const lessonTitle = useMemo(
    () => allLessons.find((l) => l.slug === current.slug)?.title ?? current.slug,
    [current],
  )

  return (
    <div className="content">
      <h1>Practice</h1>
      <p className="theory">
        Weakest-first drills from lessons you've completed. Streak: <strong>{streak}</strong>
      </p>
      <p style={{ color: 'var(--dim)', fontSize: 13 }}>
        from <em>{lessonTitle}</em>
      </p>
      <ChallengeEditor
        key={`${current.slug}-${current.i}-${round}`}
        task={current.task}
        editorKey={`${current.slug}|${current.i}`}
        record={false}
        onSolve={() => setStreak((s) => s + 1)}
      />
      <div style={{ marginTop: 12 }}>
        <button
          className="primary"
          onClick={() => {
            setRound((r) => r + 1)
            setCurrent(pickTask())
          }}
        >
          Next drill →
        </button>{' '}
        <button
          onClick={() => {
            setStreak(0)
            setRound((r) => r + 1)
            setCurrent(pickTask())
          }}
        >
          reset streak / skip
        </button>
      </div>
    </div>
  )
}
