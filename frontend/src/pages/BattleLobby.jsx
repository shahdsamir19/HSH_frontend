import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';

export default function BattleLobby() {
  const { user } = useContext(AuthContext);
  const { 
    onlinePlayers, 
    joinMatchmaking, 
    triggerMockChallenge, 
    matchmaking, 
    roomCode, 
    activeGame 
  } = useContext(GameContext);

  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLb, setLoadingLb] = useState(true);

  useEffect(() => {
    // Fetch global leaderboard
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    // Redirect if matchmaking starts or game active
    if (matchmaking) {
      navigate('/waiting');
    } else if (activeGame && roomCode) {
      navigate('/quiz');
    }
  }, [matchmaking, activeGame, roomCode, navigate]);

  const fetchLeaderboard = async () => {
    try {
      setLoadingLb(true);
      const res = await fetch('https://hsh-backend.vercel.app/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoadingLb(false);
    }
  };

  const handleFindMatch = async () => {
    await joinMatchmaking();
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 'Cyber Champion': return '🏆';
      case 'Cyber Guardian': return '🛡️';
      case 'Cyber Defender': return '⚔️';
      case 'Cyber Explorer': return '🧭';
      default: return '👶';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 className="neon-text-blue" style={styles.title}>Cyber Arena</h1>
        <p style={styles.subtext}>Compete against players around the world in live cybersecurity battles!</p>
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        
        {/* Play & Stats Column */}
        <div style={styles.colLeft}>
          {/* Find Match */}
          <div className="cyber-card" style={styles.playCard}>
            <h2 style={styles.sectionTitle}>⚔️ Play Now</h2>
            <p style={styles.playDesc}>Ready to test your knowledge? Click below to search for a live opponent. The faster you answer, the more bonus points you get!</p>
            <button 
              onClick={handleFindMatch} 
              className="cyber-button orange" 
              style={styles.findBtn}
            >
              Find Match 🔍
            </button>
          </div>

          {/* User Stats */}
          <div className="cyber-card" style={styles.statsCard}>
            <h2 style={styles.sectionTitle}>📊 Your Stats</h2>
            {user && (
              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <span style={styles.statVal}>{user.xp}</span>
                  <span style={styles.statLabel}>Total XP</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statVal} className="neon-text-blue">
                    {getRankBadge(user.rank)} {user.rank}
                  </span>
                  <span style={styles.statLabel}>Rank</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statVal} style={{ color: 'var(--cyber-green)' }}>{user.wins}</span>
                  <span style={styles.statLabel}>Wins</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statVal} style={{ color: 'var(--cyber-red)' }}>{user.losses}</span>
                  <span style={styles.statLabel}>Losses</span>
                </div>
              </div>
            )}
          </div>

          {/* Test Utilities */}
          <div className="cyber-card" style={styles.testCard}>
            <h2 style={styles.sectionTitle}>🧪 Demo Tools</h2>
            <p style={styles.testDesc}>Simulate real-time events to see notifications and test systems.</p>
            <div style={styles.testActions}>
              <button 
                onClick={() => triggerMockChallenge('Ahmed')}
                className="cyber-button purple"
                style={styles.testBtn}
              >
                Simulate Ahmed Challenge 🔔
              </button>
              <button 
                onClick={() => triggerMockChallenge('Sara')}
                className="cyber-button purple"
                style={styles.testBtn}
              >
                Simulate Sara Challenge 🔔
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard & Presence Column */}
        <div style={styles.colRight}>
          {/* Top Players */}
          <div className="cyber-card" style={styles.lobbyCard}>
            <h2 style={styles.sectionTitle}>🏆 Top Players</h2>
            {loadingLb ? (
              <div style={styles.loading}>Loading Leaderboard...</div>
            ) : (
              <div style={styles.lbList}>
                {leaderboard.map((player, idx) => (
                  <div key={player.id} style={styles.lbItem}>
                    <div style={styles.lbLeft}>
                      <span style={{
                        ...styles.lbRank,
                        color: idx === 0 ? 'var(--cyber-orange)' : idx === 1 ? '#e2e2e2' : idx === 2 ? '#cd7f32' : '#77728a'
                      }}>
                        #{idx + 1}
                      </span>
                      <span style={styles.lbName}>{player.username}</span>
                      <span style={styles.lbBadge}>{getRankBadge(player.rank)}</span>
                    </div>
                    <div style={styles.lbRight}>
                      <span style={styles.lbXp}>{player.xp} XP</span>
                      <span style={styles.lbWins}>{player.wins} W</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Online Players */}
          <div className="cyber-card" style={styles.lobbyCard}>
            <h2 style={styles.sectionTitle}>🟢 Online Players</h2>
            <div style={styles.presenceList}>
              {onlinePlayers.length === 0 ? (
                <div style={styles.noPlayers}>No players currently online.</div>
              ) : (
                onlinePlayers.map(p => (
                  <div key={p.id} style={styles.presenceItem}>
                    <div style={styles.playerPresence}>
                      <span style={{
                        ...styles.presenceIndicator,
                        backgroundColor: p.status === 'InMatch' ? 'var(--cyber-orange)' : 'var(--cyber-green)'
                      }}></span>
                      <span style={styles.presenceName}>{p.username}</span>
                    </div>
                    <span style={{
                      ...styles.presenceStatus,
                      color: p.status === 'InMatch' ? 'var(--cyber-orange)' : 'var(--cyber-green)'
                    }}>
                      {p.status === 'InMatch' ? 'In Battle' : 'Online'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

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
    gap: '30px'
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px'
  },
  title: {
    fontSize: '2.5rem',
    margin: 0
  },
  subtext: {
    color: '#8c87a5',
    fontSize: '1rem',
    marginTop: '4px'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '30px',
    alignItems: 'start'
  },
  colLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  colRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  playCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  sectionTitle: {
    fontSize: '1.4rem',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px',
    marginBottom: '8px'
  },
  playDesc: {
    color: '#a4a0be',
    fontSize: '0.98rem',
    lineHeight: '1.5'
  },
  findBtn: {
    width: '100%',
    padding: '18px',
    fontSize: '1.25rem'
  },
  statsCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  statBox: {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '16px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.03)'
  },
  statVal: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#fff'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#8c87a5',
    marginTop: '4px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  lobbyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  lbList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  lbItem: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(0,0,0,0.15)',
    padding: '12px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    alignItems: 'center'
  },
  lbLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  lbRank: {
    fontFamily: 'var(--font-title)',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  lbName: {
    fontWeight: 'bold',
    color: '#fff'
  },
  lbBadge: {
    fontSize: '0.9rem'
  },
  lbRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  lbXp: {
    fontWeight: 'bold',
    color: 'var(--cyber-blue)'
  },
  lbWins: {
    fontSize: '0.8rem',
    color: 'var(--cyber-green)',
    background: 'rgba(57, 255, 20, 0.1)',
    padding: '2px 8px',
    borderRadius: '8px',
    fontWeight: 'bold'
  },
  presenceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  presenceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.15)',
    padding: '10px 16px',
    borderRadius: '12px'
  },
  playerPresence: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  presenceIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  presenceName: {
    fontWeight: '600',
    color: '#fff'
  },
  presenceStatus: {
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  noPlayers: {
    color: '#8c87a5',
    textAlign: 'center',
    padding: '20px'
  },
  loading: {
    color: '#8c87a5',
    textAlign: 'center',
    padding: '20px'
  },
  testCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  testDesc: {
    color: '#8c87a5',
    fontSize: '0.9rem'
  },
  testActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  testBtn: {
    padding: '10px 16px',
    fontSize: '0.85rem'
  }
};


