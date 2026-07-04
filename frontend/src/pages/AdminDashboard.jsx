import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';
import { Shield, Users, Activity, FileText, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(GameContext);
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    // Basic Admin protection check (Ahmed or Ali)
    if (!user || (user.username.toLowerCase() !== 'ahmed' && user.username.toLowerCase() !== 'ali')) {
      addToast('Unauthorized! Admins only.', 'error');
      navigate('/');
      return;
    }
    
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hsh_token');
      
      // Fetch analytics
      const resAnal = await fetch('http://localhost:5000/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAnal.ok) {
        const data = await resAnal.json();
        setAnalytics(data);
      }

      // Fetch reports
      const resRep = await fetch('http://localhost:5000/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resRep.ok) {
        const data = await resRep.json();
        setReports(data);
      }

      // Fetch users
      const resUsr = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resUsr.ok) {
        const data = await resUsr.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch(`http://localhost:5000/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        addToast(`Report resolved: Post ${action === 'delete' ? 'deleted' : 'approved'}.`, 'success');
        fetchData(); // reload
      }
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  const handleDeleteUser = async (targetUserId) => {
    if (!window.confirm("Are you sure you want to permanently delete/ban this user?")) return;

    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${targetUserId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsersList(prev => prev.filter(u => u.id !== targetUserId));
        addToast('User deleted successfully.', 'success');
        fetchData(); // reload
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} className="cyber-button purple" style={styles.backBtn}>
          ← Quit Admin & Home
        </button>
        <div style={styles.titleArea}>
          <h1 className="neon-text-purple" style={styles.title}>Admin Review Panel</h1>
          <p style={styles.subtext}>Moderate community posts, audit registered kids profiles, and view real-time platform diagnostics.</p>
        </div>
      </header>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        <button 
          onClick={() => setActiveTab('analytics')} 
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'analytics' ? '3px solid var(--cyber-purple)' : 'none', color: activeTab === 'analytics' ? '#fff' : '#8c87a5' }}
        >
          <Activity size={18} /> Analytics & Presence
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'reports' ? '3px solid var(--cyber-purple)' : 'none', color: activeTab === 'reports' ? '#fff' : '#8c87a5' }}
        >
          <AlertTriangle size={18} /> Content Moderation ({reports.length})
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'users' ? '3px solid var(--cyber-purple)' : 'none', color: activeTab === 'users' ? '#fff' : '#8c87a5' }}
        >
          <Users size={18} /> Manage Kids Profiles
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Accessing database logs...</div>
      ) : (
        <div style={styles.panelBody}>
          
          {/* TAB 1: Analytics */}
          {activeTab === 'analytics' && analytics && (
            <div style={styles.tabContent}>
              <div style={styles.statsBriefRow}>
                <div className="cyber-card" style={styles.statBox}>
                  <span style={styles.statVal} className="neon-text-blue">{analytics.totalUsers}</span>
                  <span style={styles.statLabel}>Total Kids Registered</span>
                </div>
                <div className="cyber-card" style={styles.statBox}>
                  <span style={styles.statVal} style={{ color: 'var(--cyber-green)' }}>{analytics.onlineUsers}</span>
                  <span style={styles.statLabel}>Active Players Online</span>
                </div>
                <div className="cyber-card" style={styles.statBox}>
                  <span style={styles.statVal} style={{ color: 'var(--cyber-orange)' }}>{analytics.activeBattles}</span>
                  <span style={styles.statLabel}>Live Battles Running</span>
                </div>
                <div className="cyber-card" style={styles.statBox}>
                  <span style={styles.statVal}>{analytics.totalPosts}</span>
                  <span style={styles.statLabel}>Total Social Posts</span>
                </div>
              </div>

              {/* Online players list */}
              <div className="cyber-card" style={styles.detailCard}>
                <h3>Real-time Presence Status</h3>
                <div style={styles.presenceGrid}>
                  {analytics.onlineList?.length === 0 ? (
                    <div style={styles.emptyList}>No players currently online.</div>
                  ) : (
                    analytics.onlineList.map(u => (
                      <div key={u.id} style={styles.presenceRow}>
                        <span style={styles.playerAvatar}>{u.avatar || '👦'}</span>
                        <div style={styles.playerInfo}>
                          <span style={styles.playerName}>{u.username}</span>
                          <span style={styles.playerRank}>{u.rank}</span>
                        </div>
                        <span style={styles.playerStatusText}>{u.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Moderation Reports */}
          {activeTab === 'reports' && (
            <div style={styles.tabContent}>
              <h3>Community Flagged Content ({reports.length} pending reports)</h3>
              
              <div style={styles.reportsStream}>
                {reports.length === 0 ? (
                  <div className="cyber-card" style={styles.emptyCard}>
                    <CheckCircle size={40} color="var(--cyber-green)" />
                    <h4>All Clear!</h4>
                    <p>No community posts have been flagged for review.</p>
                  </div>
                ) : (
                  reports.map(rep => (
                    <div key={rep.id} className="cyber-card" style={styles.reportCard}>
                      <div style={styles.reportHeader}>
                        <div>
                          <span style={styles.reportAuthor}>Author: <b>{rep.postAuthor}</b></span>
                          <span style={styles.reportDate}> | Flagged by: <b>{rep.reportedByUsername}</b></span>
                        </div>
                        <span style={styles.reportReason}>Reason: {rep.reason}</span>
                      </div>
                      
                      <div style={styles.reportContentBox}>
                        <span style={styles.reportContentLabel}>{rep.postType}:</span>
                        <p style={styles.reportText}>"{rep.postContent}"</p>
                      </div>

                      <div style={styles.reportActions}>
                        <button 
                          onClick={() => handleResolveReport(rep.id, 'keep')} 
                          className="cyber-button" 
                          style={styles.keepBtn}
                        >
                          Approve Post (Keep) ✓
                        </button>
                        <button 
                          onClick={() => handleResolveReport(rep.id, 'delete')} 
                          className="cyber-button orange" 
                          style={styles.deleteBtn}
                        >
                          Delete Post ❌
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Manage Users */}
          {activeTab === 'users' && (
            <div style={styles.tabContent}>
              <h3>Audit Player Profiles</h3>
              
              <div className="cyber-card" style={styles.usersCard}>
                <div style={styles.usersListHeader}>
                  <span>Username</span>
                  <span>Email Address</span>
                  <span>XP / Rank</span>
                  <span>Record</span>
                  <span>Actions</span>
                </div>
                <div style={styles.usersList}>
                  {usersList.map(u => (
                    <div key={u.id} style={styles.userRow}>
                      <span style={styles.userColName}>{u.avatar} <b>{u.username}</b></span>
                      <span style={styles.userColEmail}>{u.email}</span>
                      <span style={styles.userColRank}>{u.xp} XP / {u.rank}</span>
                      <span style={styles.userColRecord}>{u.wins}W / {u.losses}L</span>
                      <button 
                        onClick={() => handleDeleteUser(u.id)} 
                        className="cyber-button orange" 
                        style={styles.banBtn}
                        disabled={u.username.toLowerCase() === 'ahmed'}
                      >
                        <Trash2 size={14} /> Delete Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
  tabsRow: {
    display: 'flex',
    gap: '16px',
    borderBottom: '2px solid rgba(255,255,255,0.05)',
    paddingBottom: '10px'
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  loading: {
    color: '#8c87a5',
    textAlign: 'center',
    padding: '50px'
  },
  panelBody: {
    marginTop: '10px'
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  statsBriefRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px'
  },
  statBox: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  statVal: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#fff'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#8c87a5',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: '4px'
  },
  detailCard: {
    padding: '24px'
  },
  presenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  emptyList: {
    gridColumn: 'span 4',
    textAlign: 'center',
    color: '#8c87a5',
    padding: '20px'
  },
  presenceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(0,0,0,0.15)',
    padding: '12px',
    borderRadius: '16px'
  },
  playerAvatar: {
    fontSize: '1.8rem'
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  playerName: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '0.9rem'
  },
  playerRank: {
    fontSize: '0.75rem',
    color: '#8c87a5'
  },
  playerStatusText: {
    fontSize: '0.75rem',
    color: 'var(--cyber-orange)',
    fontWeight: 'bold',
    marginLeft: 'auto'
  },
  reportsStream: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  emptyCard: {
    padding: '45px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  reportCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '8px',
    fontSize: '0.85rem',
    color: '#8c87a5'
  },
  reportAuthor: {
    color: '#fff'
  },
  reportReason: {
    color: 'var(--cyber-orange)',
    fontWeight: 'bold'
  },
  reportContentBox: {
    background: 'rgba(0,0,0,0.2)',
    padding: '16px',
    borderRadius: '12px'
  },
  reportContentLabel: {
    fontSize: '0.75rem',
    color: 'var(--cyber-blue)',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  reportText: {
    fontSize: '1rem',
    color: '#e2e2e8',
    marginTop: '4px',
    fontStyle: 'italic'
  },
  reportActions: {
    display: 'flex',
    gap: '16px',
    marginTop: '6px'
  },
  keepBtn: {
    padding: '10px 20px',
    fontSize: '0.85rem'
  },
  deleteBtn: {
    padding: '10px 20px',
    fontSize: '0.85rem'
  },
  usersCard: {
    padding: '24px'
  },
  usersListHeader: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.5fr 1.5fr 1fr 1fr',
    borderBottom: '2px solid rgba(255,255,255,0.05)',
    paddingBottom: '10px',
    fontWeight: 'bold',
    color: '#8c87a5',
    fontSize: '0.85rem',
    textTransform: 'uppercase'
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px'
  },
  userRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.5fr 1.5fr 1fr 1fr',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    fontSize: '0.9rem'
  },
  userColName: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#fff'
  },
  userColEmail: {
    color: '#a4a0be'
  },
  userColRank: {
    color: 'var(--cyber-blue)',
    fontWeight: 'bold'
  },
  userColRecord: {
    color: '#8c87a5'
  },
  banBtn: {
    padding: '8px 12px',
    fontSize: '0.75rem',
    alignSelf: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  }
};


