# VimTrainer

A personal, local-first Vim learning app: 52 interactive lessons, replayable drills,
and per-command stats. Original implementation — the curriculum covers the standard
Vim command progression (motions → operators → text objects → visual mode) with
hand-written lessons and editing puzzles.

## Run

```sh
npm install
npm run dev        # dev server
npm run build      # type-check + build to dist/
npm run preview    # serve the build (port 4173)
npm test           # engine + curriculum sanity tests (node >= 26)
```

## How it works

- **Editor**: CodeMirror 6 + `@replit/codemirror-vim` — a real vim emulator in the browser.
- **Tasks**: each puzzle is `{buffer, cursor, goalBuffer, goalCursor, solution, parSeconds}`.
  A task is solved when the buffer text and cursor match the goal (±1 column). Solving is
  checked after every editor update; `modes`-type tasks complete on an insert→normal round
  trip; scroll tasks (`<C-d>`) complete on the keypress.
- **Lessons**: `src/lessons/*.ts` — 8 sections, 52 lessons, 69 tasks. Markdown subset
  renderer for theory (`##`, `**bold**`, `` `code` ``, bullets, fences).
- **Practice**: weakest-first drills — weighted by error rate + staleness, drawn only from
  lessons you've completed.
- **Stats**: per-command attempts, success rate, best time. `Reset all progress` wipes it.
- **Persistence**: localStorage key `vimtrainer.v1`. No accounts, no server.

## Notes

- Clicks focus the editor but deliberately do **not** move the cursor — navigate with motions.
- `Show solution` reveals reference keystrokes; `Reset` restores the puzzle.
- `base: './'` in vite.config.ts → the build works from any static path (GitHub Pages ready).
- Debug handle: `window.__vh` is the active CodeMirror view (used by the test session).
