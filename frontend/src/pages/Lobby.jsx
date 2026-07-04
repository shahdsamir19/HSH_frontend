import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';

export default function Lobby() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const { socket, addToast, pendingLobbyState, clearPendingLobbyState } = useContext(GameContext);
  const navigate = useNavigate();

  // Seed from cached lobby state if available (handles race between server emit and mount)
  const [players, setPlayers] = useState(() => {
    if (pendingLobbyState?.players?.length) return pendingLobbyState.players;
    return [];
  });
  const [isReady, setIsReady] = useState(false);

  // If pendingLobbyState arrives/updates after mount (e.g. context refreshed), apply it
  useEffect(() => {
    if (pendingLobbyState?.players?.length) {
      setPlayers(pendingLobbyState.players);
    }
  }, [pendingLobbyState]);

  useEffect(() => {
    if (!socket || !user || !roomId) return;

    let stateReceived = false;
    let challengeStarted = false;
    let retryTimer = null;

    const handleLobbyState = (state) => {
      stateReceived = true;
      // Replace entire player list (authoritative state from server)
      setPlayers(state.players || []);
    };

    const handlePlayerJoined = (player) => {
      setPlayers(prev => {
        if (!prev.find(p => p.id === player.id)) {
          return [...prev, player];
        }
        return prev;
      });
      addToast(`${player.username} joined the lobby.`, 'success');
    };

    const handlePlayerReady = ({ userId, ready }) => {
      setPlayers(prev => prev.map(p =>
        p.id.toString() === userId.toString() ? { ...p, isReady: ready } : p
      ));
    };

    const handleLobbyCancelled = (data) => {
      if (challengeStarted) return;
      addToast(data.message || 'Lobby was cancelled.', 'warning');
      navigate('/battle');
    };

    const handleChallengeStarted = () => {
      challengeStarted = true;
      stateReceived = true;
      if (retryTimer) clearTimeout(retryTimer);
      addToast('All players ready! Starting challenge...', 'success');
      setTimeout(() => { navigate('/quiz'); }, 1500);
    };

    socket.on('lobby-state', handleLobbyState);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-ready', handlePlayerReady);
    socket.on('lobby-cancelled', handleLobbyCancelled);
    socket.on('challenge-started', handleChallengeStarted);

    // Request current lobby state immediately
    socket.emit('join-lobby', { roomId });

    // Safety retry: if no state received within 1.5s, request again
    // (handles the race where the server emitted before this component mounted)
    retryTimer = setTimeout(() => {
      if (!stateReceived && !challengeStarted) {
        socket.emit('join-lobby', { roomId });
      }
    }, 1500);

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      socket.off('lobby-state', handleLobbyState);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-ready', handlePlayerReady);
      socket.off('lobby-cancelled', handleLobbyCancelled);
      socket.off('challenge-started', handleChallengeStarted);
    };
  }, [socket, user, roomId, navigate, addToast]);

  const toggleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    socket.emit('set-ready', { roomId, ready: newReady });
  };

  const handleCancel = () => {
    socket.emit('cancel-lobby', { roomId });
    navigate('/battle');
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 className="neon-text-blue" style={styles.title}>Cyber Arena Lobby</h1>
        <p style={styles.subtext}>Waiting for all players to be ready...</p>
      </div>

      <div style={styles.content}>
        <div className="cyber-card" style={styles.lobbyCard}>
          <div style={styles.playersContainer}>
            {players.length === 0 ? (
              <div style={styles.loading}>Connecting to lobby...</div>
            ) : (
              players.map(p => (
                <div key={p.id} style={styles.playerRow}>
                  <div style={styles.playerInfo}>
                    <span style={styles.avatar}>{p.avatar || '👤'}</span>
                    <span style={styles.username}>{p.username}</span>
                  </div>
                  <div style={p.isReady ? styles.statusReady : styles.statusWaiting}>
                    {p.isReady ? '✅ Ready' : '⏳ Waiting...'}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={styles.divider}></div>
          <div style={styles.footerText}>
            Waiting for all players...
          </div>
          
          <div style={styles.actions}>
            <button 
              onClick={handleCancel}
              className="cyber-button"
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button 
              onClick={toggleReady}
              className={`cyber-button ${isReady ? 'green' : 'orange'}`}
              style={styles.readyBtn}
            >
              {isReady ? 'Unready' : 'Ready Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px'
  },
  pageHeader: {
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    margin: '0 0 10px 0'
  },
  subtext: {
    color: '#8c87a5',
    fontSize: '1.1rem'
  },
  content: {
    width: '100%'
  },
  lobbyCard: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  playersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  playerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
    padding: '20px 30px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    fontSize: '2.5rem'
  },
  username: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  statusReady: {
    color: 'var(--cyber-green)',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  statusWaiting: {
    color: '#e2e2e2',
    fontStyle: 'italic',
    fontSize: '1.1rem'
  },
  loading: {
    textAlign: 'center',
    color: '#8c87a5',
    padding: '20px'
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '10px 0'
  },
  footerText: {
    textAlign: 'center',
    color: '#8c87a5',
    fontSize: '0.9rem'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '10px'
  },
  cancelBtn: {
    padding: '12px 30px',
    fontSize: '1.1rem',
    background: 'transparent',
    border: '1px solid var(--cyber-red)',
    color: 'var(--cyber-red)'
  },
  readyBtn: {
    padding: '12px 40px',
    fontSize: '1.1rem',
    fontWeight: 'bold'
  }
};
