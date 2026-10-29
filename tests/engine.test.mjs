// Engine + curriculum sanity tests. Run: npm test  (node >=26 runs TS directly)
import assert from 'node:assert'
import { normBuffer, cursorEq, checkTask } from '../src/engine.ts'
import { sections, allLessons, allTasks } from '../src/lessons/index.ts'
import { resolveTask, resolveChain } from '../src/lessons/types.ts'

// ---------- engine ----------
assert.equal(normBuffer('a  \nb\n\n'), 'a\nb')
assert.equal(normBuffer('x'), 'x')
assert.ok(cursorEq({ line: 0, ch: 5 }, { line: 0, ch: 6 })) // tol 1
assert.ok(!cursorEq({ line: 0, ch: 5 }, { line: 0, ch: 7 }))

const t = {
  prompt: 'p', buffer: 'ab\ncd', cursor: { line: 0, ch: 0 },
  goalBuffer: 'b\ncd', goalCursor: { line: 0, ch: 0 },
  solution: 'x', command: 'x', parSeconds: 5,
}
assert.ok(checkTask('b\ncd', { line: 0, ch: 0 }, t).done)
assert.ok(!checkTask('ab\ncd', { line: 0, ch: 0 }, t).done)
assert.ok(checkTask('b\ncd', { line: 0, ch: 1 }, t).done, 'cursor tol')
assert.ok(!checkTask('b\nxd', { line: 0, ch: 0 }, t).done)

// ---------- curriculum shape ----------
assert.equal(sections.length, 8, '8 sections')
assert.equal(allLessons.length, 52, '52 lessons')
assert.equal(new Set(allLessons.map((l) => l.slug)).size, 52, 'unique slugs')
assert.ok(allTasks.length >= 52, 'at least one task per lesson')

const seen = new Set()
for (const l of allLessons) {
  assert.ok(l.title && l.theory.length > 40, `${l.slug}: title/theory`)
  assert.ok(l.tasks.length >= 1, `${l.slug}: has tasks`)
  for (const [i, task] of l.tasks.entries()) {
    const id = `${l.slug}/${i}`
    assert.ok(!seen.has(id), `dup task id ${id}`)
    seen.add(id)
    assert.ok(task.prompt.length > 5, `${id}: prompt`)
    assert.ok(task.command.length > 0 && task.solution.length > 0, `${id}: command/solution`)
    assert.ok(task.parSeconds > 0, `${id}: par`)

    // roll every generator a few times: each variant must be internally consistent
    const rolls = task.gen ? [0, 1, 2].map(() => resolveTask(task)) : [resolveTask(task)]
    for (const t of rolls) {
      if (task.chain) continue // chain tasks validated separately below
      const bufLines = t.buffer.split('\n')
      const goalLines = t.goalBuffer.split('\n')
      assert.ok(t.cursor.line < bufLines.length && t.cursor.ch <= bufLines[t.cursor.line].length,
        `${id}: start cursor out of bounds`)
      assert.ok(t.goalCursor.line < goalLines.length && t.goalCursor.ch <= goalLines[t.goalCursor.line].length,
        `${id}: goal cursor out of bounds (${t.goalCursor.line}/${goalLines.length})`)

      const changed = normBuffer(t.buffer) !== normBuffer(t.goalBuffer) ||
        t.cursor.line !== t.goalCursor.line || t.cursor.ch !== t.goalCursor.ch
      const noOpOk = t.command === 'modes' || t.command === '<C-d>'
      assert.ok(changed || noOpOk,
        `${id}: task is a no-op (goal == start)`)
    }

    // chain tasks: roll 3x — every target must be unique in its running buffer,
    // resolvable, and actually change the buffer
    if (task.chain) {
      for (const roll of [0, 1, 2]) {
        const objs = resolveChain(task.chain)
        assert.ok(objs.length === 3, `${id}: chain has 3 parts (roll ${roll})`)
        for (const o of objs) {
          assert.notEqual(o.running, o.expected, `${id}: chain part must change the buffer`)
          const lines = o.running.split('\n')
          assert.ok(o.cursor.line < lines.length && o.cursor.ch <= lines[o.cursor.line].length,
            `${id}: chain cursor out of bounds`)
          assert.ok(o.label && o.label.length > 5, `${id}: chain part label`)
        }
      }
    }
  }
}

console.log(`OK — engine + ${allLessons.length} lessons / ${allTasks.length} tasks sane`)
