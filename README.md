# Portfolio site for slafleche

## Stack

- Components with [React](https://reactjs.org/)
- JS Framework by [Next.js](https://nextjs.org/)
- Styles [Vanilla-Extract](https://vanilla-extract.style/)
- Accessible components by [Reach UI](https://reach.tech/)
- CSS in JS made with [Vanilla-Extract](https://vanilla-extract.style/)

## Features

- Accessibility in mind
- Responsive

### Install

- Run `yarn`
- You need to run the `locale` function to build missing locale files from the
  src data. It will automatically run on `yarn dev`

## Measurement Debugging

- Debug helpers are only active when `NODE_ENV !== "production"` (the default in
  `yarn dev`).
- Chain `debugChain('your-debugging-id')` or call `debug('your-debugging-id')` on
  any measurement created via `m(...)` to record values while you work. Supplying a
  descriptive ID is required so the grouped output matches your expectations.
- Open the browser console and run `measurementDebug()` to print the collected
  entries without leaving DevTools. Results are grouped by the labels you pass to
  `debugChain`, so you'll see one top-level key per measurement (e.g. `logoItem`,
  `test`) with the ordered list of operations (`debugChain`, `half`, `css`, …).
  Pass `{ showCount: true }` if you want to display repetition counts (`×n`). This
  helper fetches `http://localhost:3000/api/measurement-debug?dedupe=1&group=1`
  by default.
- Pass options like `measurementDebug({ clear: true })` if you want to snapshot
  and reset the log in the same call, or `measurementDebug({ dedupe: false })` to
  inspect the raw stream.
- The API at `/api/measurement-debug` mirrors these flags via query params such as
  `?clear=1`, `?dedupe=1`, and `?group=1` so the JSON response matches the console
  view (defaults are dedupe+group enabled; set `dedupe=0`/`group=0` to opt out).
  Counts remain in the raw JSON for deeper analysis or custom tooling.
- Call `measurementDebugClear()` to empty the log after inspecting it.
