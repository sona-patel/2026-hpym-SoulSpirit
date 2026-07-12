# Soul Spirit — Two-Player Spiritual Quiz Break

A calm, fast little quiz to play between two people during a break — pick a
language, race through 3 multiple-choice questions in 36 seconds each, and
see who scores higher. No build tools, no backend — just HTML, CSS, and JS,
so it hosts for free on GitHub Pages.

## Files

```
index.html          the app shell (screens + markup)
style.css            all visual styling
script.js             game logic (timer, scoring, screens)
questions_en.json    English question bank (40 questions to start)
questions_gu.json    Gujarati question bank (same 40, translated)
```

## How the game works

1. Choose language (English / ગુજરાતી).
2. Enter both players' names (optional — defaults to Player One / Player Two).
3. 5 random questions are drawn from the question bank. Each question gives
   **60 seconds**. Both players see the same question with their own set of
   answer buttons (left = Player 1, right = Player 2) and answer
   independently.
4. **Scoring:** a correct answer earns `25 + seconds remaining` points.
   Whoever answers correctly *first* gets an extra **+20 speed bonus** — so
   being fast and right pays off more than being right but slow. A wrong
   answer earns 0 and locks that player out for the rest of the question.
5. After the 5th question, final scores and a winner are shown, with the
   choice to **Play Again** (new random 5, same language), **Change
   Language**, or **Stop**.
6. Questions won't repeat within a round, and the game avoids repeating a
   question across rounds until the whole bank has been used once — then it
   reshuffles from the full set again.

## Editing or adding questions

Open `questions_en.json` or `questions_gu.json` in any text editor. Each
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
however many questions are in the file, and pulls a fresh random 5 each
round. Keep the English and Gujarati files in the same `id` order if you
want them to stay parallel translations of each other, though this isn't
required for the game to function.

No code changes are needed to add, edit, remove, or reorder questions —
just edit the JSON and refresh the page.

## Running it locally

Because the page uses `fetch()` to load the JSON files, opening
`index.html` directly by double-clicking it won't work in most browsers
(they block `fetch` on the `file://` protocol). Serve the folder locally
instead:

```bash
cd antar-quiz
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Hosting on GitHub Pages

1. **Create a new repository** on GitHub (e.g. `antar-quiz`). Keep it Public
   — GitHub Pages on the free plan needs a public repo.
2. **Upload these five files** to the repository root (`index.html`,
   `style.css`, `script.js`, `questions_en.json`, `questions_gu.json`) —
   either by dragging them into the GitHub web UI's "Add file → Upload
   files" screen, or by pushing with git:
   ```bash
   git init
   git add index.html style.css script.js questions_en.json questions_gu.json
   git commit -m "Initial commit: Antar quiz"
   git branch -M main
   git remote add origin https://github.com/<your-username>/antar-quiz.git
   git push -u origin main
   ```
3. **Turn on GitHub Pages:**
   - Go to your repo → **Settings** → **Pages** (left sidebar).
   - Under "Build and deployment", set **Source** to **Deploy from a
     branch**.
   - Set **Branch** to `main` and folder to `/ (root)`, then **Save**.
4. Wait a minute or two, then refresh that Pages settings screen — it will
   show your live URL, typically:
   ```
   https://<your-username>.github.io/antar-quiz/
   ```
5. Open that link — the game is now live and shareable with anyone.

Any time you edit a question file and push the change (or re-upload it
through the GitHub web UI), GitHub Pages redeploys automatically within a
minute or two.
