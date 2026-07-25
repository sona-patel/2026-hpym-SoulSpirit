# Soul Spirit — Two-Player Spiritual Quiz Break

A calm, fast little quiz to play between two people during a break — every
question is bilingual (English above, Gujarati below, no language picker
needed), race through 3 multiple-choice questions in 36 seconds each, and
see who scores higher. Built with TypeScript and Vite; GitHub Actions builds
and deploys it to GitHub Pages automatically on every push to `main`, so it
still hosts for free with no manual steps.

## Files

```
index.html                    the app shell (screens + markup)
style.css                      all visual styling
src/main.ts                    entry point: event wiring and app bootstrap
src/dom.ts                     screen switching and rendering (incl. bilingual text)
src/quiz.ts                    pure game logic (scoring, question picking, name validation)
src/i18n.ts                    English UI strings (buttons, labels, statuses)
src/types.ts                   shared TypeScript types
src/data/questions_en.json     English question bank (source of truth for wording/answers)
src/data/questions_gu.json     Gujarati translations, same ids as questions_en.json
src/data/questions_funny.json  single-language bonus bank; always supplies question 3
src/data/index.ts              loads + validates the banks, merges en/gu into one bilingual bank
```

## How the game works

1. Welcome page: tap **"Are you ready to test your soul spirit?"**
2. Enter both players' names — defaults to **Bhoolku 1** / **Bhoolku 2**.
   Both names must be different; the form blocks submission and shows an
   inline error if the same name (case-insensitive) is entered for both.
3. 3 questions are drawn for the round. The **first 2** come from the main
   bank and are **bilingual** — English on top, Gujarati underneath, for
   both the question and every answer option. The **3rd question** is
   always drawn from the separate funny/bonus bank and stays exactly as
   written there — single-language, not bilingual. Each question gives
   **36 seconds**. Both players see the same question with their own set of
   answer buttons (left = Bhoolku 1, right = Bhoolku 2) and answer
   independently.
4. **Scoring:** a correct answer earns `25 + seconds remaining` points.
   Whoever answers correctly *first* gets an extra **+20 speed bonus** — so
   being fast and right pays off more than being right but slow. A wrong
   answer earns 0 and locks that player out for the rest of the question.
5. After the 3rd question, final scores and an animated "soul glow" winner
   message are shown, with the choice to **Play Again** or **Stop for now**
   — both return to the welcome page.
6. Questions won't repeat within a round, and the game avoids repeating a
   question across rounds until the whole bank has been used once — then it
   reshuffles from the full set again. The main bilingual bank and the
   funny bank each track their own "already used" pool independently.

## Editing or adding questions

**Main (bilingual) questions:** edit `src/data/questions_en.json` and
`src/data/questions_gu.json` together — they're merged by `id` at load time
into one bilingual question, so **both files must use the same set of
ids**, in the same order, or the app will fail to build. Each question is a
JSON object:

```json
{
  "id": 41,
  "question": "What does 'Santosha' mean?",
  "options": ["Wealth", "Contentment", "Fear", "Speed"],
  "correct": 1,
  "explanation": "Santosha means contentment — accepting the present moment as it is."
}
```

- `id` — must be unique within the file, and must exist with the same id
  in *both* `questions_en.json` and `questions_gu.json`. Just keep counting up.
- `options` — always exactly 4 choices.
- `correct` — the **index** (0, 1, 2, or 3) of the right answer in `options`.
  This must match between the English and Gujarati entries for the same id.
- `explanation` — shown after both players answer; keep it to 1–2 sentences.

**Funny/bonus question (always question 3):** edit
`src/data/questions_funny.json` the same shape as above, but this bank is
**not** merged with a translation — write it in whichever single language
you want it to appear in, as-is.

There are 40+ starter questions in the main banks. To grow the set, keep
adding matching-id objects to both `questions_en.json` and
`questions_gu.json` in the same shape — the game automatically works with
however many questions are in the file, and pulls a fresh random 2 (plus
the 1 funny question) each round.

No code changes are needed to add, edit, remove, or reorder questions —
just edit the JSON and refresh the page.

## Running it locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

Other useful commands:

```bash
npm test        # run the game-logic test suite
npm run test:e2e # run the Playwright end-to-end suite against a production build
npm run lint     # lint with ESLint
npm run build    # type-check and produce a production build in dist/
```

## Hosting on GitHub Pages

Deployment is automatic via `.github/workflows/deploy.yml`.

**One-time setup:**
1. Go to your repo → **Settings** → **Pages** (left sidebar).
2. Under "Build and deployment", set **Source** to **GitHub Actions**.

**From then on:** every push to `main` runs lint + unit tests, builds the
project, runs the Playwright e2e suite against that build, and publishes
`dist/` to GitHub Pages automatically — typically live within a minute or
two. No manual build step, no branch to upload to. Check the **Actions**
tab on GitHub if a deploy doesn't show up; a failing lint, test, or e2e
run blocks the deploy.
