import React from 'react';
import { GameProvider, useGame } from '../game/state';
import { Room } from '../game/Room';
import { Board } from '../game/Board';
import { Recovery } from '../game/Recovery';
import { Intro, Countdown, Result } from '../game/Phases';

function CyberDetectiveInner() {
  const { phase, startInvestigationReady, forceRoomEntry } = useGame();

  console.log("[CyberDetectiveInner] phase:", phase);

  switch (phase) {
    case "intro":
      return <Intro onStart={startInvestigationReady} />;
    case "countdown":
      return <Countdown onGo={forceRoomEntry} />;
    case "room":
      return <Room />;
    case "board":
      return <Board />;
    case "recovery":
      return <Recovery />;
    case "result":
      return <Result />;
    default:
      return <Intro onStart={startInvestigationReady} />;
  }
}

export default function CyberDetectiveView({ 
  activeGame, 
  startInvestigationReady, 
  submitDetectiveReport, 
  finishRecovery, 
  opponent 
}) {
  return (
    <GameProvider
      activeGame={activeGame}
      startInvestigationReady={startInvestigationReady}
      submitDetectiveReport={submitDetectiveReport}
      finishRecovery={finishRecovery}
      opponent={opponent}
    >
      <CyberDetectiveInner />
    </GameProvider>
  );
}
