import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Auth() {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!username) {
          throw new Error('Username is required');
        }
        await register(username, email, password);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.stars}></div>
      <div className="cyber-card" style={styles.card}>
        <h1 style={styles.title}>🔒 CYBER ARENA</h1>
        <p style={styles.subtitle}>Test your security skills against players worldwide!</p>

        <div style={styles.tabContainer}>
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              ...styles.tab,
              color: isLogin ? 'var(--cyber-blue)' : '#77728a',
              borderBottom: isLogin ? '3px solid var(--cyber-blue)' : '3px solid transparent'
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              ...styles.tab,
              color: !isLogin ? 'var(--cyber-blue)' : '#77728a',
              borderBottom: !isLogin ? '3px solid var(--cyber-blue)' : '3px solid transparent'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>USERNAME</label>
              <input
                type="text"
                placeholder="CyberHero"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="cyber-input"
                required
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="you@cyberkids.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cyber-input"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input"
              required
            />
          </div>

          <button
            type="submit"
            className="cyber-button orange"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Booting...' : isLogin ? 'Enter Arena 🚀' : 'Create Champion ⚡'}
          </button>
        </form>

        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>💡</span>
          <p style={styles.infoText}>Seeded users email passwords are: <b>password123</b>. (e.g. ahmed@cyberarena.com, mariam@cyberarena.com)</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative'
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  title: {
    fontSize: '2.5rem',
    color: '#fff',
    textShadow: '0 0 10px rgba(189, 0, 255, 0.4)',
    margin: 0
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#a09bbd',
    margin: '0 0 10px 0'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '10px'
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'none',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'var(--font-title)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: 'var(--cyber-blue)',
    letterSpacing: '1px'
  },
  submitBtn: {
    marginTop: '10px',
    width: '100%',
    padding: '16px'
  },
  error: {
    background: 'rgba(255, 56, 56, 0.15)',
    border: '1.5px solid var(--cyber-red)',
    color: '#ff8888',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textAlign: 'center'
  },
  infoBox: {
    display: 'flex',
    gap: '10px',
    background: 'rgba(0, 240, 255, 0.08)',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    padding: '12px',
    borderRadius: '12px',
    alignItems: 'center',
    textAlign: 'left',
    marginTop: '10px'
  },
  infoIcon: {
    fontSize: '1.4rem'
  },
  infoText: {
    fontSize: '0.82rem',
    color: '#b0f1ff',
    margin: 0,
    lineHeight: '1.3'
  }
};
