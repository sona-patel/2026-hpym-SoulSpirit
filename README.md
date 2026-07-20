# Soul Spirit — Two-Player Spiritual Quiz Break

A calm, fast little quiz to play between two people during a break — pick a
language, race through 3 multiple-choice questions in 36 seconds each, and
see who scores higher. Built with TypeScript and Vite; GitHub Actions builds
and deploys it to GitHub Pages automatically on every push to `main`, so it
still hosts for free with no manual steps.

## Files

```
index.html                    the app shell (screens + markup)
style.css                      all visual styling
src/main.ts                    entry point: event wiring and app bootstrap
src/dom.ts                     screen switching and rendering
src/quiz.ts                    pure game logic (scoring, question picking, name validation)
src/i18n.ts                    English/Gujarati UI strings
src/types.ts                   shared TypeScript types
src/data/questions_en.json     English question bank
src/data/questions_gu.json     Gujarati question bank (same set, translated)
src/data/index.ts              typed, validated loading of the question banks
```

## How the game works

1. Welcome page: tap **"Are you ready to test your soul spirit?"**
2. Choose language (English / ગુજરાતી).
3. Enter both players' names — defaults to **Bhoolku 1** / **Bhoolku 2**.
   Both names must be different; the form blocks submission and shows an
   inline error if the same name (case-insensitive) is entered for both.
4. 3 random questions are drawn from the question bank. Each question gives
   **36 seconds**. Both players see the same question with their own set of
   answer buttons (left = Bhoolku 1, right = Bhoolku 2) and answer
   independently.
5. **Scoring:** a correct answer earns `25 + seconds remaining` points.
   Whoever answers correctly *first* gets an extra **+20 speed bonus** — so
   being fast and right pays off more than being right but slow. A wrong
   answer earns 0 and locks that player out for the rest of the question.
6. After the 3rd question, final scores and an animated "soul glow" winner
   message are shown, with the choice to **Play Again** or **Stop for now**
   — both return to the welcome page — or **Change Language**.
7. Questions won't repeat within a round, and the game avoids repeating a
   question across rounds until the whole bank has been used once — then it
   reshuffles from the full set again.

## Editing or adding questions

Open `src/data/questions_en.json` or `src/data/questions_gu.json` in any text editor. Each
question is a JSON object:

```json
{
  "id": 41,
  "question": "What does 'Santosha' mean?",
  "options": ["Wealth", "Contentment", "Fear", "Speed"],
  "correct": 1,
  "explanation": "Santosha means contentment — accepting the present moment as it is."
}
```

- `id` — must be unique within the file. Just keep counting up.
- `options` — always exactly 4 choices.
- `correct` — the **index** (0, 1, 2, or 3) of the right answer in `options`.
- `explanation` — shown after both players answer; keep it to 1–2 sentences.

There are 40 starter questions in each file. To reach your target of 369,
keep adding objects in the same shape — the game automatically works with
however many questions are in the file, and pulls a fresh random 3 each
round. Keep the English and Gujarati files in the same `id` order if you
want them to stay parallel translations of each other, though this isn't
required for the game to function.

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
npm run lint     # lint with ESLint
npm run build    # type-check and produce a production build in dist/
```

## Hosting on GitHub Pages

Deployment is automatic via `.github/workflows/deploy.yml`.

**One-time setup:**
1. Go to your repo → **Settings** → **Pages** (left sidebar).
2. Under "Build and deployment", set **Source** to **GitHub Actions**.

**From then on:** every push to `main` runs lint + tests, builds the
project, and publishes `dist/` to GitHub Pages automatically — typically
live within a minute or two. No manual build step, no branch to upload to.
Check the **Actions** tab on GitHub if a deploy doesn't show up; a failing
lint or test run blocks the deploy.
