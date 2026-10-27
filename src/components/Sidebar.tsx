import { sections } from '../lessons'
import { store } from '../store'

export function Sidebar({ route }: { route: string }) {
  const activeSlug = route.startsWith('#/lesson/') ? route.slice('#/lesson/'.length) : null
  return (
    <nav className="sidebar">
      <div className="brand">⚡ VimTrainer</div>
      {sections.map((s) => (
        <div key={s.name}>
          <div className="section-name">{s.name}</div>
          {s.lessons.map((l) => {
            const href = `#/lesson/${l.slug}`
            const done = store.isLessonDone(l.slug)
            return (
              <a key={l.slug} href={href} className={activeSlug === l.slug ? 'active' : ''}>
                <span>
                  {done && <span className="done">✓ </span>}
                  {l.title}
                </span>
                <span className="keys">{l.keys}</span>
              </a>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
