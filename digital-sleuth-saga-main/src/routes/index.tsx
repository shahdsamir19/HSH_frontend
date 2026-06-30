import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { GameProvider, useGame } from "../game/state";
import { Room } from "../game/Room";
import { Board } from "../game/Board";
import { Recovery } from "../game/Recovery";
import { Intro, Countdown, Result } from "../game/Phases";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cyber Detective — Case 001" },
      { name: "description", content: "An immersive point-and-click cybersecurity investigation. Solve the case before your opponent." },
      { property: "og:title", content: "Cyber Detective — Case 001" },
      { property: "og:description", content: "An immersive point-and-click cybersecurity investigation." },
    ],
  }),
  component: () => (
    <GameProvider>
      <GameRoot />
    </GameProvider>
  ),
});

function GameRoot() {
  const { phase, setPhase } = useGame();
  return (
    <AnimatePresence mode="wait">
      {phase === "intro"     && <Intro     key="intro" onStart={() => setPhase("countdown")} />}
      {phase === "countdown" && <Countdown key="cd"    onGo={() => setPhase("room")} />}
      {phase === "room"      && <Room      key="room" />}
      {phase === "board"     && <Board     key="board" />}
      {phase === "recovery"  && <Recovery  key="rec" />}
      {phase === "result"    && <Result    key="res" />}
    </AnimatePresence>
  );
}
