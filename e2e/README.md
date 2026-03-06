# E2E tests (Playwright)

End-to-end tests for the editor UI. Run against the dev server.

## Run

```bash
npm run test:e2e
```

Starts the dev server, runs tests in Chromium, then exits.

## Watch / debug

```bash
npm run test:e2e:ui
```

Opens the Playwright UI to run or debug tests.

## Tests

- **generate-sample-data.spec.js** – File → Generate sample data: modal opens, no-tables message when empty, add table → Generate → export preview visible.
- **myprimetype.spec.js** – Add table, set field type to MYPRIMETYPE in sidebar; open field details and check prime default options.

## Requirements

- `npm install` and `npx playwright install chromium` (or `npx playwright install` for all browsers).
