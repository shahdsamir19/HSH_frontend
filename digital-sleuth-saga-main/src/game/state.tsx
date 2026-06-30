import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { ClueId } from "./data";
import { CLUE_META, REQUIRED_CLUES } from "./data";

export type Phase = "intro" | "countdown" | "room" | "board" | "recovery" | "result";

export type Toast = { id: number; text: string; sub?: string; tone: "clue" | "info" | "warn" };

type GameState = {
  phase: Phase;
  setPhase: (p: Phase) => void;
  clues: Set<ClueId>;
  addClue: (id: ClueId) => void;
  progress: number; // 0-100
  status: string;
  setStatus: (s: string) => void;
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  startedAt: number;
  elapsedMs: number;
  // board results
  timelineScore: number;
  attackScore: number;
  preventionScore: number;
  setBoardScores: (s: { timeline: number; attack: number; prevention: number }) => void;
  recoveryDone: Set<string>;
  markRecovery: (id: string) => void;
};

const Ctx = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [clues, setClues] = useState<Set<ClueId>>(new Set());
  const [status, setStatus] = useState("Entering the room...");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timelineScore, setTL] = useState(0);
  const [attackScore, setAT] = useState(0);
  const [preventionScore, setPV] = useState(0);
  const [recoveryDone, setRec] = useState<Set<string>>(new Set());
  const toastIdRef = useRef(0);

  // start clock when room phase begins
  useEffect(() => {
    if (phase === "room") setStartedAt(Date.now());
  }, [phase]);

  useEffect(() => {
    if (phase === "intro" || phase === "countdown" || phase === "result") return;
    const i = setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => clearInterval(i);
  }, [phase, startedAt]);

  const pushToast = (t: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2400);
  };

  const addClue = (id: ClueId) => {
    setClues((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      const meta = CLUE_META[id];
      pushToast({ tone: "clue", text: `NEW CLUE: ${meta.title}`, sub: `+${meta.xp} XP Investigation` });
      return next;
    });
  };

  const progress = Math.round((Array.from(clues).filter((c) => REQUIRED_CLUES.includes(c)).length / REQUIRED_CLUES.length) * 100);

  return (
    <Ctx.Provider value={{
      phase, setPhase, clues, addClue, progress, status, setStatus, toasts, pushToast,
      startedAt, elapsedMs,
      timelineScore, attackScore, preventionScore,
      setBoardScores: (s) => { setTL(s.timeline); setAT(s.attack); setPV(s.prevention); },
      recoveryDone, markRecovery: (id) => setRec((p) => { const n = new Set(p); n.add(id); return n; }),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGame() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGame outside provider");
  return v;
}

export function fmtTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
