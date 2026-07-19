# Soul Spirit — TypeScript Conversion Design

## Goal

Convert the existing vanilla HTML/CSS/JS quiz app into a TypeScript project
with a modern build pipeline, while keeping the game's behavior identical.
This is a tooling and structure conversion, not a feature or UI change.

## Current state

- `index.html`, `style.css`, `script.js` (340 lines, single file mixing
  state, i18n, DOM rendering, and game logic), `questions_en.json`,
  `questions_gu.json` at repo root.
- `questions_en_org.json` / `questions_gu_org.json` exist at repo root but
  are unreferenced by any code — dead files.
- No build step: `index.html` loads `script.js` directly; question banks
  are fetched at runtime via `fetch()`.
- Deployed to GitHub Pages by pushing the five source files directly to
  `main` with Pages serving the branch root.
- `.DS_Store` is committed; no `.gitignore` exists.

## Decisions

- **Build tool: Vite.** Full dev server + bundler. GitHub Pages deploy
  moves from "push source, Pages serves it" to "push to `main`, CI builds
  and publishes `dist/`."
- **Module structure: split by responsibility**, not a single typed file.
- **Testing: Vitest**, covering the pure game-logic functions.
- **Lint/format: ESLint (typescript-eslint) + Prettier.**
- **Question data: typed static imports**, not runtime `fetch()`. Both
  question banks are bundled at build time.
- **Package manager: npm.**
- **Cleanup done alongside the conversion:** delete the unreferenced
  `_org` JSON files; remove `.DS_Store` and add a `.gitignore`.

## Target project structure

```
soul-spirit/
├── index.html                 # Vite entry; loads /src/main.ts as a module
├── vite.config.ts
├── tsconfig.json               # strict mode
├── package.json
├── eslint.config.js
├── .prettierrc
├── .gitignore                  # node_modules, dist, .DS_Store
├── public/
│   └── kalash.png               # static asset, served as-is at /kalash.png
├── src/
│   ├── main.ts                  # entry point: wires DOM events, boots the app
│   ├── types.ts                 # Question, Lang, PlayerId, GameState
│   ├── i18n.ts                  # I18N dict, typed by Lang
│   ├── data/
│   │   ├── questions_en.json    # moved here, imported as typed modules
│   │   └── questions_gu.json
│   ├── quiz.ts                  # pure game logic, no DOM dependency
│   ├── dom.ts                   # DOM helpers, screen switching, rendering
│   └── quiz.test.ts             # Vitest tests for quiz.ts
├── style.css                    # unchanged, linked from index.html
└── .github/workflows/deploy.yml # build + deploy to GitHub Pages on push to main
```

`questions_en_org.json` and `questions_gu_org.json` are deleted (git
history retains them if ever needed).

## Module responsibilities

- **`types.ts`** — all shared type definitions. Notably:
  ```ts
  interface Question {
    id: number;
    question: string;
    options: [string, string, string, string];
    correct: 0 | 1 | 2 | 3;
    explanation?: string;
  }
  type Lang = "en" | "gu";
  type PlayerId = "p1" | "p2";
  ```
  Modeling `options` as a 4-tuple and `correct` as a `0|1|2|3` union means a
  malformed question entry in either JSON file fails compilation, not just
  silently misbehaves at runtime.

- **`i18n.ts`** — the `I18N` dictionary (English/Gujarati UI strings),
  typed so every language variant is required to implement the same keys.

- **`data/*.json`** — question banks, imported directly (`import en from
  "./data/questions_en.json"`), type-asserted against `Question[]`.

- **`quiz.ts`** — pure functions, no DOM access, fully unit-testable:
  - `calculateScore(timeLeft, isFirstCorrect): number`
  - `pickRoundQuestions(allQuestions, usedIds, count): { picked: Question[], usedIds: Set<number> }`
  - `namesAreDuplicate(p1: string, p2: string): boolean`
  - `resolveFinalName(raw: string, placeholder: string): string`

- **`dom.ts`** — screen switching, element lookups, rendering functions
  (`renderQuestion`, `buildOptions`, `applyI18n`, etc.). Depends on
  `quiz.ts` and `i18n.ts`; not unit-tested (thin DOM glue).

- **`main.ts`** — event listener wiring and app bootstrap. Imports from
  `dom.ts` and `quiz.ts`; equivalent to the bottom third of today's
  `script.js`.

Behavior is preserved exactly: same scoring formula (`25 + secondsLeft`,
+20 first-correct bonus), same reshuffle-when-exhausted question picking,
same case-insensitive duplicate-name validation, same 36-second timer and
5-screen flow.

## Testing

Vitest tests in `src/quiz.test.ts` cover:
- `calculateScore` — base score, first-correct bonus, zero for wrong answers.
- `pickRoundQuestions` — no repeats within a round; once the bank is
  exhausted across rounds, it reshuffles from the full set again.
- `namesAreDuplicate` — case-insensitive match (e.g. `"Amit"` vs `"amit"`).

`dom.ts` and `main.ts` are not unit-tested — they're DOM wiring, better
covered by manual/browser verification than mocked DOM tests.

## Tooling

- **`tsconfig.json`**: `strict: true`, `resolveJsonModule: true`,
  `target: ES2020`, `module: ESNext`, `moduleResolution: bundler`.
- **ESLint**: `typescript-eslint` recommended rules + `eslint-config-prettier`
  to avoid rule conflicts with Prettier.
- **npm scripts**: `dev`, `build`, `preview`, `test`, `lint`, `format`.

## Deployment

`.github/workflows/deploy.yml`: on push to `main`, run `npm ci`,
`npm run lint`, `npm run test`, `npm run build`, then publish `dist/` via
`actions/deploy-pages`. The README's GitHub Pages section is rewritten to
describe this flow instead of the current manual push-and-flip-a-setting
instructions.

## Out of scope

- No behavior, UI, or visual changes.
- No changes to `style.css` content.
- No expansion of the question banks (separate, ongoing effort).
- No changes to scoring rules or timing.
