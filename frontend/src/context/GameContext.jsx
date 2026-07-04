import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const GameContext = createContext();

// Module-level ref for investigation countdown to survive re-renders
let investigationCountdownTimer = null;

export const GameProvider = ({ children }) => {
  const { token, user, updateUserStats } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [matchmaking, setMatchmaking] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  // Emojis floating list (reactions)
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Active game states
  const [activeGame, setActiveGame] = useState(null);

  // Matchmaking statistics
  const [matchmakingStats, setMatchmakingStats] = useState(null);

  // Cooperative Team Mission state
  const [activeTeam, setActiveTeam] = useState(null);

  // Pending lobby state (cached so Lobby.jsx can read on mount, avoiding race)
  const [pendingLobbyState, setPendingLobbyState] = useState(null);
  const [teamChat, setTeamChat] = useState([]);
  const [teamActivity, setTeamActivity] = useState([]);

  // Helper for adding toast notifications
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const s = io('http://localhost:5000', {
      auth: { token },
      query: { token }
    });

    window.socketActive = s;

    s.on('connect', () => {
      setConnected(true);
      s.emit('go-online', { userId: user.id });
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('presence-update', (players) => {
      setOnlinePlayers(players);
    });

    s.on('matchmaking-started', (data) => {
      setMatchmaking(true);
      setMatchmakingStats(data);
      addToast('Searching for an opponent...', 'info');
    });

    s.on('matchmaking-cancelled', () => {
      setMatchmaking(false);
      setMatchmakingStats(null);
      addToast('Matchmaking cancelled.', 'info');
    });

    s.on('match-found', (data) => {
      setMatchmaking(false);
      setRoomCode(data.roomCode);
      
      const isPlayer1 = data.player1.id.toString() === user?.id?.toString();
      const matchedOpponent = isPlayer1 ? data.player2 : data.player1;
      setOpponent(matchedOpponent);
      addToast(`Match Found! Mode: ${data.gameMode}`, 'success');
      
      // Dispatch event to global router
      window.dispatchEvent(new CustomEvent('global-match-found', { detail: data }));

      // Initialize game state with countdown active
      setActiveGame({
        roomCode: data.roomCode,
        gameMode: data.gameMode,
        questionIndex: 0,
        totalQuestions: 10,
        questionText: '',
        options: {},
        secondsRemaining: 15,
        myScore: 0,
        opponentScore: 0,
        correctAnswer: null,
        answered: false,
        opponentAnswered: false,
        gameFinished: false,
        statusText: 'Opponent Found! Preparing systems...',
        countdown: 3,

        // Mode specific fields
        unveiledEvidence: [],
        myFragments: 0,
        opponentFragments: 0,
        myShield: 100,
        opponentShield: 100,
        grid: Array(9).fill(null).map((_, i) => ({ zoneIndex: i, status: 'infected', owner: null })),
        myHp: 100,
        opponentHp: 100,
        myPowerups: [],
        myCombo: 0,
        opponentCombo: 0,
        myShieldActive: false,
        opponentShieldActive: false
      });
      
      // Start local countdown
      let count = 3;
      const cntInterval = setInterval(() => {
        count--;
        setActiveGame(prev => {
          if (!prev) return null;
          return {
            ...prev,
            countdown: count,
            statusText: count > 0 ? `Starting in ${count}...` : 'GO!'
          };
        });
        if (count <= 0) {
          clearInterval(cntInterval);
        }
      }, 1000);
    });

    s.on('question-sent', (data) => {
      setActiveGame(prev => {
        const myScore = prev ? prev.myScore : 0;
        const opponentScore = prev ? prev.opponentScore : 0;
        return {
          ...prev,
          questionIndex: data.questionIndex,
          totalQuestions: data.totalQuestions,
          questionText: data.questionText,
          options: {
            A: data.optionA,
            B: data.optionB,
            C: data.optionC,
            D: data.optionD
          },
          secondsRemaining: data.secondsRemaining,
          myScore,
          opponentScore,
          correctAnswer: null,
          answered: false,
          opponentAnswered: false,
          gameFinished: false,
          statusText: `Question ${data.questionIndex} active!`,
          countdown: 0
        };
      });
    });

    s.on('opponent-answered', () => {
      setActiveGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          opponentAnswered: true
        };
      });
    });

    s.on('score-update', (scores) => {
      setActiveGame(prev => {
        if (!prev) return null;
        const myScoreInfo = scores.find(s => s.userId.toString() === user?.id.toString());
        const oppScoreInfo = scores.find(s => s.userId.toString() !== user?.id.toString());
        return {
          ...prev,
          myScore: myScoreInfo ? myScoreInfo.score : prev.myScore,
          opponentScore: oppScoreInfo ? oppScoreInfo.score : prev.opponentScore
        };
      });
    });

    s.on('question-ended', (data) => {
      setActiveGame(prev => {
        if (!prev) return null;
        const myScoreInfo = data.playerScores.find(s => s.userId.toString() === user?.id.toString());
        const oppScoreInfo = data.playerScores.find(s => s.userId.toString() !== user?.id.toString());
        return {
          ...prev,
          correctAnswer: data.correctAnswer,
          myScore: myScoreInfo ? myScoreInfo.score : prev.myScore,
          opponentScore: oppScoreInfo ? oppScoreInfo.score : prev.opponentScore,
          statusText: `Round ended. Correct answer is ${data.correctAnswer}!`
        };
      });
    });

    // --- Cyber Detective Mode Listeners ---
    s.on('detective-briefing', (data) => {
      setActiveGame(prev => ({
        ...prev,
        scenarioName: data.scenarioName,
        questionText: data.questionText,
        detectiveConfig: data.detectiveConfig,
        briefingActive: true,
        opponentReady: false,
        myReady: false,
        countdown: 0
      }));
    });

    s.on('opponent-ready-status', (data) => {
      setActiveGame(prev => {
        if (!prev) return null;
        if (data.userId.toString() === user?.id.toString()) {
          return { ...prev, myReady: data.ready };
        } else {
          return { ...prev, opponentReady: data.ready };
        }
      });
    });

    s.on('investigation-countdown-start', () => {
      // Clear any existing countdown to prevent duplicate intervals on re-emit
      if (investigationCountdownTimer) {
        clearInterval(investigationCountdownTimer);
        investigationCountdownTimer = null;
      }

      let count = 3;
      setActiveGame(prev => ({ ...prev, countdown: count, statusText: 'Starting in 3...' }));
      investigationCountdownTimer = setInterval(() => {
        count--;
        setActiveGame(prev => {
          if (!prev) {
            clearInterval(investigationCountdownTimer);
            investigationCountdownTimer = null;
            return null;
          }
          return {
            ...prev,
            countdown: count,
            statusText: count > 0 ? `Starting in ${count}...` : 'GO!'
          };
        });
        if (count <= 0) {
          clearInterval(investigationCountdownTimer);
          investigationCountdownTimer = null;
        }
      }, 1000);
    });

    s.on('detective-start', (data) => {
      setActiveGame(prev => ({
        ...prev,
        scenarioName: data.scenarioName,
        questionText: data.questionText,
        options: data.options,
        detectiveConfig: data.detectiveConfig,
        unveiledEvidence: [],
        answered: false,
        secondsRemaining: 120,
        opponentState: 'Idle',
        briefingActive: false
      }));
    });

    s.on('detective-tick', (data) => {
      setActiveGame(prev => ({
        ...prev,
        secondsRemaining: data.secondsRemaining
      }));
    });

    s.on('opponent-clue-found', (data) => {
      setActiveGame(prev => ({
        ...prev,
        opponentScore: data.progress
      }));
    });

    s.on('opponent-timeline-updated', () => {
      // Intentionally hidden from user
    });

    s.on('opponent-recovery-progress', (data) => {
      // Intentionally hidden from user
    });

    s.on('opponent-status-changed', (data) => {
      setActiveGame(prev => ({
        ...prev,
        opponentState: data.state
      }));
    });

    s.on('report-result', (data) => {
      window.dispatchEvent(new CustomEvent('report-result-event', { detail: data }));
    });

    s.on('opponent-report-submitted', () => {
      addToast(`🚨 Opponent submitted their investigation report!`, 'warning');
    });

    // --- CTF Mode Listeners ---
    s.on('ctf-challenge', (data) => {
      setActiveGame(prev => ({
        ...prev,
        vaultName: data.vaultName,
        questionText: data.questionText,
        answered: false,
        secondsRemaining: 15,
        questionIndex: data.questionIndex,
        totalQuestions: data.totalQuestions
      }));
    });

    s.on('fragment-earned', (data) => {
      setActiveGame(prev => {
        const myFragments = data.playerFragments[user?.id] || 0;
        const opponentFragments = Object.entries(data.playerFragments).find(([id]) => id.toString() !== user?.id.toString())?.[1] || 0;
        return {
          ...prev,
          myFragments,
          opponentFragments
        };
      });
      addToast(`${data.username} earned a key fragment! 🔑`, 'success');
    });

    // --- City Defense Mode Listeners ---
    s.on('packet-wave', (data) => {
      setActiveGame(prev => ({
        ...prev,
        packetText: data.packetText,
        waveIndex: data.waveIndex,
        totalWaves: data.totalWaves,
        answered: false,
        secondsRemaining: 3
      }));
    });

    s.on('shield-update', (data) => {
      setActiveGame(prev => {
        const myShield = data.playerShields[user?.id] || 0;
        const opponentShield = Object.entries(data.playerShields).find(([id]) => id.toString() !== user?.id.toString())?.[1] || 0;
        return {
          ...prev,
          myShield,
          opponentShield
        };
      });
    });

    // --- Virus Outbreak Mode Listeners ---
    s.on('outbreak-start', (data) => {
      setActiveGame(prev => ({
        ...prev,
        grid: data.grid,
        secondsRemaining: 40
      }));
    });

    s.on('clean-zone-challenge', (data) => {
      setActiveGame(prev => ({
        ...prev,
        activeChallenge: {
          zoneIndex: data.zoneIndex,
          questionText: data.questionText,
          options: data.options
        }
      }));
    });

    s.on('outbreak-map-update', (data) => {
      setActiveGame(prev => ({
        ...prev,
        grid: data.grid,
        activeChallenge: null
      }));
    });

    // --- Cyber Duel Mode Listeners ---
    s.on('duel-question', (data) => {
      setActiveGame(prev => ({
        ...prev,
        questionText: data.questionText,
        answered: false,
        secondsRemaining: 10
      }));
    });

    s.on('duel-update', (data) => {
      setActiveGame(prev => {
        const myInfo = data.players[user?.id] || {};
        const oppInfo = Object.entries(data.players).find(([id]) => id.toString() !== user?.id.toString())?.[1] || {};
        return {
          ...prev,
          myHp: myInfo.hp !== undefined ? myInfo.hp : prev.myHp,
          opponentHp: oppInfo.hp !== undefined ? oppInfo.hp : prev.opponentHp,
          myCombo: myInfo.combo !== undefined ? myInfo.combo : prev.myCombo,
          opponentCombo: oppInfo.combo !== undefined ? oppInfo.combo : prev.opponentCombo,
          myShieldActive: myInfo.shieldActive !== undefined ? myInfo.shieldActive : prev.myShieldActive,
          opponentShieldActive: oppInfo.shieldActive !== undefined ? oppInfo.shieldActive : prev.opponentShieldActive,
          myPowerups: myInfo.powerups || prev.myPowerups
        };
      });
    });

    s.on('battle-finished', (data) => {
      setActiveGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          gameFinished: true,
          winnerId: data.winnerId,
          winnerUsername: data.winnerUsername,
          myScore: data.yourScore,
          opponentScore: data.opponentScore,
          xpEarned: data.xpEarned,
          newTotalXP: data.newTotalXP,
          newRank: data.newRank,
          statusText: 'Battle Finished!'
        };
      });

      // Update local state
      updateUserStats(data.newTotalXP, data.newRank);

      const isWinner = data.winnerId?.toString() === user?.id.toString();
      const isDraw = data.winnerId === null;
      if (isWinner) {
        addToast('Victory! You earned XP and ranked up!', 'success');
      } else if (isDraw) {
        addToast('Draw match! Well played!', 'info');
      } else {
        addToast('Match ended. Nice effort!', 'warning');
      }
    });

    s.on('opponent-disconnected', () => {
      addToast('Your opponent has left the match.', 'warning');
    });

    s.on('reaction-received', (emoji) => {
      const id = Date.now() + Math.random();
      setFloatingReactions(prev => [...prev, { id, emoji }]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== id));
      }, 3000);
    });

    // --- Cooperative Mission Socket Listeners ---
    s.on('team-created', ({ roomCode, team }) => {
      setActiveTeam(team);
      setRoomCode(roomCode);
      setTeamChat([]);
      setTeamActivity([{ type: 'info', message: `Team room ${roomCode} created. Welcome!` }]);
      addToast(`Team lobby created!`, 'success');
    });

    s.on('team-updated', (team) => {
      setActiveTeam(team);
      setRoomCode(team.roomCode);
    });

    s.on('join-team-failed', (data) => {
      addToast(data.message, 'error');
    });

    s.on('mission-started', (team) => {
      setActiveTeam(team);
      setTeamActivity(prev => [...prev, { type: 'info', message: 'Mission started! Save the net!' }]);
      addToast(`Mission started! Go, team!`, 'success');
    });

    s.on('mission-chat-message', (data) => {
      setTeamChat(prev => [...prev, data]);
    });

    s.on('mission-activity', (data) => {
      setTeamActivity(prev => [...prev, data]);
    });

    s.on('mission-finished', (data) => {
      setActiveTeam(data.team);
      addToast(`Mission complete! Awarded +${data.xpEarned} XP!`, 'success');
    });

    s.on('badge-unlocked', (data) => {
      addToast(`🏆 BADGE UNLOCKED: ${data.badge.name}!`, 'success');
      window.dispatchEvent(new CustomEvent('badge-unlocked-event', { detail: data }));
    });

    s.on('new-notification', (notif) => {
      addToast(notif.message, 'info');
      window.dispatchEvent(new CustomEvent('new-notification-event', { detail: notif }));
    });

    s.on('friend-list-updated', () => {
      window.dispatchEvent(new CustomEvent('friend-list-updated-event'));
    });

    // --- Friend Invite & Lobby Listeners ---
    s.on('game-invite', (data) => {
      addToast(`🎮 ${data.inviterName} challenged you to a battle! Check notifications.`, 'info');
      window.dispatchEvent(new CustomEvent('game-invite-event', { detail: data }));
    });

    s.on('invite-sent', (data) => {
      window.dispatchEvent(new CustomEvent('invite-sent-event', { detail: data }));
    });

    s.on('invite-accepted', (data) => {
      window.dispatchEvent(new CustomEvent('invite-accepted-event', { detail: data }));
    });

    // Cache lobby-state so Lobby.jsx can access it immediately on mount
    s.on('lobby-state', (data) => {
      setPendingLobbyState(data);
    });

    s.on('invite-declined', (data) => {
      addToast(data.message || 'Invitation declined.', 'warning');
      window.dispatchEvent(new CustomEvent('invite-declined-event', { detail: data }));
    });

    s.on('invite-expired', (data) => {
      addToast(data.message || 'Invitation expired.', 'warning');
      window.dispatchEvent(new CustomEvent('invite-expired-event', { detail: data }));
    });

    s.on('lobby-cancelled', (data) => {
      // Only toast if we are not actively in a game, to prevent spam when transitioning
      if (!window.location.pathname.includes('/quiz') && !window.location.pathname.includes('/waiting')) {
        addToast(data?.message || 'Lobby was cancelled.', 'warning');
      }
      window.dispatchEvent(new CustomEvent('lobby-cancelled-event', { detail: data }));
    });

    // --- Quiz Mode (Friend Battles) ---
    s.on('new-question', (data) => {
      setActiveGame(prev => {
        const myScore = prev ? prev.myScore : 0;
        const opponentScore = prev ? prev.opponentScore : 0;
        return {
          ...prev,
          questionIndex: data.questionIndex,
          totalQuestions: data.totalQuestions,
          questionText: data.questionText,
          options: data.options || {},
          hints: data.hints || {},
          secondsRemaining: 15,
          myScore,
          opponentScore,
          correctAnswer: null,
          answered: false,
          opponentAnswered: false,
          gameFinished: false,
          statusText: `Question ${data.questionIndex} active!`,
          countdown: 0
        };
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
      window.socketActive = null;
    };
  }, [token, user?.id]);

  // Handle local countdown for remaining seconds
  useEffect(() => {
    if (!activeGame || activeGame.gameFinished || activeGame.correctAnswer !== null || activeGame.countdown > 0) return;

    const interval = setInterval(() => {
      setActiveGame(prev => {
        if (!prev || prev.secondsRemaining <= 0) {
          clearInterval(interval);
          return prev;
        }
        return {
          ...prev,
          secondsRemaining: prev.secondsRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame?.questionIndex, activeGame?.correctAnswer, activeGame?.gameFinished, activeGame?.countdown]);

  const joinMatchmaking = () => {
    if (socket && connected) {
      setOpponent(null);
      setRoomCode(null);
      setActiveGame(null);
      socket.emit('join-matchmaking', { userId: user.id });
    }
  };

  const cancelMatchmaking = () => {
    if (socket && connected) {
      socket.emit('cancel-matchmaking');
    }
  };

  const submitQuizAnswer = (answer) => {
    if (socket && connected && roomCode && activeGame && !activeGame.answered) {
      setActiveGame(prev => ({ ...prev, answered: true }));
      socket.emit('submit-quiz-answer', { roomId: roomCode, answer });
    }
  };

  const startInvestigationReady = () => {
    // Guard: only emit once per match (server also guards, but belt-and-suspenders)
    if (socket && connected && roomCode && activeGame && !activeGame.myReady) {
      setActiveGame(prev => ({ ...prev, myReady: true }));
      socket.emit('start-investigation', { roomCode });
    }
  };

  const submitDetectiveReport = (report) => {
    if (socket && connected && roomCode) {
      socket.emit('submit-detective-report', { roomCode, report });
    }
  };

  const notifyClueFound = (progress, clueId) => {
    if (socket && connected && roomCode) {
      socket.emit('clue-found', { roomCode, progress, clueId });
    }
  };

  const notifyTimelineUpdated = (timeline) => {
    if (socket && connected && roomCode) {
      socket.emit('timeline-updated', { roomCode, timeline });
    }
  };

  const notifyRecoveryProgress = (step) => {
    if (socket && connected && roomCode) {
      socket.emit('recovery-progress', { roomCode, step });
    }
  };

  const notifyStatusChanged = (state) => {
    if (socket && connected && roomCode) {
      socket.emit('status-changed', { roomCode, state });
    }
  };

  const finishRecovery = () => {
    if (socket && connected && roomCode) {
      socket.emit('finish-recovery', { roomCode });
    }
  };

  const submitCtfFlag = (answer) => {
    if (socket && connected && roomCode && activeGame && !activeGame.answered) {
      setActiveGame(prev => ({ ...prev, answered: true }));
      socket.emit('submit-ctf-flag', { roomCode, answer });
    }
  };

  const defendAction = (action) => {
    if (socket && connected && roomCode && activeGame && !activeGame.answered) {
      setActiveGame(prev => ({ ...prev, answered: true }));
      socket.emit('defend-action', { roomCode, action });
    }
  };

  const requestCleanZone = (zoneIndex) => {
    if (socket && connected && roomCode) {
      socket.emit('request-clean-zone', { roomCode, zoneIndex });
    }
  };

  const submitCleanZone = (zoneIndex, answer) => {
    if (socket && connected && roomCode) {
      socket.emit('submit-clean-zone', { roomCode, zoneIndex, answer });
    }
  };

  const submitDuelAnswer = (answer) => {
    if (socket && connected && roomCode && activeGame && !activeGame.answered) {
      setActiveGame(prev => ({ ...prev, answered: true }));
      socket.emit('submit-duel-answer', { roomCode, answer });
    }
  };

  const activatePowerup = (powerup) => {
    if (socket && connected && roomCode) {
      socket.emit('activate-powerup', { roomCode, powerup });
    }
  };

  const sendReaction = (emoji) => {
    if (socket && connected && roomCode) {
      socket.emit('send-reaction', { roomCode, emoji });
    }
  };

  const leaveRoom = () => {
    if (socket && connected) {
      if (roomCode) socket.emit('leave-room', { roomCode });
      setMatchmaking(false);
      setOpponent(null);
      setRoomCode(null);
      setActiveGame(null);
      addToast('Returned to Lobby', 'info');
    }
  };

  // --- Friend Invite / Lobby functions ---
  const sendGameInvite = (friendId, username) => {
    if (socket && connected) {
      socket.emit('invite-friend', { friendId, username });
    }
  };

  const cancelGameInvite = (roomId) => {
    if (socket && connected) {
      socket.emit('cancel-lobby', { roomId });
    }
  };

  const declineGameInvite = (roomId) => {
    if (socket && connected) {
      socket.emit('decline-invite', { roomId });
    }
  };

  const acceptGameInvite = (roomId) => {
    if (socket && connected) {
      setRoomCode(roomId);
      socket.emit('accept-invite', { roomId });
    }
  };

  // --- Cooperative Team Mission triggers ---
  const createTeamMission = (missionName) => {
    if (socket && connected) {
      socket.emit('create-team', { userId: user.id, missionName });
    }
  };

  const joinTeamMission = (code) => {
    if (socket && connected && code) {
      socket.emit('join-team', { userId: user.id, roomCode: code.toUpperCase() });
    }
  };

  const toggleTeamReady = () => {
    if (socket && connected && roomCode) {
      socket.emit('toggle-ready', { roomCode });
    }
  };

  const startTeamMission = () => {
    if (socket && connected && roomCode) {
      socket.emit('start-mission', { roomCode });
    }
  };

  const sendTeamChat = (message) => {
    if (socket && connected && roomCode && message.trim()) {
      socket.emit('send-mission-chat', { roomCode, message });
    }
  };

  const completeTeamObjective = (objectiveId, clueText) => {
    if (socket && connected && roomCode) {
      socket.emit('complete-puzzle', { roomCode, objectiveId, clueText });
    }
  };

  const leaveTeamMission = () => {
    if (socket && connected && roomCode) {
      socket.emit('leave-team', { roomCode });
      setActiveTeam(null);
      setRoomCode(null);
      setTeamChat([]);
      setTeamActivity([]);
    }
  };

  return (
    <GameContext.Provider value={{
      socket,
      connected,
      onlinePlayers,
      matchmaking,
      matchmakingStats,
      opponent,
      roomCode,
      activeGame,
      toasts,
      floatingReactions,
      activeTeam,
      teamChat,
      teamActivity,
      addToast,
      joinMatchmaking,
      cancelMatchmaking,
      submitQuizAnswer,
      startInvestigationReady,
      submitDetectiveReport,
      notifyClueFound,
      notifyTimelineUpdated,
      notifyRecoveryProgress,
      notifyStatusChanged,
      finishRecovery,
      submitCtfFlag,
      defendAction,
      requestCleanZone,
      submitCleanZone,
      submitDuelAnswer,
      activatePowerup,
      sendReaction,
      leaveRoom,
      sendGameInvite,
      cancelGameInvite,
      declineGameInvite,
      acceptGameInvite,
      createTeamMission,
      joinTeamMission,
      toggleTeamReady,
      startTeamMission,
      sendTeamChat,
      completeTeamObjective,
      leaveTeamMission,
      pendingLobbyState,
      clearPendingLobbyState: () => setPendingLobbyState(null)
    }}>
      {children}
    </GameContext.Provider>
  );
};


