import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { LessonView } from './components/LessonView'
import { Practice } from './components/Practice'
import { Stats } from './components/Stats'
import { allLessons, lessonBySlug } from './lessons'
import { store } from './store'

function useHashRoute(): [string, (h: string) => void] {
  const [route, setRoute] = useState(() => window.location.hash || defaultRoute())
  useEffect(() => {
    const on = () => setRoute(window.location.hash || defaultRoute())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return [route, (h: string) => { window.location.hash = h }]
}

function defaultRoute(): string {
  const next = allLessons.find((l) => !store.isLessonDone(l.slug))
  return `#/lesson/${next ? next.slug : allLessons[0].slug}`
}

export function App() {
  const [route, go] = useHashRoute()

  let page
  if (route === '#/practice') {
    page = <Practice />
  } else if (route === '#/stats') {
    page = <Stats />
  } else {
    const slug = route.startsWith('#/lesson/') ? route.slice('#/lesson/'.length) : ''
    const found = lessonBySlug(slug) ?? lessonBySlug(allLessons[0].slug)!
    page = <LessonView key={found.lesson.slug} lesson={found.lesson} go={go} />
  }

  const onLessons = route.startsWith('#/lesson')

  return (
    <div className="chrome">
      <header className="topbar">
        <a className="brand" href={defaultRoute()}>
          <span className="brand-mark">❯</span> vimtrainer
        </a>
        <nav className="topnav">
          <a href={defaultRoute()} className={onLessons ? 'active' : ''}>▤ Lessons</a>
          <a href="#/practice" className={route === '#/practice' ? 'active' : ''}>↳ Practice</a>
          <a href="#/stats" className={route === '#/stats' ? 'active' : ''}>▦ Stats</a>
        </nav>
      </header>
      <div className="shell">
        <Sidebar route={route} />
        <main className="main">{page}</main>
      </div>
    </div>
  )
}
