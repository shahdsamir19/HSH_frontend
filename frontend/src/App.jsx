import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={styles.loading}>Booting Security Systems...</div>;
  if (!user) return <Auth />;
  return children;
};

const MainApp = () => {
  const { toasts } = useContext(GameContext);
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

      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/battle" element={<ProtectedRoute><BattleLobby /></ProtectedRoute>} />
        <Route path="/waiting" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><QuizBattle /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/missions" element={<ProtectedRoute><TeamMissions /></ProtectedRoute>} />
        <Route path="/club" element={<ProtectedRoute><CyberClub /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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
  }
};
