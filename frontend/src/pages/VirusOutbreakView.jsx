import React from 'react';
import { Shield, ShieldAlert, Zap, AlertTriangle, Play } from 'lucide-react';

export default function VirusOutbreakView({ activeGame, requestCleanZone, submitCleanZone, user }) {
  
  const handleZoneClick = (zoneIndex) => {
    // Only request if zone is infected (or not cleaned)
    const zone = activeGame.grid?.[zoneIndex];
    if (zone && zone.status === 'infected') {
      requestCleanZone(zoneIndex);
    }
  };

  const getZoneStyle = (zone) => {
    let style = { ...styles.zoneCard };
    if (!zone) return style;

    if (zone.status === 'infected') {
      style.backgroundColor = 'rgba(255, 56, 56, 0.1)';
      style.borderColor = 'var(--cyber-red)';
      style.boxShadow = 'inset 0 0 10px rgba(255, 56, 56, 0.2)';
    } else {
      // Cleaned
      const isMine = zone.owner === user?.id;
      if (isMine) {
        style.backgroundColor = 'rgba(0, 240, 255, 0.15)';
        style.borderColor = 'var(--cyber-blue)';
        style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.3)';
      } else {
        style.backgroundColor = 'rgba(180, 0, 255, 0.15)';
        style.borderColor = 'var(--cyber-purple)';
        style.boxShadow = '0 0 12px rgba(180, 0, 255, 0.3)';
      }
    }
    return style;
  };

  const getZoneLabel = (zone) => {
    if (!zone) return '';
    if (zone.status === 'infected') return '🔴 INFECTED';
    const isMine = zone.owner === user?.id;
    return isMine ? '🔵 CLEANED (ME)' : '🟣 CLEANED (THEM)';
  };

  const activeChallenge = activeGame.activeChallenge;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.badge}>🦠 VIRUS OUTBREAK CONTAINMENT</div>
        <h2 style={styles.title}>Decontaminate infected zones! Timer: <b style={{ color: 'var(--cyber-orange)' }}>{activeGame.secondsRemaining}s</b></h2>
      </div>

      <div style={styles.layoutGrid}>
        {/* Outbreak Map Grid (Left) */}
        <div style={styles.mapContainer}>
          <h3 style={styles.panelTitle}>🗺️ NETWORK INFESTATION MAP</h3>
          <div style={styles.gridMap}>
            {activeGame.grid?.map((zone, idx) => (
              <button
                key={idx}
                onClick={() => handleZoneClick(idx)}
                disabled={zone?.status === 'cleaned' || !!activeChallenge}
                style={getZoneStyle(zone)}
              >
                <span style={styles.zoneIndex}>GRID UNIT #{idx + 1}</span>
                <span style={styles.zoneStatus}>{getZoneLabel(zone)}</span>
                {zone?.status === 'infected' && !activeChallenge && (
                  <span style={styles.cleanPrompt}>Click to Purge ⚡</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge decontamination panel (Right) */}
        <div style={styles.sidePanel}>
          <h3 style={styles.panelTitle}>🛡️ CONTAINER INTERCEPTOR</h3>
          {activeChallenge ? (
            <div style={styles.challengeBox} className="pulse-border">
              <div style={styles.challengeHeader}>
                <AlertTriangle size={18} style={{ color: 'var(--cyber-red)' }} />
                <span>UNIT #{activeChallenge.zoneIndex + 1} INCIDENT TASK</span>
              </div>
              <div style={styles.challengeBody}>
                <p style={styles.challengeText}>{activeChallenge.questionText}</p>
                <div style={styles.optionsList}>
                  {activeChallenge.options && Object.entries(activeChallenge.options).map(([key, val]) => (
                    val && (
                      <button
                        key={key}
                        onClick={() => submitCleanZone(activeChallenge.zoneIndex, key)}
                        style={styles.optionBtn}
                        className="cyber-button"
                      >
                        <span style={styles.optionLetter}>{key}</span>
                        <span>{val}</span>
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyPanel}>
              <Shield size={44} style={{ color: 'rgba(255,255,255,0.08)' }} />
              <p>Select any <b style={{ color: 'var(--cyber-red)' }}>🔴 INFECTED</b> grid unit on the map to deploy patches and disinfect the node.</p>
            </div>
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
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  badge: {
    background: 'linear-gradient(135deg, var(--cyber-red) 0%, #d50000 100%)',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    width: 'fit-content',
    boxShadow: '0 0 10px rgba(255, 56, 56, 0.3)'
  },
  title: {
    fontSize: '1.5rem',
    color: '#fff',
    margin: 0
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
    '@media(maxWidth: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  mapContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  panelTitle: {
    fontSize: '0.95rem',
    color: '#8c87a5',
    fontWeight: 'bold',
    letterSpacing: '1px',
    margin: 0
  },
  gridMap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    aspectRatio: '1',
    backgroundColor: '#0a0813',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '16px'
  },
  zoneCard: {
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '10px',
    outline: 'none',
    color: '#fff',
    ':hover': {
      transform: 'scale(1.02)'
    }
  },
  zoneIndex: {
    fontSize: '0.75rem',
    color: '#8c87a5',
    fontWeight: '600'
  },
  zoneStatus: {
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  cleanPrompt: {
    fontSize: '0.75rem',
    color: 'var(--cyber-orange)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: '4px'
  },
  sidePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  challengeBox: {
    backgroundColor: '#120f22',
    border: '1px solid var(--cyber-red)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  challengeHeader: {
    backgroundColor: 'rgba(255, 56, 56, 0.08)',
    padding: '12px 18px',
    borderBottom: '1px solid rgba(255, 56, 56, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--cyber-red)',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  challengeBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  challengeText: {
    color: '#fff',
    fontSize: '1.1rem',
    lineHeight: '1.5',
    margin: 0
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  optionBtn: {
    width: '100%',
    textAlign: 'left',
    padding: '14px 18px',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'flex-start'
  },
  optionLetter: {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--cyber-blue)',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  emptyPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#120f22',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    color: '#8c87a5',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    gap: '16px'
  }
};


