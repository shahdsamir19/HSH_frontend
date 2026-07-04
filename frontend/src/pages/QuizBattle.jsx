import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';
import { Shield, Timer, Award, Zap, Smile, Heart, ThumbsUp, Send } from 'lucide-react';

import CyberDetectiveView from './CyberDetectiveView';
import CaptureTheFlagView from './CaptureTheFlagView';
import CityDefenseView from './CityDefenseView';
import VirusOutbreakView from './VirusOutbreakView';
import CyberDuelView from './CyberDuelView';
import { motion, AnimatePresence } from 'framer-motion';
import useGameLayout from '../hooks/useGameLayout';

export default function QuizBattle() {
  useGameLayout();
  const { user } = useContext(AuthContext);
  const {
    activeGame,
    opponent,
    submitAnswer,
    startInvestigationReady,
    submitDetectiveReport,
    finishRecovery,
    submitCtfFlag,
    defendAction,
    requestCleanZone,
    submitCleanZone,
    submitDuelAnswer,
    activatePowerup,
    leaveRoom,
    sendReaction,
    floatingReactions
  } = useContext(GameContext);
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(null);

  // Reaction emojis
  const emojis = ['😄', '😎', '😮', '😢', '😠', '👑', '🔥', '🛡️'];

  useEffect(() => {
    // If no active game, redirect back to lobby
    if (!activeGame) {
      navigate('/battle');
    }
  }, [activeGame, navigate]);

  useEffect(() => {
    // Reset local selection when a new question starts
    if (activeGame && !activeGame.correctAnswer) {
      setSelectedOption(null);
    }
  }, [activeGame?.questionIndex, activeGame?.correctAnswer]);

  // Track combo streaks locally based on answers
  useEffect(() => {
    if (activeGame?.correctAnswer) {
      const isCorrect = activeGame.correctAnswer === selectedOption;
      if (isCorrect) {
        setStreak(prev => prev + 1);
        setLastCorrect(true);
      } else {
        setStreak(0);
        setLastCorrect(false);
      }
    }
  }, [activeGame?.correctAnswer]);

  useEffect(() => {
    // Redirect to results when game finishes
    if (activeGame?.gameFinished) {
      navigate('/results');
    }
  }, [activeGame?.gameFinished, navigate]);

  if (!activeGame) return null;

  // Detective mode is full-screen — bypass the quiz shell entirely.
  // It has its own intro, countdown, room, board, recovery, and result screens.
  if (activeGame.gameMode === 'detective') {
    return (
      <CyberDetectiveView
        activeGame={activeGame}
        startInvestigationReady={startInvestigationReady}
        submitDetectiveReport={submitDetectiveReport}
        finishRecovery={finishRecovery}
        opponent={opponent}
      />
    );
  }

  const handleSelectOption = (optionKey) => {
    if (activeGame.answered || activeGame.correctAnswer !== null) return;
    setSelectedOption(optionKey);
    submitAnswer(optionKey);
  };

  const getOptionStyle = (key) => {
    const isEnded = activeGame.correctAnswer !== null;
    const isCorrect = activeGame.correctAnswer === key;
    const isSelected = selectedOption === key;

    let style = { ...styles.optionBtn };

    if (isEnded) {
      if (isCorrect) {
        style.borderColor = 'var(--cyber-green)';
        style.backgroundColor = 'rgba(57, 255, 20, 0.15)';
        style.boxShadow = '0 0 15px rgba(57, 255, 20, 0.3)';
        style.color = '#fff';
      } else if (isSelected && !isCorrect) {
        style.borderColor = 'var(--cyber-red)';
        style.backgroundColor = 'rgba(255, 56, 56, 0.15)';
        style.boxShadow = '0 0 15px rgba(255, 56, 56, 0.3)';
        style.color = '#fff';
      } else {
        style.opacity = 0.5;
        style.cursor = 'not-allowed';
      }
    } else {
      if (isSelected) {
        style.borderColor = 'var(--cyber-orange)';
        style.boxShadow = '0 0 15px rgba(255, 157, 0, 0.4)';
        style.backgroundColor = 'rgba(255, 157, 0, 0.08)';
      }
      if (activeGame.answered) {
        style.cursor = 'not-allowed';
        style.opacity = 0.8;
      }
    }

    return style;
  };

  const renderProgressTimeline = () => {
    const dots = [];
    const total = activeGame.totalQuestions;
    const current = activeGame.questionIndex;

    for (let i = 1; i <= total; i++) {
      if (i < current) {
        dots.push(<span key={i} style={{ ...styles.dot, backgroundColor: 'var(--cyber-blue)' }} title={`Round ${i} done`}></span>);
      } else if (i === current) {
        dots.push(<span key={i} style={{ ...styles.dot, backgroundColor: 'var(--cyber-orange)', border: '2px solid #fff', transform: 'scale(1.25)' }} title="Active Round"></span>);
      } else {
        dots.push(<span key={i} style={{ ...styles.dot, backgroundColor: 'rgba(255,255,255,0.15)' }} title={`Round ${i} locked`}></span>);
      }
    }
    return dots;
  };

  const handleQuit = () => {
    if (window.confirm("Are you sure you want to quit the battle? You will forfeit and get 0 XP!")) {
      leaveRoom();
    }
  };

  // Rendering countdown overlay if battle is preparing (non-detective modes only)
  if (activeGame.countdown > 0) {
    return (
      <div style={styles.countdownContainer}>
        <div style={styles.countdownBox}>
          <h1 className="neon-text-blue" style={styles.countdownHeader}>BATTLE FOUND!</h1>
          
          <div style={styles.matchupDisplay}>
            <div style={styles.matchupPlayer}>
              <div style={styles.bigAvatar}>{user?.avatar || '👦'}</div>
              <span style={styles.matchupName}>{user?.username}</span>
              <span className="neon-text-blue" style={styles.matchupRank}>{user?.rank}</span>
            </div>
            
            <div style={styles.bigVs}>VS</div>

            <div style={styles.matchupPlayer}>
              <div style={{ ...styles.bigAvatar, background: 'linear-gradient(135deg, var(--cyber-orange) 0%, #ff5500 100%)' }}>
                {opponent?.avatar || '👦'}
              </div>
              <span style={styles.matchupName}>{opponent?.username}</span>
              <span className="neon-text-orange" style={styles.matchupRank}>{opponent?.rank}</span>
            </div>
          </div>

          <div style={styles.countdownNumberBox}>
            <span style={styles.countdownNumber}>{activeGame.countdown}</span>
          </div>
          <p style={styles.loadingText}>Initializing safe query protocols...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Floating Emojis Reaction Overlay */}
      <div style={styles.reactionsOverlay}>
        {floatingReactions.map(r => (
          <div key={r.id} className="reaction-bubble" style={styles.floatingEmoji}>
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Status Bar */}
      <div className="cyber-card" style={styles.topBar}>
        <div style={styles.topInfo}>
          <span style={styles.roundLabel}>Round: <b className="neon-text-blue">{activeGame.questionIndex} / {activeGame.totalQuestions}</b></span>
          
          <div style={styles.statusBox}>
            <span style={styles.statusText}>{activeGame.statusText}</span>
          </div>

          <button onClick={handleQuit} className="cyber-button purple" style={styles.quitBtn}>
            Surrender 🏳️
          </button>
        </div>

        {/* Timer Progress Bar */}
        <div style={styles.timerWrapper}>
          <div style={styles.timerLabel}>
            <Timer size={16} /> Time Remaining: <span className={activeGame.secondsRemaining <= 5 ? "neon-text-orange" : "neon-text-blue"}>{activeGame.secondsRemaining} seconds</span>
          </div>
          <div style={styles.timerProgressContainer}>
            <div style={{
              ...styles.timerProgressBar,
              width: `${(activeGame.secondsRemaining / 15) * 100}%`,
              backgroundColor: activeGame.secondsRemaining <= 5 ? 'var(--cyber-orange)' : 'var(--cyber-blue)',
              boxShadow: activeGame.secondsRemaining <= 5 ? '0 0 10px rgba(255, 157, 0, 0.4)' : '0 0 10px rgba(0, 240, 255, 0.4)'
            }}></div>
          </div>
        </div>
      </div>

      {/* Main Split grid */}
      <div style={styles.gameContent}>
        
        {/* Left: Question area */}
        <div style={styles.quizArea}>
          {/* Detective mode is handled via early return above; this block is intentionally removed */}
          {activeGame.gameMode === 'ctf' && (
            <CaptureTheFlagView
              activeGame={activeGame}
              submitCtfFlag={submitCtfFlag}
              opponent={opponent}
            />
          )}
          {activeGame.gameMode === 'defense' && (
            <CityDefenseView
              activeGame={activeGame}
              defendAction={defendAction}
              opponent={opponent}
            />
          )}
          {activeGame.gameMode === 'outbreak' && (
            <VirusOutbreakView
              activeGame={activeGame}
              requestCleanZone={requestCleanZone}
              submitCleanZone={submitCleanZone}
              user={user}
            />
          )}
          {activeGame.gameMode === 'duel' && (
            <CyberDuelView
              activeGame={activeGame}
              submitDuelAnswer={submitDuelAnswer}
              activatePowerup={activatePowerup}
              opponent={opponent}
            />
          )}
          {!activeGame.gameMode && (
            <>
              <div className="cyber-card" style={styles.questionCard}>
                <span style={styles.categoryBadge}>Digital Safety Trivia</span>
                <h2 style={styles.questionText}>{activeGame.questionText || "Booting cybersecurity challenge..."}</h2>
              </div>

              <div style={styles.optionsGrid}>
                {Object.entries(activeGame.options || {}).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectOption(key)}
                    style={getOptionStyle(key)}
                    disabled={activeGame.answered || activeGame.correctAnswer !== null}
                  >
                    <span style={styles.optionKey}>{key}</span>
                    <span style={styles.optionValue}>{value}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar: Scores & Progress */}
        <div style={styles.sidebar}>
          
          {/* Real-time Scores */}
          <div className="cyber-card" style={styles.scoreCard}>
            <h3 style={styles.scoreTitle}>🏆 Live Score</h3>
            
            <div style={styles.scoreboard}>
              {/* User Score */}
              <div style={styles.scoreRow}>
                <div style={styles.playerDetails}>
                  <div style={styles.avatar}>{user?.avatar || '👦'}</div>
                  <div style={styles.scoreTextCol}>
                    <span style={styles.scoreName}>{user?.username}</span>
                    {streak > 1 && <span style={styles.streakText}>🔥 {streak} Streak</span>}
                  </div>
                </div>
                <span style={{ ...styles.scoreValue, color: 'var(--cyber-blue)' }}>{activeGame.myScore}</span>
              </div>

              <div style={styles.scoreDivider}>VS</div>

              {/* Opponent Score */}
              <div style={styles.scoreRow}>
                <div style={styles.playerDetails}>
                  <div style={{ ...styles.avatar, background: 'linear-gradient(135deg, var(--cyber-orange) 0%, #ff5500 100%)' }}>
                    {opponent?.avatar || '👦'}
                  </div>
                  <div style={styles.scoreTextCol}>
                    <span style={styles.scoreName}>{opponent?.username}</span>
                    {activeGame.gameMode === 'detective' && activeGame.opponentState && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--cyber-orange)', fontStyle: 'italic', display: 'block' }}>
                        {activeGame.opponentState}
                      </span>
                    )}
                    {activeGame.opponentAnswered && <span style={styles.answeredBadge}>Submitted</span>}
                  </div>
                </div>
                <span style={{ ...styles.scoreValue, color: 'var(--cyber-orange)' }}>{activeGame.opponentScore}</span>
              </div>
            </div>

            {/* Answer indicators */}
            <div style={styles.indicators}>
              <div style={styles.indicatorRow}>
                <span>Your Answer:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: activeGame.answered ? 'var(--cyber-green)' : 'var(--cyber-orange)' 
                }}>
                  {activeGame.answered ? 'Submitted ✓' : 'Thinking... 💭'}
                </span>
              </div>
              <div style={styles.indicatorRow}>
                <span>Opponent:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: activeGame.opponentAnswered ? 'var(--cyber-green)' : 'var(--cyber-orange)' 
                }}>
                  {activeGame.opponentAnswered ? 'Opponent Answered ✓' : 'Thinking... 💭'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Reaction Emojis Panel */}
          <div className="cyber-card" style={styles.reactionsPanel}>
            <h4>Send Battle Reaction</h4>
            <div style={styles.emojiList}>
              {emojis.map(e => (
                <button key={e} onClick={() => sendReaction(e)} style={styles.emojiBtn}>
                  {e}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Timeline Progress Bar */}
      <div className="cyber-card" style={styles.progressCard}>
        <div style={styles.progressTitle}>Battle Progress</div>
        <div style={styles.dotsContainer}>
          {renderProgressTimeline()}
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: '30px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'relative'
  },
  countdownContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-gradient)',
    color: '#fff',
    padding: '20px'
  },
  countdownBox: {
    width: '100%',
    maxWidth: '640px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    background: 'var(--glass-bg)',
    border: '2px solid var(--glass-border)',
    borderRadius: '24px',
    padding: '50px',
    backdropFilter: 'blur(10px)'
  },
  countdownHeader: {
    fontFamily: 'var(--font-title)',
    fontSize: '2.5rem',
    margin: 0
  },
  matchupDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    background: 'rgba(0,0,0,0.2)',
    padding: '30px',
    borderRadius: '20px'
  },
  matchupPlayer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  bigAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--cyber-blue) 0%, var(--cyber-purple) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
  },
  matchupName: {
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },
  matchupRank: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  bigVs: {
    fontFamily: 'var(--font-title)',
    fontSize: '2rem',
    color: 'var(--cyber-orange)',
    fontWeight: 'bold'
  },
  countdownNumberBox: {
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  countdownNumber: {
    fontSize: '5rem',
    fontWeight: '800',
    color: 'var(--cyber-orange)',
    textShadow: '0 0 30px rgba(255, 157, 0, 0.6)',
    fontFamily: 'var(--font-title)',
    animation: 'pulse-neon 1s infinite'
  },
  loadingText: {
    color: '#8c87a5',
    fontSize: '0.9rem'
  },
  reactionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 999,
    overflow: 'hidden'
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: '3rem',
    bottom: '-50px',
    left: '50%',
    animation: 'floatEmoji 3s ease-in-out forwards'
  },
  topBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '20px'
  },
  topInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  roundLabel: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.25rem',
    color: '#fff'
  },
  statusBox: {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '6px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  statusText: {
    fontSize: '0.9rem',
    color: 'var(--cyber-blue)',
    fontWeight: 'bold'
  },
  quitBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem'
  },
  timerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  timerLabel: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#8c87a5',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  timerProgressContainer: {
    height: '10px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '50px',
    overflow: 'hidden'
  },
  timerProgressBar: {
    height: '100%',
    borderRadius: '50px',
    transition: 'width 1s linear'
  },
  gameContent: {
    display: 'grid',
    gridTemplateColumns: '1.40fr 0.60fr',
    gap: '24px',
    alignItems: 'start'
  },
  quizArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  questionCard: {
    padding: '40px',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '12px'
  },
  categoryBadge: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--cyber-orange)',
    fontWeight: 'bold'
  },
  questionText: {
    fontSize: '1.8rem',
    lineHeight: '1.4',
    color: '#fff'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  optionBtn: {
    background: 'var(--glass-bg)',
    border: '2px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '24px',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#f5f5fa',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s ease',
    minHeight: '80px',
    backdropFilter: 'blur(8px)',
    fontFamily: 'var(--font-body)'
  },
  optionKey: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.4rem',
    fontWeight: '800',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  optionValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    lineHeight: '1.3'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  scoreCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  scoreTitle: {
    fontSize: '1.3rem',
    color: '#fff',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '10px'
  },
  scoreboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.15)',
    padding: '12px 16px',
    borderRadius: '16px'
  },
  playerDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--cyber-blue) 0%, var(--cyber-purple) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#fff'
  },
  scoreTextCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  scoreName: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '0.95rem'
  },
  streakText: {
    fontSize: '0.75rem',
    color: 'var(--cyber-orange)',
    fontWeight: 'bold'
  },
  answeredBadge: {
    fontSize: '0.7rem',
    color: 'var(--cyber-green)',
    fontWeight: 'bold'
  },
  scoreValue: {
    fontSize: '1.5rem',
    fontWeight: '800'
  },
  scoreDivider: {
    textAlign: 'center',
    color: 'var(--cyber-purple)',
    fontWeight: 'bold',
    fontFamily: 'var(--font-title)'
  },
  indicators: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#8c87a5'
  },
  indicatorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reactionsPanel: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emojiList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  emojiBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    fontSize: '1.8rem',
    padding: '8px 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },
  progressCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '16px'
  },
  progressTitle: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#8c87a5',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  dotsContainer: {
    display: 'flex',
    gap: '10px'
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block',
    transition: 'all 0.3s ease'
  }
};
