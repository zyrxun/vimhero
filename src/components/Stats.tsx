import { allLessons, allTasks } from '../lessons'
import { store } from '../store'

export function Stats() {
  const lessonsDone = allLessons.filter((l) => store.isLessonDone(l.slug)).length
  const tasksSolved = allTasks.filter((t) => store.isTaskSolved(t.slug, t.i)).length
  const cmds = store.cmdStats()

  return (
    <div className="content">
      <h1>Stats</h1>
      <div className="summary">
        <span className="big-num">
          {lessonsDone}
          <span className="label">lessons / {allLessons.length}</span>
        </span>
        <span className="big-num">
          {tasksSolved}
          <span className="label">tasks / {allTasks.length}</span>
        </span>
        <span className="big-num">
          {cmds.length}
          <span className="label">commands practiced</span>
        </span>
      </div>

      {cmds.length === 0 ? (
        <p className="theory">No attempts yet — solve a lesson first.</p>
      ) : (
        <table className="stats">
          <thead>
            <tr>
              <th>Command</th>
              <th className="mono">Attempts</th>
              <th className="mono">Solves</th>
              <th className="mono">Success</th>
              <th className="mono">Best</th>
            </tr>
          </thead>
          <tbody>
            {cmds.map((c) => (
              <tr key={c.command}>
                <td className="mono">{c.command}</td>
                <td className="mono">{c.attempts}</td>
                <td className="mono">{c.solves}</td>
                <td className="mono" style={{ color: c.solves / c.attempts < 0.7 ? 'var(--warn)' : 'var(--accent)' }}>
                  {Math.round((100 * c.solves) / c.attempts)}%
                </td>
                <td className="mono">{c.bestMs ? (c.bestMs / 1000).toFixed(1) + 's' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 26 }}>
        <button
          className="danger"
          onClick={() => {
            if (confirm('Wipe all progress and stats?')) {
              store.reset()
              location.reload()
            }
          }}
        >
          Reset all progress
        </button>
      </div>
    </div>
  )
}
