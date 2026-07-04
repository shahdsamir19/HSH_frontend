import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';

export default function BattleLobby() {
  const { user } = useContext(AuthContext);
  const { 
    onlinePlayers, 
    joinMatchmaking, 
    matchmaking, 
    roomCode, 
    activeGame,
    sendGameInvite,
    addToast
  } = useContext(GameContext);

  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLb, setLoadingLb] = useState(true);
  
  // Friends Modal state
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

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
      const res = await fetch('http://localhost:5000/api/leaderboard');
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

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleOpenInviteModal = () => {
    setShowFriendsModal(true);
    fetchFriends();
  };

  const handleInviteFriend = (friendId, username) => {
    // Check if friend is online
    const onlineFriend = onlinePlayers.find(p => p.userId.toString() === friendId.toString());
    if (!onlineFriend || onlineFriend.status === 'Offline') {
      addToast('Cannot invite offline players.', 'warning');
      return;
    }
    if (onlineFriend.status === 'InMatch' || onlineFriend.status === 'Battle' || onlineFriend.status === 'Lobby') {
      addToast('Player is already in a match or lobby.', 'warning');
      return;
    }
    // Emit invite through GameContext
    sendGameInvite(friendId, username);
    addToast(`🎮 Invitation sent to ${username}! Waiting for them to accept...`, 'success');
    setShowFriendsModal(false);
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
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate('/')} className="cyber-button purple" style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <div style={styles.titleArea}>
          <h1 className="neon-text-blue" style={styles.title}>Cyber Arena</h1>
          <p style={styles.subtext}>Compete against players around the world in live cybersecurity battles!</p>
        </div>
      </header>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        
        {/* Play & Stats Column */}
        <div style={styles.colLeft}>
          {/* Match Options */}
          <div className="cyber-card" style={styles.playCard}>
            <h2 style={styles.sectionTitle}>⚔️ Play Now</h2>
            <p style={styles.playDesc}>Ready to test your knowledge? Search for a random live opponent or invite a friend to battle!</p>
            <div style={styles.matchOptionsRow}>
              <button 
                onClick={handleFindMatch} 
                className="cyber-button orange" 
                style={styles.findBtn}
              >
                Find Random Match 🔍
              </button>
              <button 
                onClick={handleOpenInviteModal} 
                className="cyber-button purple" 
                style={styles.findBtn}
              >
                Invite Friend 👥
              </button>
            </div>
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
                {leaderboard.length === 0 ? (
                  <div style={{...styles.noPlayers, textAlign: 'center'}}>No rankings available yet.</div>
                ) : (
                  leaderboard.map((player, idx) => (
                    <div key={player.id} style={styles.lbItem}>
                      <div style={styles.lbLeft}>
                        <span style={{
                          ...styles.lbRank,
                          color: idx === 0 ? 'var(--cyber-orange)' : idx === 1 ? '#e2e2e2' : idx === 2 ? '#cd7f32' : '#77728a'
                        }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>{player.avatar || '👦'}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={styles.lbName}>{player.username}</span>
                          <span style={{ fontSize: '0.7rem', color: '#8c87a5' }}>{getRankBadge(player.rank)} {player.rank}</span>
                        </div>
                      </div>
                      <div style={styles.lbRight}>
                        <span style={styles.lbXp}>{player.xp} XP</span>
                        {player.wins !== undefined && (
                          <span style={{ fontSize: '0.7rem', color: '#8c87a5', display: 'block', textAlign: 'right' }}>{player.wins}W</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
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

      {/* Friends Modal */}
      {showFriendsModal && (
        <div style={styles.modalOverlay}>
          <div className="cyber-card" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Select Friend to Invite</h3>
              <button onClick={() => setShowFriendsModal(false)} style={styles.closeModalBtn}>✖</button>
            </div>
            <div style={styles.modalBody}>
              {loadingFriends ? (
                <div style={styles.loading}>Loading friends...</div>
              ) : friends.length === 0 ? (
                <div style={styles.noPlayers}>You have no friends yet.</div>
              ) : (
                <div style={styles.friendsListModal}>
                  {friends.map(f => {
                    const onlineFriend = onlinePlayers.find(p => p.userId.toString() === f.id.toString());
                    const liveStatus = onlineFriend ? onlineFriend.status || 'Online' : 'Offline';
                    const isOnline = liveStatus !== 'Offline' && liveStatus !== 'InMatch' && liveStatus !== 'Battle';
                    
                    return (
                      <div key={f.id} style={styles.friendRowModal}>
                        <div style={styles.friendLeftModal}>
                          <span style={styles.avatarModal}>{f.avatar || '👦'}</span>
                          <div>
                            <div style={styles.friendNameModal}>{f.username}</div>
                            <div style={{ fontSize: '0.75rem', color: isOnline ? 'var(--cyber-green)' : '#8c87a5' }}>
                              {liveStatus}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleInviteFriend(f.id, f.username)}
                          disabled={!isOnline}
                          className={`cyber-button ${isOnline ? 'orange' : ''}`}
                          style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: isOnline ? 1 : 0.5 }}
                        >
                          Invite
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    flexWrap: 'wrap'
  },
  backBtn: {
    padding: '10px 20px',
    fontSize: '0.9rem'
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column'
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
  matchOptionsRow: {
    display: 'flex',
    gap: '12px'
  },
  findBtn: {
    flex: 1,
    padding: '16px',
    fontSize: '1.1rem'
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    width: '400px',
    maxWidth: '90%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '12px'
  },
  closeModalBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  modalBody: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  friendsListModal: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  friendRowModal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px'
  },
  friendLeftModal: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatarModal: {
    fontSize: '1.5rem'
  },
  friendNameModal: {
    fontWeight: 'bold',
    fontSize: '0.9rem'
  }
};


