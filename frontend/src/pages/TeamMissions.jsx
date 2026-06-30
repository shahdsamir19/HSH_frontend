import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';
import { Users2, Send, CheckCircle2, Lock, HelpCircle, MapPin, Eye, FileText, ChevronRight } from 'lucide-react';

export default function TeamMissions() {
  const { user } = useContext(AuthContext);
  const {
    activeTeam,
    teamChat,
    teamActivity,
    createTeamMission,
    joinTeamMission,
    toggleTeamReady,
    startTeamMission,
    sendTeamChat,
    completeTeamObjective,
    leaveTeamMission
  } = useContext(GameContext);

  const navigate = useNavigate();
  const [selectedMission, setSelectedMission] = useState('Save Cyber City');
  const [joinCode, setJoinCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  
  // Local states for interactive puzzles
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzleError, setPuzzleError] = useState('');
  const chatEndRef = useRef(null);

  const missionsInfo = {
    'Save Cyber City': {
      desc: 'A cyber attack is targeting the city infrastructure! Crack the hacker code, restore power grid nodes, and secure the mainframe database.',
      clues: ['The phishing email was sent from: h4cker-mail.net', 'The mainframe encryption key is ROT13 of "SECURITY"', 'Database restoration code: 2568']
    },
    'Malware Investigation': {
      desc: 'Inspect device logs, isolate malicious network source IPs, and build a logic firewall rule to vaccinate infected hosts.',
      clues: ['Infected host IP ends with .45', 'Malware signature matches regex pattern /cyber-virus-[0-9]/', 'Antivirus patch version: 9.4.2']
    },
    'Data Rescue Mission': {
      desc: 'Decrypt compromised archives, verify data integrity hashes, and secure administrative accounts using Two-Factor Authentication.',
      clues: ['Backup database archive: archive_backup_v2.db', 'Integrity hash sequence: SHA-256', '2FA code: 890123']
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [teamChat]);

  const handleCreate = () => {
    createTeamMission(selectedMission);
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      joinTeamMission(joinCode);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendTeamChat(chatInput);
      setChatInput('');
    }
  };

  // Solve the active objective puzzle
  const handleSolvePuzzle = () => {
    setPuzzleError('');
    if (!activeTeam) return;

    const currentObjective = activeTeam.objectives.find(o => !o.isCompleted);
    if (!currentObjective) return;

    const answer = puzzleAnswer.trim().toLowerCase();
    let isCorrect = false;
    let clueText = '';

    // Check solutions based on objective id
    if (currentObjective.id === 'city_1') {
      // Decode phishing virus trace clues ( ROT13 of "SECURITY" = "FRPHULWB" or matching domain )
      if (answer === 'h4cker-mail.net' || answer === 'h4cker-mail') {
        isCorrect = true;
        clueText = missionsInfo['Save Cyber City'].clues[0];
      }
    } else if (currentObjective.id === 'city_2') {
      // Bypass firewall key ( ROT13 of "SECURITY" is "frphulwb" )
      if (answer === 'frphulwb' || answer === 'security') {
        isCorrect = true;
        clueText = missionsInfo['Save Cyber City'].clues[1];
      }
    } else if (currentObjective.id === 'city_3') {
      // Decrypt mainframe DB
      if (answer === '2568') {
        isCorrect = true;
        clueText = missionsInfo['Save Cyber City'].clues[2];
      }
    } else if (currentObjective.id === 'mal_1') {
      if (answer === '192.168.1.45' || answer === '45' || answer === '.45') {
        isCorrect = true;
        clueText = missionsInfo['Malware Investigation'].clues[0];
      }
    } else if (currentObjective.id === 'mal_2') {
      if (answer.includes('cyber-virus')) {
        isCorrect = true;
        clueText = missionsInfo['Malware Investigation'].clues[1];
      }
    } else if (currentObjective.id === 'mal_3') {
      if (answer === '9.4.2') {
        isCorrect = true;
        clueText = missionsInfo['Malware Investigation'].clues[2];
      }
    } else if (currentObjective.id === 'rescue_1') {
      if (answer.includes('archive_backup_v2.db') || answer.includes('v2')) {
        isCorrect = true;
        clueText = missionsInfo['Data Rescue Mission'].clues[0];
      }
    } else if (currentObjective.id === 'rescue_2') {
      if (answer === 'sha-256' || answer === 'sha256') {
        isCorrect = true;
        clueText = missionsInfo['Data Rescue Mission'].clues[1];
      }
    } else if (currentObjective.id === 'rescue_3') {
      if (answer === '890123') {
        isCorrect = true;
        clueText = missionsInfo['Data Rescue Mission'].clues[2];
      }
    }

    if (isCorrect) {
      completeTeamObjective(currentObjective.id, clueText);
      setPuzzleAnswer('');
    } else {
      setPuzzleError('Incorrect decryption key! Check instructions or chat with teammates.');
    }
  };

  const renderActivePuzzle = (objectiveId) => {
    switch (objectiveId) {
      // Save Cyber City
      case 'city_1':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 1: Decode Phishing Virus Trace</h5>
            <p style={styles.puzzleDesc}>Scan this suspicious email. What is the sender's domain address? (Hint: check for spelling anomalies in headers!)</p>
            <div style={styles.terminal}>
              <div>From: IT Support &lt;admin@h4cker-mail.net&gt;</div>
              <div>Subject: URGENT Password Expiration!</div>
              <div>Please authenticate immediately by entering credentials.</div>
            </div>
            <input 
              type="text" 
              placeholder="Enter sender domain..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );
      case 'city_2':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 2: Mainframe Firewall Bypass</h5>
            <p style={styles.puzzleDesc}>The firewall shield requires a decryption key. What is the ROT13 cipher of the word "SECURITY"? (A=N, B=O...)</p>
            <div style={styles.terminal}>
              <div>Cipher shift key: +13</div>
              <div>Plaintext: SECURITY</div>
              <div>Ciphertext: ?</div>
            </div>
            <input 
              type="text" 
              placeholder="Enter ciphertext (lowercase)..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );
      case 'city_3':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 3: Mainframe Database Decrypt</h5>
            <p style={styles.puzzleDesc}>Unlock the databases! Solve this simple mathematical security sum to restore grid files: (512 * 4) + 520 = ?</p>
            <input 
              type="text" 
              placeholder="Enter numerical sum answer..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );

      // Malware Investigation
      case 'mal_1':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 1: Find Infection Source IP</h5>
            <p style={styles.puzzleDesc}>We found infection logs! What is the IP address of the node that connects to external servers on Port 6666? (Check clues/chats)</p>
            <div style={styles.terminal}>
              <div>LOG DUMP:</div>
              <div>192.168.1.10 - Connected to router</div>
              <div>192.168.1.45 - Establishing connection to h4cker-mail.net:6666 [SUSPICIOUS]</div>
            </div>
            <input 
              type="text" 
              placeholder="Enter source IP..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );
      case 'mal_2':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 2: Isolate Malware Signature</h5>
            <p style={styles.puzzleDesc}>Match the regex pattern `cyber-virus-[0-9]` against these virus registry names to isolate the target signature:</p>
            <div style={styles.terminal}>
              <div>Available registry keys:</div>
              <div>- anti-malware-shield-v1</div>
              <div>- cyber-virus-9</div>
              <div>- cyber-security-rules</div>
            </div>
            <input 
              type="text" 
              placeholder="Enter matched registry key..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );
      case 'mal_3':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 3: Inject Antivirus Vaccine</h5>
            <p style={styles.puzzleDesc}>What is the exact patch version required to containing the virus? (Ask teammates or check details!)</p>
            <input 
              type="text" 
              placeholder="Enter patch version (e.g. X.Y.Z)..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );

      // Data Rescue Mission
      case 'rescue_1':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 1: Collect Data Backups</h5>
            <p style={styles.puzzleDesc}>Find the name of the corrupted database archive file that needs to be recovered from logs:</p>
            <div style={styles.terminal}>
              <div>LOGS:</div>
              <div>File: archive_backup_v1.db [INTEGRITY OK]</div>
              <div>File: archive_backup_v2.db [CORRUPTED DATA NODE]</div>
            </div>
            <input 
              type="text" 
              placeholder="Enter archive name..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );
      case 'rescue_2':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 2: Restore Hash Integrity Key</h5>
            <p style={styles.puzzleDesc}>What standard secure hash algorithm (length 256 bits) is used to verify file integrity check sums?</p>
            <input 
              type="text" 
              placeholder="Enter algorithm name (e.g. SHA-1, SHA-256)..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );
      case 'rescue_3':
        return (
          <div style={styles.puzzleBox}>
            <h5>Objective 3: Setup 2FA Credentials</h5>
            <p style={styles.puzzleDesc}>Confirm administrative validation code by typing the 2FA sequence found in logs or clues:</p>
            <input 
              type="text" 
              placeholder="Enter 6-digit code..." 
              value={puzzleAnswer} 
              onChange={e => setPuzzleAnswer(e.target.value)}
              className="cyber-input"
            />
          </div>
        );
      default:
        return <div>All objectives complete! Syncing with server...</div>;
    }
  };

  const activeObjective = activeTeam?.objectives.find(o => !o.isCompleted);
  const isLeader = activeTeam?.members.find(m => m.user.toString() === user?.id)?.isLeader;
  const allReady = activeTeam?.members.every(m => m.isReady);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => { leaveTeamMission(); navigate('/'); }} className="cyber-button purple" style={styles.backBtn}>
          ← Quit Mission & Home
        </button>
        <div style={styles.titleArea}>
          <h1 className="neon-text-blue" style={styles.title}>Co-op Team Missions</h1>
          <p style={styles.subtext}>Collaborate in squads to investigate alerts and patch network vectors.</p>
        </div>
      </header>

      {!activeTeam ? (
        // Mode 1: Mission Selection & Joining Lobbies
        <div style={styles.lobbySelectionGrid}>
          {/* Create Team Lobby */}
          <div className="cyber-card" style={styles.lobbyCard}>
            <h3 style={styles.cardTitle}>Create Co-op Squad</h3>
            <div style={styles.selectBox}>
              <label style={styles.label}>Select Cooperative Adventure:</label>
              <select 
                value={selectedMission} 
                onChange={e => setSelectedMission(e.target.value)} 
                style={styles.selectInput}
              >
                <option value="Save Cyber City">Save Cyber City 🏙️</option>
                <option value="Malware Investigation">Malware Investigation 🔬</option>
                <option value="Data Rescue Mission">Data Rescue Mission 💾</option>
              </select>
            </div>
            <p style={styles.missionDesc}>{missionsInfo[selectedMission].desc}</p>
            <button onClick={handleCreate} className="cyber-button orange" style={styles.createBtn}>
              Create Team Lobby 👥
            </button>
          </div>

          {/* Join existing Team Lobby */}
          <div className="cyber-card" style={styles.lobbyCard}>
            <h3 style={styles.cardTitle}>Join Existing Squad</h3>
            <p style={styles.joinDesc}>Enter the room code shared by your classmate or teammate to join their lobby:</p>
            <input 
              type="text" 
              placeholder="Enter Room Code (e.g. TEAM_12345)" 
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className="cyber-input"
              style={{ textTransform: 'uppercase' }}
            />
            <button onClick={handleJoin} className="cyber-button" style={styles.joinBtn}>
              Join Squad Lobby 🔗
            </button>
          </div>
        </div>
      ) : activeTeam.status === 'Lobby' ? (
        // Mode 2: Team Mission Lobby Mode
        <div className="cyber-card" style={styles.lobbyPanel}>
          <h2 className="neon-text-blue">Squad Lobby: {activeTeam.roomCode}</h2>
          <div style={styles.lobbyDescRow}>
            <span>Mission: <b>{activeTeam.missionName}</b></span>
            <span>Status: <b style={{ color: 'var(--cyber-orange)' }}>Awaiting Ready Check</b></span>
          </div>

          <div style={styles.lobbyGrid}>
            {/* Members details */}
            <div style={styles.lobbyMembers}>
              <h4>Members in Room ({activeTeam.members.length})</h4>
              <div style={styles.membersList}>
                {activeTeam.members.map(m => (
                  <div key={m.user} style={styles.memberItem}>
                    <div style={styles.memberInfo}>
                      <span style={styles.memberAvatar}>👤</span>
                      <span>{m.username} {m.isLeader && '👑'}</span>
                    </div>
                    <span style={{
                      ...styles.memberStatusText,
                      color: m.isReady ? 'var(--cyber-green)' : 'var(--cyber-orange)'
                    }}>
                      {m.isReady ? '✓ Ready' : '⚡ Thinking...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lobby actions */}
            <div style={styles.lobbyActions}>
              <h4>Ready Status</h4>
              <button 
                onClick={toggleTeamReady} 
                className={`cyber-button ${activeTeam.members.find(m => m.user.toString() === user?.id)?.isReady ? 'purple' : 'orange'}`}
                style={styles.lobbyActionBtn}
              >
                {activeTeam.members.find(m => m.user.toString() === user?.id)?.isReady ? 'Set Unready ❌' : 'I am Ready! ✓'}
              </button>

              {isLeader && (
                <button 
                  onClick={startTeamMission} 
                  disabled={!allReady}
                  className="cyber-button"
                  style={{ ...styles.lobbyActionBtn, gridColumn: 'span 2' }}
                >
                  Start Mission 🚀
                </button>
              )}

              <p style={styles.readinessAlert}>
                {allReady ? 'All agents ready! Leader can deploy.' : 'Waiting for all agents to toggle ready status.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Mode 3: Active Co-op Mission Interface
        <div style={styles.missionActiveGrid}>
          
          {/* Left panel: Maps and objectives */}
          <div style={styles.leftPanel}>
            <div className="cyber-card" style={styles.mapCard}>
              <h4 style={styles.panelHeader}><MapPin size={16} /> Mission Map & Objectives</h4>
              
              <div style={styles.objectivesList}>
                {activeTeam.objectives.map((o, idx) => (
                  <div key={o.id} style={{
                    ...styles.objectiveItem,
                    opacity: o.isCompleted || (idx === activeTeam.objectives.findIndex(obj => !obj.isCompleted)) ? 1 : 0.4
                  }}>
                    <span style={styles.objectiveIndex}>#{idx + 1}</span>
                    <span style={styles.objectiveTitle}>{o.title}</span>
                    {o.isCompleted ? (
                      <CheckCircle2 size={18} color="var(--cyber-green)" />
                    ) : idx === activeTeam.objectives.findIndex(obj => !obj.isCompleted) ? (
                      <span style={styles.activeLabel}>ACTIVE</span>
                    ) : (
                      <Lock size={16} color="#8c87a5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="cyber-card" style={styles.cluesCard}>
              <h4 style={styles.panelHeader}><Eye size={16} /> Discovered Clues</h4>
              <div style={styles.cluesList}>
                {activeTeam.clues.length === 0 ? (
                  <div style={styles.emptyClues}>Solve puzzles to unlock clues.</div>
                ) : (
                  activeTeam.clues.map((c, idx) => (
                    <div key={idx} style={styles.clueRow}>
                      <span style={styles.clueIcon}>🔍</span>
                      <span>{c}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Center: Puzzle Interface */}
          <div className="cyber-card" style={styles.centerPanel}>
            <div style={styles.topInfoBar}>
              <span>Progress: <b className="neon-text-blue">{activeTeam.progress}%</b></span>
              <span>Score: <b className="neon-text-orange">{activeTeam.score} pts</b></span>
            </div>

            <div style={styles.progressBarContainer}>
              <div style={{ ...styles.progressBar, width: `${activeTeam.progress}%` }}></div>
            </div>

            {activeObjective ? (
              <div style={styles.puzzleArea}>
                {renderActivePuzzle(activeObjective.id)}

                {puzzleError && <div style={styles.errorText}>{puzzleError}</div>}

                <button onClick={handleSolvePuzzle} className="cyber-button orange" style={styles.solveBtn}>
                  Verify Decryption Key 🔍
                </button>
              </div>
            ) : (
              <div style={styles.winBox}>
                <span style={{ fontSize: '4rem' }}>🏆</span>
                <h3>MISSION SUCCESSFUL!</h3>
                <p>Awesome coordination! You prevented the attack and secured the net.</p>
              </div>
            )}
          </div>

          {/* Right Panel: Chat and Feed */}
          <div className="cyber-card" style={styles.rightPanel}>
            <h4 style={styles.panelHeader}><Send size={16} /> Squad Comms</h4>
            
            <div style={styles.chatScroller}>
              {teamChat.map((c, idx) => (
                <div key={idx} style={styles.chatBubble}>
                  <span style={styles.chatUser}>{c.username}:</span>
                  <span style={styles.chatMessage}>{c.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} style={styles.chatForm}>
              <input 
                type="text" 
                placeholder="Message your squad..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                style={styles.chatInput}
              />
              <button type="submit" style={styles.chatSendBtn}>
                <Send size={16} />
              </button>
            </form>

            <div style={styles.activityFeed}>
              <h5 style={styles.feedTitle}>Activity Logs</h5>
              <div style={styles.feedList}>
                {teamActivity.map((a, idx) => (
                  <div key={idx} style={styles.feedItem}>
                    • {a.message}
                  </div>
                ))}
              </div>
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
    gap: '24px'
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
  lobbySelectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px',
    alignItems: 'start'
  },
  lobbyCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  cardTitle: {
    fontSize: '1.4rem',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px'
  },
  selectBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#8c87a5'
  },
  selectInput: {
    background: 'rgba(10, 8, 25, 0.8)',
    border: '2px solid var(--glass-border)',
    color: '#fff',
    padding: '12px',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '1rem',
    fontFamily: 'var(--font-body)'
  },
  missionDesc: {
    color: '#a4a0be',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    minHeight: '60px'
  },
  createBtn: {
    width: '100%',
    padding: '14px'
  },
  joinDesc: {
    color: '#a4a0be',
    fontSize: '0.95rem'
  },
  joinBtn: {
    width: '100%',
    padding: '14px'
  },
  lobbyPanel: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  lobbyDescRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    background: 'rgba(0,0,0,0.2)',
    padding: '12px 20px',
    borderRadius: '12px'
  },
  lobbyGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '30px',
    marginTop: '10px'
  },
  lobbyMembers: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  memberItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 18px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '12px',
    alignItems: 'center'
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 'bold',
    color: '#fff'
  },
  memberAvatar: {
    fontSize: '1.2rem'
  },
  memberStatusText: {
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  lobbyActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  lobbyActionBtn: {
    width: '100%',
    padding: '14px'
  },
  readinessAlert: {
    fontSize: '0.8rem',
    color: '#8c87a5',
    textAlign: 'center',
    marginTop: '10px'
  },
  missionActiveGrid: {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.4fr 0.8fr',
    gap: '24px',
    alignItems: 'start'
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  panelHeader: {
    fontSize: '1.1rem',
    color: '#fff',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px'
  },
  mapCard: {
    padding: '20px'
  },
  objectivesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  objectiveItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(0,0,0,0.15)',
    padding: '10px 14px',
    borderRadius: '12px',
    gap: '8px'
  },
  objectiveIndex: {
    fontFamily: 'var(--font-title)',
    fontWeight: 'bold',
    color: 'var(--cyber-blue)',
    fontSize: '0.95rem'
  },
  objectiveTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    flex: 1
  },
  activeLabel: {
    background: 'rgba(255, 157, 0, 0.1)',
    color: 'var(--cyber-orange)',
    border: '1px solid var(--cyber-orange)',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '6px'
  },
  cluesCard: {
    padding: '20px'
  },
  cluesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  emptyClues: {
    color: '#8c87a5',
    textAlign: 'center',
    fontSize: '0.85rem',
    padding: '12px 0'
  },
  clueRow: {
    display: 'flex',
    gap: '8px',
    background: 'rgba(57, 255, 20, 0.05)',
    border: '1px solid rgba(57, 255, 20, 0.1)',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: '#fff'
  },
  clueIcon: {
    fontSize: '1rem'
  },
  centerPanel: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  topInfoBar: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },
  progressBarContainer: {
    height: '10px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--cyber-blue) 0%, var(--cyber-green) 100%)',
    borderRadius: '5px'
  },
  puzzleArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '10px'
  },
  puzzleBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  puzzleDesc: {
    color: '#a4a0be',
    fontSize: '0.95rem',
    lineHeight: '1.4'
  },
  terminal: {
    background: '#0a0814',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '16px',
    fontFamily: 'monospace',
    color: 'var(--cyber-green)',
    fontSize: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  solveBtn: {
    width: '100%',
    padding: '14px'
  },
  errorText: {
    color: 'var(--cyber-red)',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  winBox: {
    textAlign: 'center',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px'
  },
  rightPanel: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '520px'
  },
  chatScroller: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '6px',
    marginBottom: '10px'
  },
  chatBubble: {
    background: 'rgba(255,255,255,0.03)',
    padding: '8px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    lineHeight: '1.3'
  },
  chatUser: {
    fontWeight: 'bold',
    color: 'var(--cyber-blue)',
    marginRight: '6px'
  },
  chatMessage: {
    color: '#f5f5fa'
  },
  chatForm: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  chatInput: {
    flex: 1,
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--glass-border)',
    color: '#fff',
    borderRadius: '10px',
    padding: '8px 12px',
    outline: 'none',
    fontSize: '0.85rem'
  },
  chatSendBtn: {
    background: 'var(--cyber-purple)',
    border: 'none',
    color: '#fff',
    borderRadius: '10px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  activityFeed: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '10px',
    maxHeight: '130px',
    overflowY: 'auto'
  },
  feedTitle: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#8c87a5',
    marginBottom: '6px'
  },
  feedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  feedItem: {
    fontSize: '0.7rem',
    color: 'var(--cyber-orange)'
  }
};
