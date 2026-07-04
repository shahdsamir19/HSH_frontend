import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';
import { MessageSquare, Heart, AlertTriangle, Search, PlusCircle, Award, Lightbulb, HelpCircle, ShieldAlert } from 'lucide-react';

export default function CyberClub() {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(GameContext);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Post Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostType, setNewPostType] = useState('Cyber Tip');
  const [newPostContent, setNewPostContent] = useState('');

  // Comment States
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/community', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch('https://hsh-backend.vercel.app/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postType: newPostType,
          content: newPostContent
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(prev => [data, ...prev]);
        setNewPostContent('');
        setShowCreateModal(false);
        addToast('Post created! Safety filter applied.', 'success');
      } else {
        const errData = await res.json();
        addToast(errData.message || 'Failed to create post', 'error');
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch(`https://hsh-backend.vercel.app/api/community/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: data.likes } : p
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch(`https://hsh-backend.vercel.app/api/community/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newCommentText })
      });
      if (res.ok) {
        const commentData = await res.json();
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, comments: [...(p.comments || []), commentData] };
          }
          return p;
        }));
        setNewCommentText('');
        addToast('Comment added!', 'success');
      }
    } catch (err) {
      console.error('Error commenting post:', err);
    }
  };

  const handleReportPost = async (postId) => {
    const reason = window.prompt("Why are you reporting this post? (e.g. Bad language, bullying, sharing address):");
    if (reason === null) return; // cancelled

    try {
      const token = localStorage.getItem('hsh_token');
      const res = await fetch(`https://hsh-backend.vercel.app/api/community/${postId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        // Remove from feed locally
        setPosts(prev => prev.filter(p => p.id !== postId));
        addToast('Post reported. Moderation review scheduled.', 'warning');
      }
    } catch (err) {
      console.error('Error reporting post:', err);
    }
  };

  const getPostIcon = (type) => {
    switch (type) {
      case 'Achievement': return <Award color="var(--cyber-orange)" size={20} />;
      case 'Cyber Tip': return <Lightbulb color="var(--cyber-green)" size={20} />;
      case 'Question': return <HelpCircle color="var(--cyber-blue)" size={20} />;
      default: return <ShieldAlert color="var(--cyber-purple)" size={20} />;
    }
  };

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.postType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 className="neon-text-blue" style={styles.title}>Cyber Club Community</h1>
        <p style={styles.subtext}>A safe moderated social area to share security tips, ask questions, and celebrate badges!</p>
      </div>

      {/* Control bar */}
      <div style={styles.controlBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#8c87a5" />
          <input 
            type="text" 
            placeholder="Search posts or topics..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <button onClick={() => setShowCreateModal(true)} className="cyber-button orange" style={styles.createBtn}>
          <PlusCircle size={18} /> New Post
        </button>
      </div>

      {/* Main post stream */}
      {loading ? (
        <div style={styles.loading}>Loading forum board...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="cyber-card" style={styles.emptyCard}>
          <h3>No posts found!</h3>
          <p>Be the first to post a cybersecurity tip or ask a question to your classmates!</p>
        </div>
      ) : (
        <div style={styles.postStream}>
          {filteredPosts.map(post => (
            <div key={post.id} className="cyber-card" style={styles.postCard}>
              <div style={styles.postHeader}>
                <div style={styles.authorBox}>
                  <div style={styles.avatar}>👦</div>
                  <div style={styles.authorDetails}>
                    <span style={styles.authorName}>{post.username}</span>
                    <span style={styles.postDate}>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={styles.postTypeBadge}>
                  {getPostIcon(post.postType)}
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{post.postType}</span>
                </div>
              </div>

              <p style={styles.postContent}>{post.content}</p>

              {/* Likes and comments counts */}
              <div style={styles.postActions}>
                <button 
                  onClick={() => handleLikePost(post.id)} 
                  style={{
                    ...styles.actionButton,
                    color: post.likes.includes(user?.id) ? 'var(--cyber-orange)' : '#8c87a5'
                  }}
                >
                  <Heart size={16} fill={post.likes.includes(user?.id) ? 'var(--cyber-orange)' : 'none'} />
                  {post.likes.length} Likes
                </button>

                <button 
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} 
                  style={styles.actionButton}
                >
                  <MessageSquare size={16} />
                  {post.comments?.length || 0} Comments
                </button>

                <button onClick={() => handleReportPost(post.id)} style={{ ...styles.actionButton, marginLeft: 'auto', color: 'var(--cyber-red)' }}>
                  <AlertTriangle size={16} /> Report
                </button>
              </div>

              {/* Comments expand panel */}
              {activeCommentPostId === post.id && (
                <div style={styles.commentsPanel}>
                  <div style={styles.commentsList}>
                    {(post.comments || []).map(c => (
                      <div key={c.id} style={styles.commentItem}>
                        <span style={styles.commentAuthor}>{c.username}:</span>
                        <span style={styles.commentText}>{c.content}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={(e) => handleAddComment(e, post.id)} style={styles.commentForm}>
                    <input 
                      type="text" 
                      placeholder="Write a kind comment..." 
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      style={styles.commentInput}
                    />
                    <button type="submit" className="cyber-button" style={styles.commentSendBtn}>
                      Reply
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal Overlay */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div className="cyber-card" style={styles.modal}>
            <h3 style={styles.modalTitle}>Share in Cyber Club</h3>
            
            <form onSubmit={handleCreatePost} style={styles.postForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Post Type:</label>
                <select 
                  value={newPostType} 
                  onChange={e => setNewPostType(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="Cyber Tip">Cyber Tip 💡</option>
                  <option value="Question">Question ❓</option>
                  <option value="Achievement">Achievement 🏆</option>
                  <option value="Challenge Invitation">Challenge Invite ⚔️</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Content:</label>
                <textarea 
                  placeholder="Share a digital safety tip or ask a question. Keep it kind and educational!" 
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  rows={4}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="cyber-button purple" style={styles.modalBtn}>
                  Cancel
                </button>
                <button type="submit" className="cyber-button orange" style={styles.modalBtn}>
                  Post 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px 40px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px'
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
  controlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px'
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(0,0,0,0.2)',
    border: '2px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '10px 16px'
  },
  searchInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '0.95rem'
  },
  createBtn: {
    padding: '12px 24px'
  },
  loading: {
    color: '#8c87a5',
    textAlign: 'center',
    padding: '40px'
  },
  emptyCard: {
    padding: '40px',
    textAlign: 'center',
    color: '#8c87a5'
  },
  postStream: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  postCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  authorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--cyber-blue) 0%, var(--cyber-purple) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem'
  },
  authorDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  authorName: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '0.95rem'
  },
  postDate: {
    fontSize: '0.75rem',
    color: '#8c87a5'
  },
  postTypeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '6px 12px',
    borderRadius: '20px'
  },
  postContent: {
    fontSize: '1.1rem',
    lineHeight: '1.5',
    color: '#e2e2e8'
  },
  postActions: {
    display: 'flex',
    gap: '16px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '14px',
    alignItems: 'center'
  },
  actionButton: {
    background: 'transparent',
    border: 'none',
    color: '#8c87a5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  commentsPanel: {
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  commentItem: {
    background: 'rgba(0,0,0,0.15)',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    lineHeight: '1.3'
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: 'var(--cyber-blue)',
    marginRight: '6px'
  },
  commentText: {
    color: '#e2e2e8'
  },
  commentForm: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px'
  },
  commentInput: {
    flex: 1,
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--glass-border)',
    color: '#fff',
    borderRadius: '10px',
    padding: '8px 12px',
    outline: 'none',
    fontSize: '0.85rem'
  },
  commentSendBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px'
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  modalTitle: {
    fontSize: '1.4rem',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px'
  },
  postForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#8c87a5'
  },
  selectInput: {
    background: 'rgba(10, 8, 25, 0.8)',
    border: '2px solid var(--glass-border)',
    color: '#fff',
    padding: '10px',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: 'var(--font-body)'
  },
  textarea: {
    background: 'rgba(10, 8, 25, 0.8)',
    border: '2px solid var(--glass-border)',
    color: '#fff',
    padding: '12px',
    borderRadius: '10px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px'
  },
  modalBtn: {
    padding: '10px 20px',
    fontSize: '0.9rem'
  }
};


