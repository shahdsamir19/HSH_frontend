import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CLUE_META, REQUIRED_CLUES } from "./data";

const Ctx = createContext(null);

export function GameProvider({ 
  children, 
  activeGame, 
  startInvestigationReady, 
  submitDetectiveReport, 
  finishRecovery, 
  opponent 
}) {
  const [phase, setPhase] = useState("intro");
  const [clues, setClues] = useState(new Set());
  const [status, setStatusState] = useState("Entering the room...");
  const [toasts, setToasts] = useState([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timelineScore, setTL] = useState(0);
  const [attackScore, setAT] = useState(0);
  const [preventionScore, setPV] = useState(0);
  const [recoveryDone, setRec] = useState(new Set());
  const toastIdRef = useRef(0);

  // Once the player has entered the room we must never go back to briefing/countdown.
  // This ref is set to true the first time phase becomes "room" (or beyond).
  const enteredRoomRef = useRef(false);

  // Track whether we have explicitly set phase to room to prevent re-entry of this logic
  useEffect(() => {
    if (phase === "room" || phase === "board" || phase === "recovery" || phase === "result") {
      enteredRoomRef.current = true;
    }
  }, [phase]);

  // Sync phase with activeGame briefing / countdown states.
  // IMPORTANT: `phase` is intentionally NOT in the dep array to avoid re-triggering
  // the loop. We only re-run when the server-driven flags change.
  useEffect(() => {
    if (!activeGame) return;
    console.log(
      "[State Sync] briefingActive:", activeGame.briefingActive,
      "| countdown:", activeGame.countdown,
      "| enteredRoom:", enteredRoomRef.current,
      "| phase:", phase
    );

    // If we have already entered the room (or beyond), never go backwards.
    if (enteredRoomRef.current) {
      console.log("[State Sync] Room already entered — ignoring briefing sync.");
      return;
    }

    if (activeGame.briefingActive) {
      if (activeGame.countdown > 0) {
        console.log("[State Sync] → countdown");
        setPhase("countdown");
      } else {
        console.log("[State Sync] → intro (briefing)");
        setPhase("intro");
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame?.briefingActive, activeGame?.countdown]);

  // Sync recovery transition upon report-result success
  useEffect(() => {
    const handleReportResult = (e) => {
      if (e.detail && e.detail.correct) {
        setPhase("recovery");
      }
    };
    window.addEventListener("report-result-event", handleReportResult);
    return () => window.removeEventListener("report-result-event", handleReportResult);
  }, []);

  // Sync recovery progress steps to rival client via socket
  useEffect(() => {
    if (window.socketActive && activeGame && recoveryDone.size > 0) {
      window.socketActive.emit("recovery-progress", { 
        roomCode: activeGame.roomCode, 
        step: recoveryDone.size 
      });
    }
  }, [recoveryDone.size, activeGame?.roomCode]);

  // start clock when room phase begins
  useEffect(() => {
    if (phase === "room") setStartedAt(Date.now());
  }, [phase]);

  useEffect(() => {
    if (phase === "intro" || phase === "countdown" || phase === "result") return;
    const i = setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => clearInterval(i);
  }, [phase, startedAt]);

  const pushToast = (t) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2400);
  };

  const addClue = (id) => {
    setClues((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      const meta = CLUE_META[id];
      if (meta) {
        pushToast({ tone: "clue", text: `NEW CLUE: ${meta.title}`, sub: `+${meta.xp} XP Investigation` });
      }

      // Sync clue discovery progress to socket
      const newProgress = Math.min(next.size * 20, 100);
      if (window.socketActive && activeGame) {
        window.socketActive.emit("clue-found", { 
          roomCode: activeGame.roomCode, 
          progress: newProgress, 
          clueId: id 
        });
      }

      return next;
    });
  };

  const setStatus = (s) => {
    setStatusState(s);
    if (window.socketActive && activeGame) {
      window.socketActive.emit("status-changed", { 
        roomCode: activeGame.roomCode, 
        state: s 
      });
    }
  };

  const progress = Math.round((Array.from(clues).filter((c) => REQUIRED_CLUES.includes(c)).length / REQUIRED_CLUES.length) * 100);

  // Expose a way for the Countdown component to force room entry
  // (handles the case where local countdown finishes before detective-start arrives)
  const forceRoomEntry = () => {
    console.log("[forceRoomEntry] Forcing room phase from countdown.");
    enteredRoomRef.current = true;
    setPhase("room");
  };

  return (
    <Ctx.Provider value={{
      phase, setPhase, forceRoomEntry,
      clues, addClue, progress, status, setStatus, toasts, pushToast,
      startedAt, elapsedMs,
      timelineScore, attackScore, preventionScore,
      setBoardScores: (s) => { setTL(s.timeline); setAT(s.attack); setPV(s.prevention); },
      recoveryDone, markRecovery: (id) => setRec((p) => { const n = new Set(p); n.add(id); return n; }),
      activeGame, 
      startInvestigationReady: () => {
        setPhase("countdown");
        startInvestigationReady();
      }, 
      submitDetectiveReport, finishRecovery, opponent
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

export function fmtTime(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
