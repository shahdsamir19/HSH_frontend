import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { GameProvider, GameContext } from './context/GameContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import BattleLobby from './pages/BattleLobby';
import WaitingRoom from './pages/WaitingRoom';
import QuizBattle from './pages/QuizBattle';
import Results from './pages/Results';
import TeamMissions from './pages/TeamMissions';
import CyberClub from './pages/CyberClub';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Friends from './pages/Friends';
import Lobby from './pages/Lobby';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={styles.loading}>Booting Security Systems...</div>;
  if (!user) return <Auth />;
  return children;
};

const MainApp = () => {
  const { toasts, acceptGameInvite, declineGameInvite, cancelGameInvite, addToast } = useContext(GameContext);
  const navigate = useNavigate();
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [outgoingInvite, setOutgoingInvite] = useState(null);

  useEffect(() => {
    const handleGlobalMatchFound = () => {
      setTimeout(() => {
        navigate('/quiz');
      }, 1500);
    };
    
    const handleGameInvite = (e) => setIncomingInvite(e.detail);
    const handleInviteSent = (e) => setOutgoingInvite(e.detail); // { status, roomId, friendName }
    const handleInviteAccepted = (e) => {
      setOutgoingInvite(prev => prev ? { ...prev, accepted: true } : null);
      // Navigate quickly so Lobby.jsx can mount and register listeners before
      // the retry window expires
      setTimeout(() => {
        setOutgoingInvite(null);
        navigate(`/lobby/${e.detail.roomId}`);
      }, 500);
    };
    const handleInviteDeclined = () => setOutgoingInvite(null);
    const handleInviteExpired = () => {
      setOutgoingInvite(null);
      setIncomingInvite(null);
    };

    window.addEventListener('global-match-found', handleGlobalMatchFound);
    window.addEventListener('game-invite-event', handleGameInvite);
    window.addEventListener('invite-sent-event', handleInviteSent);
    window.addEventListener('invite-accepted-event', handleInviteAccepted);
    window.addEventListener('invite-declined-event', handleInviteDeclined);
    window.addEventListener('invite-expired-event', handleInviteExpired);

    return () => {
      window.removeEventListener('global-match-found', handleGlobalMatchFound);
      window.removeEventListener('game-invite-event', handleGameInvite);
      window.removeEventListener('invite-sent-event', handleInviteSent);
      window.removeEventListener('invite-accepted-event', handleInviteAccepted);
      window.removeEventListener('invite-declined-event', handleInviteDeclined);
      window.removeEventListener('invite-expired-event', handleInviteExpired);
    };
  }, [navigate]);

  const handleAcceptInvite = () => {
    if (incomingInvite) {
      acceptGameInvite(incomingInvite.roomId);
      navigate(`/lobby/${incomingInvite.roomId}`);
      setIncomingInvite(null);
    }
  };

  const handleDeclineInvite = () => {
    if (incomingInvite) {
      declineGameInvite(incomingInvite.roomId);
      addToast('Declined the battle invitation.', 'info');
      setIncomingInvite(null);
    }
  };

  const handleCancelOutgoing = () => {
    if (outgoingInvite) {
      cancelGameInvite(outgoingInvite.roomId);
      setOutgoingInvite(null);
    }
  };

  return (
    <>
      {/* Toast Notifications Overlay */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span style={styles.toastIcon}>
              {toast.type === 'success' ? '🏆' : toast.type === 'warning' ? '⚡' : toast.type === 'error' ? '🚨' : '🔔'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Game Invite Banner */}
      {incomingInvite && (
        <div style={styles.inviteBanner}>
          <span style={styles.inviteText}>⚔️ <strong>{incomingInvite.inviterName}</strong> challenged you to a Cyber Battle!</span>
          <div style={styles.inviteActions}>
            <button onClick={handleAcceptInvite} style={styles.acceptBtn}>Accept ✅</button>
            <button onClick={handleDeclineInvite} style={styles.declineBtn}>Decline ❌</button>
          </div>
        </div>
      )}

      {/* Outgoing Invite Waiting Screen Overlay */}
      {outgoingInvite && (
        <div style={styles.waitingOverlay}>
          <div className="cyber-card" style={styles.waitingModal}>
            {outgoingInvite.accepted ? (
              <>
                <h2 className="neon-text-green" style={{margin: '0 0 10px 0'}}>✅ {outgoingInvite.friendName} accepted your invitation!</h2>
                <p style={{color: '#a0a0a0', marginBottom: '20px'}}>Joining lobby...</p>
                <div style={styles.loadingSpinner}></div>
              </>
            ) : (
              <>
                <h2 className="neon-text-blue" style={{margin: '0 0 10px 0'}}>Waiting for {outgoingInvite.friendName} to respond...</h2>
                <p style={{color: '#a0a0a0', marginBottom: '20px'}}>Invitation Status: <strong style={{color: 'var(--cyber-orange)'}}>🟡 Pending</strong></p>
                <button onClick={handleCancelOutgoing} className="cyber-button red">Cancel Invitation</button>
              </>
            )}
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/battle" element={<ProtectedRoute><BattleLobby /></ProtectedRoute>} />
        <Route path="/waiting" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><QuizBattle /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/missions" element={<ProtectedRoute><TeamMissions /></ProtectedRoute>} />
        <Route path="/club" element={<ProtectedRoute><CyberClub /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/lobby/:roomId" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <GameProvider>
          <MainApp />
        </GameProvider>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontSize: '1.8rem',
    color: 'var(--cyber-blue)',
    fontWeight: 'bold',
    fontFamily: 'var(--font-title)',
    textShadow: '0 0 10px rgba(0, 240, 255, 0.4)'
  },
  toastIcon: {
    fontSize: '1.25rem'
  },
  inviteBanner: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    background: 'linear-gradient(135deg, rgba(18, 15, 35, 0.97) 0%, rgba(30, 25, 60, 0.97) 100%)',
    border: '2px solid var(--cyber-orange)',
    borderRadius: '16px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 0 30px rgba(255, 157, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    minWidth: '400px'
  },
  inviteText: {
    color: '#fff',
    fontSize: '1rem',
    flex: 1
  },
  inviteActions: {
    display: 'flex',
    gap: '10px'
  },
  acceptBtn: {
    background: 'var(--cyber-green)',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  declineBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  waitingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000
  },
  waitingModal: {
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: 'var(--cyber-green)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};
