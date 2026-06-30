import React, { useState, useEffect } from 'react';
import { Key, Lock, Unlock, HelpCircle, Trophy } from 'lucide-react';

export default function CaptureTheFlagView({ activeGame, submitCtfFlag, opponent }) {
  const [flagInput, setFlagInput] = useState('');

  useEffect(() => {
    // Reset input on new question/challenge
    setFlagInput('');
  }, [activeGame.questionText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (flagInput.trim() && !activeGame.answered) {
      submitCtfFlag(flagInput.trim());
    }
  };

  const renderKeys = (count) => {
    const keys = [];
    for (let i = 0; i < 5; i++) {
      if (i < count) {
        keys.push(<Key key={i} size={28} style={{ color: 'var(--cyber-orange)', filter: 'drop-shadow(0 0 5px rgba(255,157,0,0.6))' }} />);
      } else {
        keys.push(<Key key={i} size={28} style={{ color: 'rgba(255,255,255,0.1)' }} />);
      }
    }
    return keys;
  };

  const isGolden = activeGame.questionIndex === 3; // 3rd round is golden key round!

  return (
    <div style={styles.container}>
      {/* Vault Status Panel */}
      <div style={styles.vaultPanel} className="cyber-card">
        <div style={styles.vaultHeader}>
          {activeGame.myFragments >= 5 || activeGame.opponentFragments >= 5 ? (
            <Unlock size={44} style={{ color: 'var(--cyber-green)' }} className="pulse" />
          ) : (
            <Lock size={44} style={{ color: 'var(--cyber-orange)' }} />
          )}
          <div>
            <h2 style={styles.vaultTitle}>Secure Vault: {activeGame.vaultName || 'Alpha Node'}</h2>
            <p style={styles.vaultSubtitle}>Solve encryption keys to forge the final security overrides!</p>
          </div>
        </div>

        <div style={styles.scoresRow}>
          <div style={styles.scoreBox}>
            <span style={styles.playerLabel}>My Fragments</span>
            <div style={styles.keysList}>
              {renderKeys(activeGame.myFragments || 0)}
            </div>
            <span style={styles.fractionText}>{activeGame.myFragments || 0} / 5 fragments</span>
          </div>

          <div style={styles.vsBox}>VS</div>

          <div style={styles.scoreBox}>
            <span style={styles.playerLabel}>{opponent?.username || 'Opponent'}'s Fragments</span>
            <div style={styles.keysList}>
              {renderKeys(activeGame.opponentFragments || 0)}
            </div>
            <span style={styles.fractionText}>{activeGame.opponentFragments || 0} / 5 fragments</span>
          </div>
        </div>
      </div>

      {/* Current Challenge */}
      <div style={styles.challengeBox} className="cyber-card">
        <div style={styles.challengeHeader}>
          <HelpCircle size={18} style={{ color: 'var(--cyber-blue)' }} />
          <span>CHALLENGE #{activeGame.questionIndex} {isGolden && <b style={{ color: 'var(--cyber-orange)' }}>🌟 GOLDEN FRAGMENT WAVE (2 PTS)</b>}</span>
          <span style={styles.timer}>{activeGame.secondsRemaining}s remaining</span>
        </div>

        <div style={styles.challengeBody}>
          <h3 style={styles.challengeText}>{activeGame.questionText}</h3>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder={activeGame.answered ? "Verifying submission..." : "Enter decryption flag string..."}
              value={flagInput}
              onChange={(e) => setFlagInput(e.target.value)}
              disabled={activeGame.answered}
              style={styles.flagInput}
              className="cyber-input"
            />
            <button
              type="submit"
              disabled={activeGame.answered || !flagInput.trim()}
              style={{
                ...styles.submitBtn,
                background: isGolden ? 'linear-gradient(135deg, var(--cyber-orange) 0%, #ff5500 100%)' : 'linear-gradient(135deg, var(--cyber-blue) 0%, #0077ff 100%)'
              }}
              className="cyber-button"
            >
              Inject Code 🛰️
            </button>
          </form>

          {activeGame.answered && (
            <p style={styles.pendingText}>Flag submitted! Validating security signature...</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%'
  },
  vaultPanel: {
    padding: '24px',
    background: '#120f22',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  vaultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  vaultTitle: {
    fontSize: '1.6rem',
    color: '#fff',
    margin: 0
  },
  vaultSubtitle: {
    color: '#8c87a5',
    margin: '4px 0 0 0',
    fontSize: '0.95rem'
  },
  scoresRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '30px',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px'
  },
  scoreBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  playerLabel: {
    color: '#8c87a5',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  keysList: {
    display: 'flex',
    gap: '6px'
  },
  fractionText: {
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  vsBox: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },
  challengeBox: {
    background: '#0a0813',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  challengeHeader: {
    backgroundColor: '#120f22',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--cyber-blue)',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  timer: {
    marginLeft: 'auto',
    color: 'var(--cyber-orange)'
  },
  challengeBody: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
    textAlign: 'center'
  },
  challengeText: {
    color: '#fff',
    fontSize: '1.4rem',
    margin: 0,
    fontWeight: '500',
    lineHeight: '1.5',
    maxWidth: '700px'
  },
  form: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '550px',
    marginTop: '10px'
  },
  flagInput: {
    flex: 1,
    padding: '14px 18px',
    fontSize: '1rem',
    borderRadius: '8px'
  },
  submitBtn: {
    padding: '0 24px',
    fontSize: '0.95rem',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    color: '#fff',
    fontWeight: 'bold'
  },
  pendingText: {
    color: '#8c87a5',
    fontSize: '0.9rem',
    margin: 0
  }
};
