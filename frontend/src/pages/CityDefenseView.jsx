import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';

export default function CityDefenseView({ activeGame, defendAction, opponent }) {
  const [choice, setChoice] = useState(null);

  useEffect(() => {
    // Reset selection when packet changes
    setChoice(null);
  }, [activeGame.packetText]);

  const handleAction = (act) => {
    if (activeGame.answered) return;
    setChoice(act);
    defendAction(act);
  };

  const getShieldColor = (hp) => {
    if (hp > 50) return 'var(--cyber-blue)';
    if (hp > 20) return 'var(--cyber-orange)';
    return 'var(--cyber-red)';
  };

  return (
    <div style={styles.container}>
      {/* City Shield Status */}
      <div style={styles.dashboard}>
        <div style={styles.playerShieldBox}>
          <div style={styles.shieldHeader}>
            <Shield size={20} style={{ color: getShieldColor(activeGame.myShield) }} />
            <span style={styles.shieldTitle}>My City Gate Shield</span>
            <span style={styles.shieldValue}>{activeGame.myShield || 0} HP</span>
          </div>
          <div style={styles.shieldBarBg}>
            <div style={{
              ...styles.shieldBarFill,
              width: `${activeGame.myShield || 0}%`,
              backgroundColor: getShieldColor(activeGame.myShield),
              boxShadow: `0 0 10px ${getShieldColor(activeGame.myShield)}`
            }}></div>
          </div>
        </div>

        <div style={styles.playerShieldBox}>
          <div style={styles.shieldHeader}>
            <ShieldAlert size={20} style={{ color: getShieldColor(activeGame.opponentShield) }} />
            <span style={styles.shieldTitle}>{opponent?.username || 'Opponent'}'s Gate Shield</span>
            <span style={styles.shieldValue}>{activeGame.opponentShield || 0} HP</span>
          </div>
          <div style={styles.shieldBarBg}>
            <div style={{
              ...styles.shieldBarFill,
              width: `${activeGame.opponentShield || 0}%`,
              backgroundColor: getShieldColor(activeGame.opponentShield),
              boxShadow: `0 0 10px ${getShieldColor(activeGame.opponentShield)}`
            }}></div>
          </div>
        </div>
      </div>

      {/* Packet Wave Container */}
      <div style={styles.radarCard} className="cyber-card">
        <div style={styles.radarHeader}>
          <span className="blink" style={styles.radarAlertText}>🚨 INCOMING SCAN WAVE #{activeGame.waveIndex || 1} / 8</span>
          <span style={styles.radarTimer}>Auto-impact in: <b style={{ color: 'var(--cyber-orange)' }}>{activeGame.secondsRemaining}s</b></span>
        </div>

        <div style={styles.radarScope}>
          <div style={styles.packetFrame}>
            <div style={styles.packetLabel}>DATA PACKET OVERVIEW</div>
            <p style={styles.packetText}>{activeGame.packetText || 'Detecting incoming traffic...'}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={styles.controlsRow}>
          <button
            onClick={() => handleAction('ALLOW')}
            disabled={activeGame.answered}
            style={{
              ...styles.controlBtn,
              borderColor: 'var(--cyber-green)',
              background: choice === 'ALLOW' ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.03)'
            }}
          >
            <Check size={20} style={{ color: 'var(--cyber-green)' }} />
            <span style={{ color: 'var(--cyber-green)' }}>ALLOW PACKET</span>
          </button>

          <button
            onClick={() => handleAction('BLOCK')}
            disabled={activeGame.answered}
            style={{
              ...styles.controlBtn,
              borderColor: 'var(--cyber-red)',
              background: choice === 'BLOCK' ? 'rgba(255, 56, 56, 0.15)' : 'rgba(255, 56, 56, 0.03)'
            }}
          >
            <X size={20} style={{ color: 'var(--cyber-red)' }} />
            <span style={{ color: 'var(--cyber-red)' }}>BLOCK PACKET</span>
          </button>
        </div>

        {activeGame.answered && (
          <div style={styles.decisionStatus}>
            <span>Decision submitted. Patching security shield...</span>
          </div>
        )}
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
  dashboard: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    '@media(maxWidth: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  playerShieldBox: {
    backgroundColor: '#120f22',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '18px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  shieldHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  shieldTitle: {
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 'bold'
  },
  shieldValue: {
    marginLeft: 'auto',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#fff'
  },
  shieldBarBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: '14px',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  shieldBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.4s ease'
  },
  radarCard: {
    backgroundColor: '#0a0813',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  radarHeader: {
    backgroundColor: '#120f22',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  radarAlertText: {
    color: 'var(--cyber-orange)',
    letterSpacing: '1px'
  },
  radarTimer: {
    color: '#8c87a5'
  },
  radarScope: {
    padding: '36px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.03) 0%, rgba(0,0,0,0) 70%)'
  },
  packetFrame: {
    border: '1px solid rgba(0, 240, 255, 0.25)',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 8, 16, 0.8)',
    padding: '24px 30px',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
    boxShadow: '0 0 25px rgba(0, 240, 255, 0.1)'
  },
  packetLabel: {
    fontSize: '0.75rem',
    color: 'var(--cyber-blue)',
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: '12px'
  },
  packetText: {
    color: '#fff',
    fontSize: '1.2rem',
    lineHeight: '1.5',
    margin: 0
  },
  controlsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    padding: '0 24px 24px 24px'
  },
  controlBtn: {
    border: '1px solid',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    outline: 'none',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  decisionStatus: {
    padding: '12px',
    textAlign: 'center',
    color: '#8c87a5',
    fontSize: '0.9rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderTop: '1px solid rgba(255,255,255,0.03)'
  }
};
