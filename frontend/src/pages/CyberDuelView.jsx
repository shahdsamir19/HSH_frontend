import React from 'react';
import { Heart, Shield, Zap, Sparkles, Flame } from 'lucide-react';

export default function CyberDuelView({ activeGame, submitDuelAnswer, activatePowerup, opponent }) {
  
  const handleAnswer = (ans) => {
    if (activeGame.answered) return;
    submitDuelAnswer(ans);
  };

  const getPowerupLabel = (p) => {
    switch(p) {
      case 'firewall-shield': return '🛡️ Firewall Shield';
      case 'system-patch': return '❤️ System Patch (+25 HP)';
      case 'cyber-blast': return '💥 Cyber Blast (-20 Enemy HP)';
      default: return p;
    }
  };

  return (
    <div style={styles.container}>
      {/* HP status bars duel */}
      <div style={styles.duelArena}>
        {/* Player HP */}
        <div style={styles.fighterBox}>
          <div style={styles.fighterHeader}>
            <span style={styles.fighterName}>My Node HP</span>
            <span style={styles.hpText}>{activeGame.myHp || 0} HP</span>
          </div>
          <div style={styles.hpBarBg}>
            <div style={{
              ...styles.hpBarFill,
              width: `${activeGame.myHp || 0}%`,
              background: 'linear-gradient(90deg, #ff0077 0%, var(--cyber-red) 100%)',
              boxShadow: '0 0 12px var(--cyber-red)'
            }}></div>
          </div>
          <div style={styles.statsRow}>
            {activeGame.myCombo > 0 && (
              <span style={styles.comboBadge} className="pulse">
                <Flame size={14} /> Streak: x{activeGame.myCombo}
              </span>
            )}
            {activeGame.myShieldActive && (
              <span style={styles.shieldBadge}>
                🛡️ SHIELD DEPLOYED
              </span>
            )}
          </div>
        </div>

        <div style={styles.vsCircle}>VS</div>

        {/* Opponent HP */}
        <div style={styles.fighterBox}>
          <div style={styles.fighterHeader}>
            <span style={styles.fighterName}>{opponent?.username || 'Opponent'} HP</span>
            <span style={styles.hpText}>{activeGame.opponentHp || 0} HP</span>
          </div>
          <div style={styles.hpBarBg}>
            <div style={{
              ...styles.hpBarFill,
              width: `${activeGame.opponentHp || 0}%`,
              background: 'linear-gradient(90deg, var(--cyber-orange) 0%, #ff5500 100%)',
              boxShadow: '0 0 12px var(--cyber-orange)'
            }}></div>
          </div>
          <div style={styles.statsRow}>
            {activeGame.opponentCombo > 0 && (
              <span style={{ ...styles.comboBadge, background: 'rgba(255, 157, 0, 0.15)', borderColor: 'var(--cyber-orange)' }}>
                <Flame size={14} /> Streak: x{activeGame.opponentCombo}
              </span>
            )}
            {activeGame.opponentShieldActive && (
              <span style={{ ...styles.shieldBadge, borderColor: 'var(--cyber-orange)' }}>
                🛡️ SHIELD DEPLOYED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cyber Duel Question Panel */}
      <div style={styles.duelCard} className="cyber-card">
        <div style={styles.cardHeader}>
          <Sparkles size={18} style={{ color: 'var(--cyber-blue)' }} />
          <span>REAL-TIME DECRYPTION STRIKE</span>
          <span style={styles.timer}>Time left: {activeGame.secondsRemaining}s</span>
        </div>

        <div style={styles.questionSection}>
          <h2 style={styles.questionText}>{activeGame.questionText}</h2>

          <div style={styles.answersRow}>
            <button
              onClick={() => handleAnswer('TRUE')}
              disabled={activeGame.answered}
              style={{ ...styles.answerBtn, borderColor: 'var(--cyber-green)' }}
              className="cyber-button"
            >
              TRUE 👍
            </button>

            <button
              onClick={() => handleAnswer('FALSE')}
              disabled={activeGame.answered}
              style={{ ...styles.answerBtn, borderColor: 'var(--cyber-red)' }}
              className="cyber-button"
            >
              FALSE 👎
            </button>
          </div>
        </div>
      </div>

      {/* Power-up Inventory Grid */}
      <div style={styles.inventoryCard} className="cyber-card">
        <h3 style={styles.inventoryTitle}>🎒 DEPLOYABLE CYBER POWER-UPS</h3>
        <div style={styles.powerupsGrid}>
          {activeGame.myPowerups?.length > 0 ? (
            activeGame.myPowerups.map((p, idx) => (
              <button
                key={idx}
                onClick={() => activatePowerup(p)}
                style={styles.powerupBtn}
                className="cyber-button orange"
              >
                <span>{getPowerupLabel(p)}</span>
              </button>
            ))
          ) : (
            <div style={styles.emptyInventory}>
              <span>Answer questions correctly for a chance to intercept power-up drops! 📦</span>
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
  duelArena: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '20px',
    alignItems: 'center',
    '@media(maxWidth: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  fighterBox: {
    backgroundColor: '#120f22',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  fighterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  fighterName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.05rem'
  },
  hpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.15rem'
  },
  hpBarBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: '16px',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  hpBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s ease-in-out'
  },
  statsRow: {
    display: 'flex',
    gap: '10px',
    minHeight: '22px'
  },
  comboBadge: {
    background: 'rgba(255, 56, 56, 0.15)',
    border: '1px solid var(--cyber-red)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  shieldBadge: {
    background: 'rgba(0, 240, 255, 0.1)',
    border: '1px solid var(--cyber-blue)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  vsCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#0a0813',
    border: '2px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    margin: '0 auto'
  },
  duelCard: {
    backgroundColor: '#0a0813',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  cardHeader: {
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
  questionSection: {
    padding: '36px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    textAlign: 'center'
  },
  questionText: {
    color: '#fff',
    fontSize: '1.45rem',
    margin: 0,
    fontWeight: '500',
    lineHeight: '1.5',
    maxWidth: '700px'
  },
  answersRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    width: '100%',
    maxWidth: '500px'
  },
  answerBtn: {
    padding: '16px',
    fontSize: '1.1rem',
    borderRadius: '10px',
    border: '1px solid',
    cursor: 'pointer'
  },
  inventoryCard: {
    backgroundColor: '#120f22',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px 24px'
  },
  inventoryTitle: {
    fontSize: '0.95rem',
    color: '#8c87a5',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
    letterSpacing: '1px'
  },
  powerupsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px'
  },
  powerupBtn: {
    padding: '12px',
    fontSize: '0.9rem',
    borderRadius: '8px'
  },
  emptyInventory: {
    color: '#8c87a5',
    fontSize: '0.9rem',
    padding: '10px 0',
    gridColumn: '1 / -1'
  }
};
