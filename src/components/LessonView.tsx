import { useMemo, useState } from 'react'
import type { Lesson } from '../lessons/types'
import { allLessons } from '../lessons'
import { ChallengeEditor } from './ChallengeEditor'
import { store } from '../store'

export function LessonView({ lesson, go }: { lesson: Lesson; go: (hash: string) => void }) {
  const idx = allLessons.findIndex((l) => l.slug === lesson.slug)
  const prev = allLessons[idx - 1]
  const next = allLessons[idx + 1]
  const [solvedSet, setSolvedSet] = useState<Set<number>>(() => new Set())

  const alreadyDone = useMemo(() => store.isLessonDone(lesson.slug), [lesson.slug])
  const allSolved = solvedSet.size >= lesson.tasks.length

  const markSolved = (i: number) => {
    setSolvedSet((s) => new Set(s).add(i))
    if (solvedSet.size + 1 >= lesson.tasks.length) store.markLessonDone(lesson.slug)
  }

  return (
    <div className="content">
      <h1>{lesson.title}</h1>
      <ArticleMarkdown lesson={lesson} />

      {lesson.tasks.map((task, i) => (
        <div key={`${lesson.slug}-${i}`}>
          <ChallengeEditor
            task={task}
            editorKey={`${lesson.slug}|${i}`}
            record={!alreadyDone || !store.isTaskSolved(lesson.slug, i)}
            onSolve={() => markSolved(i)}
          />
          {!solvedSet.has(i) && i > 0 && (
            <button className="linkish" style={{ marginTop: 6 }} onClick={() => markSolved(i)}>
              skip this task →
            </button>
          )}
        </div>
      ))}

      {allSolved && (
        <div className="lesson-complete">
          <span>
            Lesson complete{alreadyDone ? ' (replayed)' : ''} 🎉
          </span>
          {next ? (
            <button className="primary" onClick={() => go(`#/lesson/${next.slug}`)}>
              Next: {next.title}
            </button>
          ) : (
            <button className="primary" onClick={() => go('#/stats')}>
              See your stats →
            </button>
          )}
        </div>
      )}

      <div className="lesson-footer">
        {prev ? <a href={`#/lesson/${prev.slug}`}>← {prev.title}</a> : <span />}
        {next ? <a href={`#/lesson/${next.slug}`}>{next.title} →</a> : <span />}
      </div>
    </div>
  )
}

// re-export so LessonView stays small
import { Markdown } from './markdown'
function ArticleMarkdown({ lesson }: { lesson: Lesson }) {
  return <Markdown text={lesson.theory} />
}
