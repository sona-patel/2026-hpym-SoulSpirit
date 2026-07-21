import type { Lang } from "./types";

export interface Dict {
  namesTitle: string;
  namesSubtitle: string;
  p1Placeholder: string;
  p2Placeholder: string;
  dupNameError: string;
  beginBtn: string;
  changeLang2: string;
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

export const I18N: Record<Lang, Dict> = {
  en: {
    namesTitle: "Who's playing?",
    namesSubtitle: "Name each seeker. First to answer right, scores higher.",
    p1Placeholder: "Bhoolku 1",
    p2Placeholder: "Bhoolku 2",
    dupNameError: "Bhoolku 1 and Bhoolku 2 need different names.",
    beginBtn: "Begin Round →",
    changeLang2: "Change Language",
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
  },
  gu: {
    namesTitle: "કોણ રમે છે?",
    namesSubtitle: "દરેક સાધકનું નામ આપો. જે પહેલા સાચો જવાબ આપશે, તેને વધુ ગુણ મળશે.",
    p1Placeholder: "ભૂલકું ૧",
    p2Placeholder: "ભૂલકું ૨",
    dupNameError: "ભૂલકું ૧ અને ભૂલકું ૨ માટે અલગ અલગ નામ આપો.",
    beginBtn: "રાઉન્ડ શરૂ કરો →",
    changeLang2: "ભાષા બદલો",
    correctIs: "સાચો જવાબ:",
    nextBtn: "આગળનો પ્રશ્ન →",
    roundDone: "રાઉન્ડ પૂર્ણ",
    playAgain: "ફરી રમો ↺",
    stopBtn: "હમણાં માટે બંધ કરો",
    winnerTie: "બે આત્માઓ, સંપૂર્ણ તાલમાં",
    winnerIs: (name) => `${name}નો આત્મા સૌથી વધુ ચમકી રહ્યો છે!`,
    timeUp: "સમય પૂરો",
    youAnswered: "નોંધાયું",
    correctFirst: "સાચું! પ્રથમ જવાબ +બોનસ",
    correctSecond: "સાચું!",
    wrongAns: "ફરી પ્રયત્ન કરો",
  },
};
