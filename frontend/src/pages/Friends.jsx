import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';
import { Users, Search, UserPlus, Check, X } from 'lucide-react';

export default function Friends() {
  const { user } = useContext(AuthContext);
  const { onlinePlayers, addToast, sendGameInvite } = useContext(GameContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // all, requests, search
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();
    }
  }, [user]);

  // Listen for real-time notification events
  useEffect(() => {
    const handleUpdate = () => {
      fetchFriends();
      fetchRequests();
    };
    window.addEventListener('new-notification-event', handleUpdate);
    window.addEventListener('friend-list-updated-event', handleUpdate);
    return () => {
      window.removeEventListener('new-notification-event', handleUpdate);
      window.removeEventListener('friend-list-updated-event', handleUpdate);
    };
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/profile/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.filter(n => n.type === 'friend_request'));
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const handleRespondRequest = async (notificationId, action) => {
    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/profile/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId, action })
      });
      if (res.ok) {
        fetchFriends();
        fetchRequests();
        addToast(action === 'accept' ? 'Friend request accepted!' : 'Friend request declined.', 'success');
      } else {
        const errData = await res.json();
        addToast(errData.message || 'Failed to respond', 'error');
      }
    } catch (err) {
      console.error('Error responding:', err);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/profile/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: searchQuery })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        setSearchQuery('');
      } else {
        addToast(data.message || 'User not found or already added', 'error');
      }
    } catch (err) {
      console.error('Error adding friend:', err);
    }
  };

  const handleInvite = (friendId, username) => {
    // Check if user is online
    const onlineFriend = onlinePlayers.find(p => p.userId.toString() === friendId.toString());
    if (!onlineFriend || onlineFriend.status === 'Offline') {
      addToast('Cannot invite offline players.', 'error');
      return;
    }
    if (onlineFriend.status === 'InMatch' || onlineFriend.status === 'Battle' || onlineFriend.status === 'Lobby') {
      addToast('Player is already in a match or lobby.', 'error');
      return;
    }

    // Use context function which handles socket emission
    sendGameInvite(friendId, username);
    addToast(`🎮 Invitation sent to ${username}! Waiting for response...`, 'success');
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 className="neon-text-blue" style={styles.title}>Network Friends</h1>
        <p style={styles.subtext}>Manage your allies and invite them to Cyber Arena challenges.</p>
      </div>

      <div style={styles.mainContent}>
        <div className="cyber-card" style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabsContainer}>
            <button 
              style={activeTab === 'all' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => setActiveTab('all')}
            >
              <Users size={18} /> All Friends
            </button>
            <button 
              style={activeTab === 'requests' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => setActiveTab('requests')}
            >
              <UserPlus size={18} /> Friend Requests {requests.length > 0 && <span style={styles.badge}>{requests.length}</span>}
            </button>
            <button 
              style={activeTab === 'search' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => setActiveTab('search')}
            >
              <Search size={18} /> Search & Add
            </button>
          </div>

          <div style={styles.tabContent}>
            
            {/* ALL FRIENDS TAB */}
            {activeTab === 'all' && (
              <div style={styles.listContainer}>
                {loading ? (
                  <div style={styles.emptyState}>Loading allies...</div>
                ) : friends.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>🤝</span>
                    <h3>No friends yet</h3>
                    <p>Go to the Search tab to find and add allies to your network.</p>
                  </div>
                ) : (
                  friends.map(f => {
                    const onlineFriend = onlinePlayers.find(p => p.userId.toString() === f.id.toString());
                    const liveStatus = onlineFriend ? onlineFriend.status || 'Online' : 'Offline';
                    const isOnline = liveStatus !== 'Offline';
                    
                    let dotColor = '#a0aec0';
                    if (liveStatus === 'Online' || liveStatus === 'Idle') dotColor = 'var(--cyber-green)';
                    if (liveStatus === 'Searching') dotColor = 'var(--cyber-orange)';
                    if (liveStatus === 'InMatch' || liveStatus === 'Battle') dotColor = 'var(--cyber-red)';

                    return (
                      <div key={f.id} style={styles.row}>
                        <div style={styles.rowLeft}>
                          <span style={{ ...styles.statusDot, backgroundColor: dotColor }}></span>
                          <span style={styles.avatar}>{f.avatar || '👦'}</span>
                          <div style={styles.userDetails}>
                            <span style={styles.username}>{f.username}</span>
                            <span style={styles.statusText}>{liveStatus}</span>
                          </div>
                        </div>
                        <button 
                          className={`cyber-button ${isOnline ? 'orange' : ''}`}
                          style={{ ...styles.actionBtn, opacity: isOnline ? 1 : 0.5, pointerEvents: isOnline ? 'auto' : 'none' }}
                          onClick={() => handleInvite(f.id, f.username)}
                        >
                          Invite ⚔️
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* FRIEND REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div style={styles.listContainer}>
                {requests.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📬</span>
                    <h3>No pending requests</h3>
                    <p>Your inbox is clear. All caught up!</p>
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req.id} style={styles.row}>
                      <div style={styles.rowLeft}>
                        <span style={styles.avatar}>{req.icon || '👤'}</span>
                        <div style={styles.userDetails}>
                          <span style={styles.username}>{req.title.replace('New Friend Request from ', '')}</span>
                          <span style={styles.statusText}>Pending request</span>
                        </div>
                      </div>
                      <div style={styles.actionGroup}>
                        <button 
                          style={styles.acceptBtn}
                          onClick={() => handleRespondRequest(req.id, 'accept')}
                        >
                          <Check size={16} /> Accept
                        </button>
                        <button 
                          style={styles.declineBtn}
                          onClick={() => handleRespondRequest(req.id, 'decline')}
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SEARCH USERS TAB */}
            {activeTab === 'search' && (
              <div style={styles.searchContainer}>
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>🔍</span>
                  <h3>Find Allies</h3>
                  <p>Enter an exact username to send a friend request.</p>
                  
                  <form onSubmit={handleSendRequest} style={styles.searchForm}>
                    <input 
                      type="text" 
                      placeholder="Username..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="cyber-input"
                      style={styles.searchInput}
                    />
                    <button type="submit" className="cyber-button purple" style={styles.searchBtn}>
                      Send Request
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px 40px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    minHeight: '100vh',
    background: 'var(--bg-gradient)'
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(0,0,0,0.2)'
  },
  tab: {
    flex: 1,
    padding: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: 'transparent',
    border: 'none',
    color: '#8c87a5',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent'
  },
  activeTab: {
    color: 'var(--cyber-blue)',
    borderBottom: '2px solid var(--cyber-blue)',
    background: 'rgba(0, 240, 255, 0.05)'
  },
  badge: {
    background: 'var(--cyber-red)',
    color: '#fff',
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '10px',
    marginLeft: '4px'
  },
  tabContent: {
    padding: '30px',
    minHeight: '400px'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.02)'
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  avatar: {
    fontSize: '2rem'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  username: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  statusText: {
    fontSize: '0.85rem',
    color: '#8c87a5'
  },
  actionBtn: {
    padding: '8px 20px',
    fontSize: '0.9rem'
  },
  actionGroup: {
    display: 'flex',
    gap: '10px'
  },
  acceptBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(57, 255, 20, 0.2)',
    color: 'var(--cyber-green)',
    border: '1px solid var(--cyber-green)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  declineBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8c87a5',
    padding: '40px 0',
    gap: '10px',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '3rem',
    opacity: 0.5,
    marginBottom: '10px'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    width: '100%',
    maxWidth: '400px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '1rem'
  },
  searchBtn: {
    padding: '0 20px'
  }
};
