import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';

export default function Results() {
  const { user } = useContext(AuthContext);
  const { activeGame, leaveRoom } = useContext(GameContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If no active game finishes in context, redirect back
    if (!activeGame || !activeGame.gameFinished) {
      navigate('/battle');
    }
  }, [activeGame, navigate]);

  if (!activeGame) return null;

  const isWinner = activeGame.winnerId === user?.id;
  const isDraw = activeGame.winnerId === null;

  const getRankThresholds = (xp) => {
    if (xp >= 1500) return { current: 'Cyber Champion', next: 'Max Rank reached!', min: 1500, max: 2000 };
    if (xp >= 1000) return { current: 'Cyber Guardian', next: 'Cyber Champion', min: 1000, max: 1500 };
    if (xp >= 600) return { current: 'Cyber Defender', next: 'Cyber Guardian', min: 600, max: 1000 };
    if (xp >= 300) return { current: 'Cyber Explorer', next: 'Cyber Defender', min: 300, max: 600 };
    return { current: 'Cyber Rookie', next: 'Cyber Explorer', min: 0, max: 300 };
  };

  const currentXP = activeGame.newTotalXP;
  const rankInfo = getRankThresholds(currentXP);
  
  // Calculate progress percentage
  const range = rankInfo.max - rankInfo.min;
  const currentProgress = currentXP - rankInfo.min;
  const progressPercent = Math.min(100, Math.max(0, (currentProgress / range) * 100));

  const handleReturn = async () => {
    await leaveRoom();
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div className="cyber-card" style={styles.card}>
        
        {/* Outcome Header */}
        <div style={styles.outcomeHeader}>
          {isWinner && (
            <>
              <span style={styles.outcomeIcon}>🏆</span>
              <h1 className="neon-text-orange" style={styles.outcomeTitle}>YOU WIN!</h1>
              <p style={styles.outcomeSub}>Awesome job! You are defending the cyber network like a pro!</p>
            </>
          )}
          {isDraw && (
            <>
              <span style={styles.outcomeIcon}>🤝</span>
              <h1 className="neon-text-blue" style={styles.outcomeTitle}>IT'S A DRAW!</h1>
              <p style={styles.outcomeSub}>Great minds think alike! You matched your opponent answer for answer.</p>
            </>
          )}
          {!isWinner && !isDraw && (
            <>
              <span style={styles.outcomeIcon}>🤖</span>
              <h1 className="neon-text-purple" style={styles.outcomeTitle}>NICE EFFORT!</h1>
              <p style={styles.outcomeSub}>Every battle is a lesson. Keep playing to level up your defenses!</p>
            </>
          )}
        </div>

        {/* Scores Panel */}
        <div style={styles.scoresPanel}>
          <div style={styles.scoreCol}>
            <span style={styles.scoreVal}>{activeGame.myScore}</span>
            <span style={styles.scoreLabel}>Your Score</span>
          </div>
          <div style={styles.vs}>vs</div>
          <div style={styles.scoreCol}>
            <span style={styles.scoreVal}>{activeGame.opponentScore}</span>
            <span style={styles.scoreLabel}>Opponent Score</span>
          </div>
        </div>

        {/* Rewards Panel */}
        <div style={styles.rewardsPanel}>
          <h3 style={styles.rewardsTitle}>🎁 Match Rewards</h3>
          <div style={styles.rewardRow}>
            <span style={styles.rewardName}>XP Gained:</span>
            <span style={styles.rewardVal} className="neon-text-orange">+{activeGame.xpEarned} XP</span>
          </div>
          <div style={styles.rewardRow}>
            <span style={styles.rewardName}>New Total XP:</span>
            <span style={styles.rewardVal} className="neon-text-blue">{activeGame.newTotalXP} XP</span>
          </div>
        </div>

        {/* Rank Progression Bar */}
        <div style={styles.rankProgressCard}>
          <div style={styles.rankLabelRow}>
            <span style={styles.currentRank}>Active Rank: <b className="neon-text-blue">{activeGame.newRank}</b></span>
            {rankInfo.next !== 'Max Rank reached!' && (
              <span style={styles.nextRank}>Next: {rankInfo.next}</span>
            )}
          </div>
          <div style={styles.progressContainer}>
            <div style={{
              ...styles.progressBar,
              width: `${progressPercent}%`
            }}></div>
          </div>
          {rankInfo.next !== 'Max Rank reached!' && (
            <div style={styles.xpRemaining}>
              Need {rankInfo.max - currentXP} more XP to rank up!
            </div>
          )}
        </div>

        {/* Return Button */}
        <button 
          onClick={handleReturn} 
          className="cyber-button orange" 
          style={styles.returnBtn}
        >
          Return to Dashboard 🏠
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '90vh',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    padding: '40px'
  },
  outcomeHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  outcomeIcon: {
    fontSize: '4.5rem',
    animation: 'float 3s ease-in-out infinite'
  },
  outcomeTitle: {
    fontSize: '2.8rem',
    margin: 0
  },
  outcomeSub: {
    color: '#8c87a5',
    fontSize: '0.98rem',
    lineHeight: '1.4',
    maxWidth: '400px'
  },
  scoresPanel: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    background: 'rgba(0,0,0,0.2)',
    padding: '20px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.03)',
    alignItems: 'center'
  },
  scoreCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  scoreVal: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff'
  },
  scoreLabel: {
    fontSize: '0.8rem',
    color: '#8c87a5',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: '4px'
  },
  vs: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'var(--cyber-purple)',
    fontFamily: 'var(--font-title)'
  },
  rewardsPanel: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: 'rgba(0,0,0,0.15)',
    padding: '16px 20px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.02)'
  },
  rewardsTitle: {
    fontSize: '1.05rem',
    color: '#fff',
    textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    paddingBottom: '6px'
  },
  rewardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.95rem'
  },
  rewardName: {
    color: '#8c87a5',
    fontWeight: '600'
  },
  rewardVal: {
    fontWeight: '800'
  },
  rankProgressCard: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  rankLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  currentRank: {
    color: '#fff'
  },
  nextRank: {
    color: '#8c87a5'
  },
  progressContainer: {
    height: '14px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '50px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--cyber-blue) 0%, var(--cyber-purple) 100%)',
    boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
    borderRadius: '50px',
    transition: 'width 1.5s cubic-bezier(0.1, 0.8, 0.3, 1)'
  },
  xpRemaining: {
    fontSize: '0.8rem',
    color: 'var(--cyber-orange)',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  returnBtn: {
    width: '100%',
    padding: '16px',
    fontSize: '1.1rem'
  }
};
