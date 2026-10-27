import type { Lesson, Section } from './types'
import { basicVim } from './basic-vim.ts'
import { operators } from './operators.ts'
import { vertical } from './vertical.ts'
import { search } from './search.ts'
import { brackets } from './brackets.ts'
import { quotes } from './quotes.ts'
import { wordsParagraphs } from './words-paragraphs.ts'
import { visual } from './visual.ts'

export const sections: Section[] = [
  { name: 'Basic Vim', lessons: basicVim },
  { name: 'Basic Operators', lessons: operators },
  { name: 'Advanced Vertical Movement', lessons: vertical },
  { name: 'Search', lessons: search },
  { name: 'Text Objects — Brackets', lessons: brackets },
  { name: 'Text Objects — Quotes', lessons: quotes },
  { name: 'Text Objects — Words & Paragraphs', lessons: wordsParagraphs },
  { name: 'Visual Mode', lessons: visual },
]

export const allLessons: Lesson[] = sections.flatMap((s) => s.lessons)

export function lessonBySlug(slug: string): { lesson: Lesson; index: number; section: Section } | null {
  let index = 0
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (lesson.slug === slug) return { lesson, index, section }
      index++
    }
  }
  return null
}

/** Flatten every task in curriculum order (used by Practice). */
export const allTasks: Array<{ slug: string; title: string; task: Lesson['tasks'][number]; i: number }> =
  allLessons.flatMap((l) => l.tasks.map((task, i) => ({ slug: l.slug, title: l.title, task, i })))

export type { Lesson, Section, Task } from './types'
