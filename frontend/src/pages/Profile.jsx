import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';
import { Award, Users, Plus, Shield, Check, X } from 'lucide-react';

export default function Profile() {
  const { user, updateUserStats } = useContext(AuthContext);
  const { addToast } = useContext(GameContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendUsername, setFriendUsername] = useState('');
  const [friends, setFriends] = useState([]);
  const [allBadges, setAllBadges] = useState([]);

  // Avatar choices
  const avatars = ['🛡️', '🤖', '🐱', '🦊', '🐼', '🦁', '🕵️', '🦖', '🦄', '👑'];

  useEffect(() => {
    fetchProfile();
    fetchFriends();
    fetchBadgesList();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/profile/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const fetchBadgesList = async () => {
    // Seed initial list of all possible badges in UI
    setAllBadges([
      { name: "Password Master", icon: "🔑", description: "Create strong passwords and score highly in trivia." },
      { name: "Phishing Hunter", icon: "🎣", description: "Identify phishing attempts and win your first battle." },
      { name: "Firewall Defender", icon: "🔥", description: "Complete firewall missions and contain malware infections." },
      { name: "Cyber Detective", icon: "🕵️", description: "Solve investigation missions and recover compromised data." },
      { name: "Team Hero", icon: "🛡️", description: "Complete a team mission with classmates." }
    ]);
  };

  const handleUpdateAvatar = async (avatarSymbol) => {
    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: avatarSymbol })
      });
      if (res.ok) {
        setProfileData(prev => ({ ...prev, avatar: avatarSymbol }));
        // Update globally
        user.avatar = avatarSymbol;
        addToast('Avatar updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
    }
  };

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendUsername.trim()) return;

    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/profile/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: friendUsername })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        setFriendUsername('');
        fetchFriends();
      } else {
        addToast(data.message || 'Failed to add friend', 'error');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 'Digital Safety Hero': return '🏆';
      case 'Cyber Guardian': return '🛡️';
      case 'Firewall Defender': return '🔥';
      case 'Phishing Hunter': return '🕵️';
      case 'Password Protector': return '🔑';
      default: return '👶';
    }
  };

  const isBadgeUnlocked = (badgeName) => {
    if (!profileData || !profileData.badges) return false;
    return profileData.badges.some(ub => ub.badge && ub.badge.name === badgeName);
  };

  const getBadgeUnlockDate = (badgeName) => {
    if (!profileData || !profileData.badges) return '';
    const unlocked = profileData.badges.find(ub => ub.badge && ub.badge.name === badgeName);
    return unlocked ? new Date(unlocked.unlockedAt).toLocaleDateString() : '';
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} className="cyber-button purple" style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <div style={styles.titleArea}>
          <h1 className="neon-text-blue" style={styles.title}>Hero Profile</h1>
          <p style={styles.subtext}>Customize your digital avatar, track achievements, and manage your guard network.</p>
        </div>
      </header>

      {loading ? (
        <div style={styles.loading}>Accessing profile registries...</div>
      ) : (
        <div style={styles.grid}>
          
          {/* Column 1: Info and Avatar custom */}
          <div style={styles.colLeft}>
            
            {/* Player details */}
            <div className="cyber-card" style={styles.profileCard}>
              <div style={styles.avatarMain}>{profileData?.avatar || '👦'}</div>
              <h2 style={styles.usernameText}>{profileData?.username}</h2>
              <span className="neon-text-blue" style={styles.rankLabel}>
                {getRankBadge(profileData?.rank)} {profileData?.rank}
              </span>
              
              <div style={styles.statsBriefRow}>
                <div style={styles.statBox}>
                  <span style={styles.statVal}>{profileData?.xp}</span>
                  <span style={styles.statLabel}>Total XP</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statVal} style={{ color: 'var(--cyber-green)' }}>{profileData?.wins}</span>
                  <span style={styles.statLabel}>Wins</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statVal} style={{ color: 'var(--cyber-red)' }}>{profileData?.losses}</span>
                  <span style={styles.statLabel}>Losses</span>
                </div>
              </div>
            </div>

            {/* Avatar customization */}
            <div className="cyber-card" style={styles.avatarsCard}>
              <h3 style={styles.panelTitle}>Choose Your Hero Character</h3>
              <div style={styles.avatarGrid}>
                {avatars.map(a => (
                  <button 
                    key={a} 
                    onClick={() => handleUpdateAvatar(a)} 
                    style={{
                      ...styles.avatarBtn,
                      border: profileData?.avatar === a ? '2px solid var(--cyber-blue)' : '2px solid transparent',
                      boxShadow: profileData?.avatar === a ? '0 0 10px rgba(0, 240, 255, 0.4)' : 'none'
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2: Badges & Friends */}
          <div style={styles.colRight}>
            
            {/* Badges checklist */}
            <div className="cyber-card" style={styles.badgesCard}>
              <h3 style={styles.panelTitle}><Award size={20} /> Unlocked Badges ({profileData?.badges.length || 0})</h3>
              
              <div style={styles.badgesGrid}>
                {allBadges.map(badge => {
                  const unlocked = isBadgeUnlocked(badge.name);
                  return (
                    <div key={badge.name} style={{
                      ...styles.badgeRow,
                      opacity: unlocked ? 1 : 0.4
                    }}>
                      <div style={styles.badgeIconBox}>
                        <span style={styles.badgeIcon}>{badge.icon}</span>
                      </div>
                      <div style={styles.badgeDetails}>
                        <span style={styles.badgeName}>{badge.name} {unlocked && '✓'}</span>
                        <span style={styles.badgeDesc}>{badge.description}</span>
                        {unlocked && (
                          <span style={styles.badgeDate}>Unlocked: {getBadgeUnlockDate(badge.name)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Friends list panel */}
            <div className="cyber-card" style={styles.friendsCard}>
              <h3 style={styles.panelTitle}><Users size={20} /> Safe Friends list</h3>

              <form onSubmit={handleSendFriendRequest} style={styles.friendForm}>
                <input 
                  type="text" 
                  placeholder="Enter friend username..." 
                  value={friendUsername}
                  onChange={e => setFriendUsername(e.target.value)}
                  className="cyber-input"
                  style={styles.friendInput}
                />
                <button type="submit" className="cyber-button orange" style={styles.friendSubmitBtn}>
                  <Plus size={16} /> Add
                </button>
              </form>

              <div style={styles.friendsList}>
                {friends.length === 0 ? (
                  <div style={styles.emptyFriends}>No classmates in your network yet.</div>
                ) : (
                  friends.map(f => (
                    <div key={f.id} style={styles.friendRow}>
                      <div style={styles.friendLeft}>
                        <span style={{
                          ...styles.statusDot,
                          backgroundColor: f.status === 'Searching' ? 'var(--cyber-orange)' : f.status === 'Battle' ? 'var(--cyber-red)' : f.status === 'Mission' ? 'var(--cyber-blue)' : f.status === 'Idle' ? '#a0aec0' : 'var(--cyber-green)'
                        }}></span>
                        <span style={styles.friendAvatar}>{f.avatar || '👦'}</span>
                        <div style={styles.friendDetails}>
                          <span style={styles.friendName}>{f.username}</span>
                          <span style={styles.friendRank}>{f.rank}</span>
                        </div>
                      </div>
                      <span style={styles.friendStatusText}>{f.status}</span>
                    </div>
                  ))
                )}
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
  loading: {
    color: '#8c87a5',
    textAlign: 'center',
    padding: '50px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.4fr',
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
  profileCard: {
    padding: '30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  avatarMain: {
    fontSize: '5rem',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--cyber-blue) 0%, var(--cyber-purple) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
    marginBottom: '10px'
  },
  usernameText: {
    fontSize: '1.8rem',
    color: '#fff',
    margin: 0,
    fontWeight: 'bold'
  },
  rankLabel: {
    fontSize: '1rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  statsBriefRow: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    background: 'rgba(0,0,0,0.15)',
    padding: '16px',
    borderRadius: '16px',
    marginTop: '15px'
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statVal: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#fff'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#8c87a5',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: '2px'
  },
  avatarsCard: {
    padding: '20px'
  },
  panelTitle: {
    fontSize: '1.2rem',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px'
  },
  avatarBtn: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    fontSize: '2rem',
    padding: '8px 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },
  badgesCard: {
    padding: '24px'
  },
  badgesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  badgeRow: {
    display: 'flex',
    gap: '14px',
    background: 'rgba(0,0,0,0.15)',
    padding: '14px',
    borderRadius: '16px',
    alignItems: 'center',
    transition: 'opacity 0.3s ease'
  },
  badgeIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(255,255,255,0.05)'
  },
  badgeIcon: {
    fontSize: '1.8rem'
  },
  badgeDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  badgeName: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '1rem'
  },
  badgeDesc: {
    fontSize: '0.85rem',
    color: '#8c87a5',
    lineHeight: '1.3'
  },
  badgeDate: {
    fontSize: '0.75rem',
    color: 'var(--cyber-green)',
    fontWeight: 'bold',
    marginTop: '2px'
  },
  friendsCard: {
    padding: '24px'
  },
  friendForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px'
  },
  friendInput: {
    flex: 1
  },
  friendSubmitBtn: {
    padding: '0 16px'
  },
  friendsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  emptyFriends: {
    color: '#8c87a5',
    textAlign: 'center',
    fontSize: '0.85rem',
    padding: '14px 0'
  },
  friendRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '14px'
  },
  friendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  friendAvatar: {
    fontSize: '1.2rem'
  },
  friendDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  friendName: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  friendRank: {
    fontSize: '0.7rem',
    color: '#8c87a5'
  },
  friendStatusText: {
    fontSize: '0.75rem',
    color: '#8c87a5',
    textTransform: 'capitalize'
  }
};


