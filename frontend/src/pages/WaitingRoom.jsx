import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';
import { Shield } from 'lucide-react';

export default function WaitingRoom() {
  const { user } = useContext(AuthContext);
  const { matchmaking, matchmakingStats, opponent, roomCode, activeGame, cancelMatchmaking } = useContext(GameContext);
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Redirect if game is found/active
    if (activeGame && roomCode) {
      navigate('/quiz');
    }
  }, [activeGame, roomCode, navigate]);

  useEffect(() => {
    // If not in matchmaking, redirect back to lobby
    if (!matchmaking && !opponent) {
      navigate('/battle');
    }
  }, [matchmaking, opponent, navigate]);

  // Matchmaking timer
  useEffect(() => {
    if (!matchmaking) {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [matchmaking]);

  const handleCancel = () => {
    cancelMatchmaking();
    navigate('/battle');
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 'Digital Safety Hero': return '🏆';
      case 'Cyber Guardian': return '🛡️';
      case 'Firewall Defender': return '🔥';
      case 'Phishing Hunter': return '🕵️';
      case 'Password Protector': return '🔑';
      default: return '👶';
    }
  };

  return (
    <div style={styles.container}>
      <div className="cyber-card" style={styles.card}>
        <h1 className="neon-text-blue" style={styles.title}>🛡️ Matchmaking</h1>
        
        {/* Animated Scanning Circle */}
        <div style={styles.radarContainer}>
          <div style={styles.pulseRing}></div>
          <div style={styles.radarCircle}>
            <span style={styles.radarIcon}>⚔️</span>
          </div>
        </div>

        <h2 style={styles.status}>
          {opponent ? 'Opponent Found!' : 'Searching for Opponent...'}
        </h2>

        {/* Search Statistics */}
        {!opponent && (
          <div style={styles.statsPanel}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Search Time</span>
              <span style={styles.statVal} className="neon-text-orange">{elapsedTime}s</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Est. Wait Time</span>
              <span style={styles.statVal}>{matchmakingStats?.estimatedWaitTime || 12}s</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Your Rank</span>
              <span style={styles.statVal} className="neon-text-blue">
                {getRankBadge(user?.rank)} {user?.rank}
              </span>
            </div>
          </div>
        )}

        {/* Player Grid Match Info */}
        <div style={styles.playerSetup}>
          {/* Player 1 (You) */}
          <div style={styles.playerBox}>
            <div style={styles.avatar}>
              {user?.avatar || '👦'}
            </div>
            <span style={styles.playerName}>{user?.username} (You)</span>
            <span style={styles.checkMark}>✓ Ready</span>
          </div>

          <div style={styles.vs}>VS</div>

          {/* Player 2 (Opponent) */}
          <div style={styles.playerBox}>
            <div style={{
              ...styles.avatar,
              background: opponent 
                ? 'linear-gradient(135deg, var(--cyber-orange) 0%, #ff5500 100%)'
                : '#1f1a3a',
              boxShadow: opponent ? '0 0 15px rgba(255, 157, 0, 0.4)' : 'none'
            }}>
              {opponent ? opponent.avatar || '👦' : '?'}
            </div>
            <span style={{
              ...styles.playerName,
              color: opponent ? '#fff' : '#77728a'
            }}>
              {opponent ? opponent.username : 'Searching...'}
            </span>
            <span style={{
              ...styles.checkMark,
              color: opponent ? 'var(--cyber-green)' : 'var(--cyber-orange)'
            }}>
              {opponent ? '✓ Joined' : '⚡ Scanning...'}
            </span>
          </div>
        </div>

        <button 
          onClick={handleCancel} 
          className="cyber-button orange" 
          style={styles.cancelBtn}
        >
          Cancel Matchmaking ❌
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
    minHeight: '80vh',
    padding: '20px',
    background: 'var(--bg-gradient)',
    color: '#fff'
  },
  card: {
    width: '100%',
    maxWidth: '540px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    padding: '40px'
  },
  title: {
    fontSize: '2.2rem',
    margin: 0,
    fontFamily: 'var(--font-title)'
  },
  radarContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0'
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px dashed var(--cyber-blue)',
    animation: 'loading-spin 8s linear infinite'
  },
  radarCircle: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'rgba(0, 240, 255, 0.1)',
    border: '2px solid var(--cyber-blue)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
  },
  radarIcon: {
    fontSize: '2.5rem',
    animation: 'float 3s ease-in-out infinite'
  },
  status: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.6rem',
    color: '#fff',
    margin: 0
  },
  statsPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    width: '100%',
    background: 'rgba(0,0,0,0.15)',
    padding: '12px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    gap: '10px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#8c87a5',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  statVal: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: '#fff',
    marginTop: '4px'
  },
  playerSetup: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.03)',
    gap: '15px'
  },
  playerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--cyber-blue) 0%, var(--cyber-purple) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)'
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#fff',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  checkMark: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: 'var(--cyber-green)'
  },
  vs: {
    fontSize: '1.6rem',
    fontFamily: 'var(--font-title)',
    fontWeight: 'bold',
    color: 'var(--cyber-orange)',
    textShadow: '0 0 8px rgba(255, 157, 0, 0.4)'
  },
  cancelBtn: {
    padding: '12px 24px',
    fontSize: '0.95rem',
    width: '100%'
  }
};
