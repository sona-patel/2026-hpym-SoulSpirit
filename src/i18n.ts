export interface Dict {
  namesTitle: string;
  namesSubtitle: string;
  p1Placeholder: string;
  p2Placeholder: string;
  dupNameError: string;
  beginBtn: string;
  correctIs: string;
  nextBtn: string;
  roundDone: string;
  playAgain: string;
  stopBtn: string;
  winnerTie: string;
  winnerIs: (name: string) => string;
  timeUp: string;
  youAnswered: string;
  correctFirst: string;
  correctSecond: string;
  wrongAns: string;
}

// The app's UI chrome (buttons, labels, statuses) stays in English — only
// the quiz questions themselves are bilingual. No language selection is
// needed, so this is a single static dictionary rather than one per
// language.
export const STRINGS: Dict = {
  namesTitle: "Who's playing?",
  namesSubtitle: "Name each seeker. First to answer right, scores higher.",
  p1Placeholder: "Bhoolku 1",
  p2Placeholder: "Bhoolku 2",
  dupNameError: "Bhoolku 1 and Bhoolku 2 need different names.",
  beginBtn: "Begin Round →",
  correctIs: "Correct answer:",
  nextBtn: "Next Question →",
  roundDone: "Round complete",
  playAgain: "Play Again ↺",
  stopBtn: "Stop for now",
  winnerTie: "Two souls, perfectly in tune",
  winnerIs: (name) => `${name}'s soul is glowing brightest!`,
  timeUp: "Time's up",
  youAnswered: "Locked in",
  correctFirst: "Correct! First to answer +bonus",
  correctSecond: "Correct!",
  wrongAns: "Not quite",
};
