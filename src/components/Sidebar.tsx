import { sections } from '../lessons'
import { store } from '../store'

export function Sidebar({ route }: { route: string }) {
  const activeSlug = route.startsWith('#/lesson/') ? route.slice('#/lesson/'.length) : null
  return (
    <nav className="sidebar">
      {sections.map((s) => (
        <div key={s.name}>
          <div className="side-section">{s.name}</div>
          {s.lessons.map((l) => {
            const href = `#/lesson/${l.slug}`
            const done = store.isLessonDone(l.slug)
            return (
              <a key={l.slug} href={href} className={activeSlug === l.slug ? 'active' : ''}>
                <span className="title">
                  {done && <span className="done">✓</span>}
                  {l.title}
                </span>
                <span className="keycaps">
                  {l.keys.split(' ').map((k, i) => <kbd key={i}>{k}</kbd>)}
                </span>
              </a>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
