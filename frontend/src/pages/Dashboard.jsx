import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';
import { Shield, Trophy, Users, MessageSquare, Award, Settings, Bell, Sun, Moon, LogOut, Swords, Users2 } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { onlinePlayers, toasts, addToast } = useContext(GameContext);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // RPG Level Progress calculations
  const xp = user?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXP = xp % 100;
  const progressPercent = currentLevelXP; // since 100 XP per level

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

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchFriends();
    }
  }, [user]);

  // Listen for badge/notifications event triggers
  useEffect(() => {
    const handleNewNotif = () => {
      fetchNotifications();
    };
    const handleFriendUpdate = () => {
      fetchFriends();
    };
    window.addEventListener('new-notification-event', handleNewNotif);
    window.addEventListener('badge-unlocked-event', handleNewNotif);
    window.addEventListener('friend-list-updated-event', handleFriendUpdate);
    return () => {
      window.removeEventListener('new-notification-event', handleNewNotif);
      window.removeEventListener('badge-unlocked-event', handleNewNotif);
      window.removeEventListener('friend-list-updated-event', handleFriendUpdate);
    };
  }, []);

  const handleRespondFriendRequest = async (notificationId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId, action })
      });
      if (res.ok) {
        fetchNotifications();
        fetchFriends();
        addToast(action === 'accept' ? 'Friend request accepted!' : 'Friend request declined.', 'success');
      } else {
        const errData = await res.json();
        addToast(errData.message || 'Failed to respond to friend request', 'error');
      }
    } catch (err) {
      console.error('Error responding to friend request:', err);
      addToast('Network error responding to friend request', 'error');
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleMarkNotifRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/profile/notifications/read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={styles.container}>
      {/* Top Navigation Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer} onClick={() => navigate('/')}>
          <span style={styles.logoIcon}>🛡️</span>
          <h1 style={styles.logoText}>Digital Safety Heroes</h1>
        </div>

        <div style={styles.headerActions}>
          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={styles.iconBtn} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} color="var(--cyber-blue)" /> : <Moon size={20} color="var(--cyber-purple)" />}
          </button>

          {/* Notifications Dropdown Container */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                if (!showNotifDropdown && unreadCount > 0) handleMarkNotifRead();
              }} 
              style={styles.iconBtn}
            >
              <Bell size={20} color="var(--cyber-orange)" />
              {unreadCount > 0 && <span style={styles.badgeCount}>{unreadCount}</span>}
            </button>

            {showNotifDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>Notifications</div>
                <div style={styles.dropdownList}>
                  {notifications.length === 0 ? (
                    <div style={styles.dropdownEmpty}>No notifications yet!</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{
                        ...styles.dropdownItem,
                        backgroundColor: n.isRead ? 'transparent' : 'rgba(255, 157, 0, 0.05)'
                      }}>
                        <span style={styles.dropdownIcon}>{n.icon || '🔔'}</span>
                        <div style={styles.dropdownTextCol}>
                          <span style={styles.dropdownTitle}>{n.title}</span>
                          <span style={styles.dropdownMessage}>{n.message}</span>
                          {n.type === 'friend_request' && (
                            <div style={styles.notifActions}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRespondFriendRequest(n.id, 'accept');
                                }} 
                                style={styles.notifAcceptBtn}
                              >
                                ✅ Accept
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRespondFriendRequest(n.id, 'decline');
                                }} 
                                style={styles.notifDeclineBtn}
                              >
                                ❌ Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Brief */}
          {user && (
            <div style={styles.userProfileBtn} onClick={() => navigate('/profile')}>
              <div style={styles.avatar}>
                {user.avatar || '👦'}
              </div>
              <span style={styles.headerUsername}>{user.username}</span>
            </div>
          )}

          {/* Logout */}
          <button onClick={logout} style={styles.logoutBtn} title="Logout">
            <LogOut size={20} color="var(--cyber-red)" />
          </button>
        </div>
      </header>

      {/* Outer Layout wrapper */}
      <div style={styles.layoutBody}>
        {/* Navigation Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Navigation</div>
          
          <button style={{ ...styles.sideLink, ...styles.activeSideLink }} onClick={() => navigate('/')}>
            <Shield size={18} /> Dashboard Home
          </button>
          
          <button style={styles.sideLink} onClick={() => navigate('/battle')}>
            <Swords size={18} /> Cyber Arena
          </button>
          
          <button style={styles.sideLink} onClick={() => navigate('/missions')}>
            <Users2 size={18} /> Team Missions
          </button>
          
          <button style={styles.sideLink} onClick={() => navigate('/club')}>
            <MessageSquare size={18} /> Cyber Club
          </button>

          <button style={styles.sideLink} onClick={() => navigate('/profile')}>
            <Award size={18} /> My Profile
          </button>

          {(user?.username.toLowerCase() === 'ahmed' || user?.username.toLowerCase() === 'ali') && (
            <button style={{ ...styles.sideLink, color: 'var(--cyber-red)' }} onClick={() => navigate('/admin')}>
              <Settings size={18} /> Admin Dashboard
            </button>
          )}

          {/* Level Progress Widget */}
          {user && (
            <div className="cyber-card" style={styles.levelCard}>
              <div style={styles.levelRow}>
                <span style={styles.levelNum}>LVL {level}</span>
                <span style={styles.levelXP}>{xp} / {level * 100} XP</span>
              </div>
              <div style={styles.progressBarContainer}>
                <div style={{ ...styles.progressBar, width: `${progressPercent}%` }}></div>
              </div>
              <div style={styles.progressSub}>
                {getRankBadge(user.rank)} <b>{user.rank}</b>
              </div>
            </div>
          )}
        </aside>

        {/* Main Dashboard Area */}
        <main style={styles.main}>
          <div style={styles.welcomeSection}>
            <h2>Welcome back, <span className="neon-text-blue">{user?.username}</span>!</h2>
            <p>Ready to protect the digital net today? Choose a mission below!</p>
          </div>

          <div style={styles.dashboardGrid}>
            {/* Play Modes Selection */}
            <div style={styles.modesContainer}>
              {/* Cyber Arena Matchmaking card */}
              <div className="cyber-card" style={{ ...styles.modeCard, borderLeft: '5px solid var(--cyber-orange)' }}>
                <div style={styles.modeHeader}>
                  <div style={styles.modeTitleBox}>
                    <Swords size={32} color="var(--cyber-orange)" />
                    <h3>Cyber Arena Quiz Battle</h3>
                  </div>
                  <span style={styles.hotBadge}>LIVE</span>
                </div>
                <p>Compete in a timed real-time cybersecurity quiz battle against another player. Earn XP, gold, and climb global ranks!</p>
                <button className="cyber-button orange" style={styles.actionBtn} onClick={() => navigate('/battle')}>
                  Enter Arena ⚔️
                </button>
              </div>

              {/* Team Missions card */}
              <div className="cyber-card" style={{ ...styles.modeCard, borderLeft: '5px solid var(--cyber-blue)' }}>
                <div style={styles.modeHeader}>
                  <div style={styles.modeTitleBox}>
                    <Users2 size={32} color="var(--cyber-blue)" />
                    <h3>Cooperative Team Missions</h3>
                  </div>
                  <span style={{ ...styles.hotBadge, background: 'var(--cyber-blue)', color: '#000' }}>CO-OP</span>
                </div>
                <p>Form a squad with friends or join players online to solve security incident investigations, patch malware, and decrypt data backups together!</p>
                <button className="cyber-button" style={styles.actionBtn} onClick={() => navigate('/missions')}>
                  Launch Mission 🚀
                </button>
              </div>

            </div>

            {/* Sidebar Column: Daily Missions & Online Friends */}
            <div style={styles.dashboardSidebar}>
              {/* Daily Missions */}
              <div className="cyber-card" style={styles.panelCard}>
                <h4>Daily Missions</h4>
                <div style={styles.missionList}>
                  <div style={styles.missionItem}>
                    <input type="checkbox" readOnly checked={user?.wins > 0} style={styles.checkbox} />
                    <div>
                      <div style={styles.missionTitle}>Win a Quiz Battle</div>
                      <div style={styles.missionReward}>+50 XP</div>
                    </div>
                  </div>
                  <div style={styles.missionItem}>
                    <input type="checkbox" readOnly checked={user?.xp > 1200} style={styles.checkbox} />
                    <div>
                      <div style={styles.missionTitle}>Solve a co-op mission</div>
                      <div style={styles.missionReward}>+80 XP</div>
                    </div>
                  </div>
                  <div style={styles.missionItem}>
                    <input type="checkbox" readOnly checked={false} style={styles.checkbox} />
                    <div>
                      <div style={styles.missionTitle}>Post safety tips in Cyber Club</div>
                      <div style={styles.missionReward}>+30 XP</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Online Friends Sidebar */}
              <div className="cyber-card" style={styles.panelCard}>
                <h4>Online Friends</h4>
                {loadingFriends ? (
                  <div style={styles.loading}>Loading friends list...</div>
                ) : friends.length === 0 ? (
                  <div style={styles.emptyFriends}>
                    <p>No friends added yet!</p>
                    <button className="cyber-button purple" style={styles.friendBtn} onClick={() => navigate('/profile')}>
                      Find Friends 👥
                    </button>
                  </div>
                ) : (
                  <div style={styles.friendsList}>
                    {friends.map(f => {
                      const onlineFriend = onlinePlayers.find(p => p.userId.toString() === f.id.toString());
                      const liveStatus = onlineFriend ? onlineFriend.status || 'Online' : 'Offline';
                      const dotColor = liveStatus === 'Offline' ? '#a0aec0' : 
                                       liveStatus === 'Searching' ? 'var(--cyber-orange)' :
                                       liveStatus === 'Battle' ? 'var(--cyber-red)' :
                                       liveStatus === 'Mission' ? 'var(--cyber-blue)' :
                                       'var(--cyber-green)';
                      return (
                        <div key={f.id} style={styles.friendRow}>
                          <div style={styles.friendLeft}>
                            <span style={{
                              ...styles.statusDot,
                              backgroundColor: dotColor
                            }}></span>
                            <span style={styles.friendAvatar}>{f.avatar || '👦'}</span>
                            <span style={styles.friendName}>{f.username}</span>
                          </div>
                          <span style={styles.friendStatusText}>{liveStatus}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-gradient)',
    color: '#f5f5fa',
    fontFamily: 'var(--font-body)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    background: 'rgba(15, 12, 32, 0.8)',
    borderBottom: '2px solid rgba(189, 0, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  logoIcon: {
    fontSize: '2rem'
  },
  logoText: {
    fontSize: '1.6rem',
    fontFamily: 'var(--font-title)',
    background: 'linear-gradient(90deg, #fff 0%, var(--cyber-blue) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease'
  },
  badgeCount: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: 'var(--cyber-red)',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    background: 'rgba(15, 12, 32, 0.95)',
    border: '2px solid var(--glass-border)',
    borderRadius: '16px',
    width: '280px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    zIndex: 200,
    overflow: 'hidden'
  },
  dropdownHeader: {
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  dropdownList: {
    maxHeight: '240px',
    overflowY: 'auto'
  },
  dropdownEmpty: {
    padding: '20px',
    textAlign: 'center',
    color: '#8c87a5',
    fontSize: '0.85rem'
  },
  dropdownItem: {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    alignItems: 'flex-start'
  },
  dropdownIcon: {
    fontSize: '1.2rem'
  },
  dropdownTextCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  dropdownTitle: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  dropdownMessage: {
    fontSize: '0.75rem',
    color: '#a4a0be'
  },
  userProfileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '6px 12px',
    borderRadius: '12px',
    cursor: 'pointer'
  },
  avatar: {
    fontSize: '1.25rem'
  },
  headerUsername: {
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px'
  },
  layoutBody: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    flex: 1
  },
  sidebar: {
    background: 'rgba(12, 9, 30, 0.4)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sidebarTitle: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#8c87a5',
    letterSpacing: '1px',
    padding: '8px 12px'
  },
  sideLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    background: 'transparent',
    border: 'none',
    color: '#a4a0be',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  activeSideLink: {
    background: 'rgba(0, 240, 255, 0.1)',
    color: 'var(--cyber-blue)',
    boxShadow: 'inset 0 0 10px rgba(0, 240, 255, 0.1)'
  },
  levelCard: {
    marginTop: 'auto',
    padding: '16px',
    borderRadius: '16px'
  },
  levelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  levelNum: {
    fontWeight: 'bold',
    fontFamily: 'var(--font-title)',
    color: 'var(--cyber-blue)'
  },
  levelXP: {
    fontSize: '0.75rem',
    color: '#8c87a5'
  },
  progressBarContainer: {
    height: '8px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--cyber-blue), var(--cyber-purple))',
    borderRadius: '4px'
  },
  progressSub: {
    fontSize: '0.75rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  main: {
    padding: '32px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto'
  },
  welcomeSection: {
    marginBottom: '24px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1fr',
    gap: '30px',
    alignItems: 'start'
  },
  modesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  modeCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  modeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modeTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  hotBadge: {
    background: 'var(--cyber-orange)',
    color: '#000',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '8px'
  },
  actionBtn: {
    alignSelf: 'flex-start',
    padding: '12px 24px'
  },
  dashboardSidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  panelCard: {
    padding: '20px'
  },
  missionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '12px'
  },
  missionItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--cyber-green)'
  },
  missionTitle: {
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  missionReward: {
    fontSize: '0.75rem',
    color: 'var(--cyber-orange)',
    fontWeight: 'bold'
  },
  emptyFriends: {
    textAlign: 'center',
    padding: '20px',
    color: '#8c87a5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  friendBtn: {
    padding: '8px 16px',
    fontSize: '0.8rem'
  },
  friendsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px'
  },
  friendRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '12px'
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
    fontSize: '1rem'
  },
  friendName: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  friendStatusText: {
    fontSize: '0.75rem',
    color: '#8c87a5',
    textTransform: 'capitalize'
  },
  loading: {
    color: '#8c87a5',
    textAlign: 'center',
    padding: '10px'
  },
  notifActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px'
  },
  notifAcceptBtn: {
    backgroundColor: 'var(--cyber-green)',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  notifDeclineBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};


