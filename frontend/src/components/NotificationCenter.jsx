import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle, 
  Trash2, Check, X 
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function NotificationCenter() {
  const { auth, user, token } = useAuth();
  const activeUser = user || auth?.user;
  const activeToken = token || auth?.token;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modals state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const ref = useRef(null);
  const navigate = useNavigate();

  const isAdmin = activeUser?.role === 'Admin';
  const userIdKey = activeUser?.id ? String(activeUser.id) : 'guest';

  const getDeletedIdsSet = () => {
    try {
      const stored = localStorage.getItem(`elyvia_deleted_notifs_${userIdKey}`);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch (e) {
      return new Set();
    }
  };

  const saveDeletedId = (id) => {
    try {
      const current = getDeletedIdsSet();
      current.add(String(id));
      localStorage.setItem(`elyvia_deleted_notifs_${userIdKey}`, JSON.stringify(Array.from(current)));
    } catch (e) {}
  };

  const getIsClearedAll = () => {
    try {
      const stored = localStorage.getItem(`elyvia_cleared_all_${userIdKey}`);
      return stored ? Number(stored) : 0;
    } catch (e) {
      return 0;
    }
  };

  const setIsClearedAll = () => {
    try {
      localStorage.setItem(`elyvia_cleared_all_${userIdKey}`, String(Date.now()));
    } catch (e) {}
  };

  const loadNotifications = async () => {
    if (!activeToken) return;
    try {
      const data = await api.getNotifications(activeToken);
      const clearedTime = getIsClearedAll();
      const deletedSet = getDeletedIdsSet();

      let rawNotifs = data.notifications || [];

      const validNotifs = rawNotifs.filter(n => {
        const isDeleted = deletedSet.has(String(n.id));
        const notifTime = new Date(n.createdAt || 0).getTime();
        const isClearedBefore = clearedTime > 0 && notifTime <= clearedTime;
        return !isDeleted && !isClearedBefore;
      });

      const validUnread = validNotifs.filter(n => !n.isRead).length;

      setNotifications(validNotifs);
      setUnreadCount(validUnread);
    } catch (e) {
      // Background silent refresh
    }
  };

  // Real-Time Live Sync Polling Every 2 Seconds
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, [activeToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead(activeToken);
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: 1 })));
    } catch (e) {}
  };

  const confirmDeleteSingle = async (e) => {
    if (e) e.stopPropagation();
    if (!deleteTargetId) return;
    const targetId = deleteTargetId;
    setDeleteTargetId(null);

    saveDeletedId(targetId);

    const target = notifications.find(n => String(n.id) === String(targetId));
    setNotifications(prev => prev.filter(n => String(n.id) !== String(targetId)));
    if (target && !target.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await api.deleteNotification(activeToken, targetId);
    } catch (e) {
      console.error('API delete warning:', e);
    }
  };

  const confirmClearAll = async (e) => {
    if (e) e.stopPropagation();
    setShowClearAllModal(false);

    setIsClearedAll();

    setNotifications([]);
    setUnreadCount(0);

    try {
      await api.clearAllNotifications(activeToken);
    } catch (e) {
      console.error('API clear all warning:', e);
    }
  };

  // Admin Direct Leave Approval / Rejection from Notification Dropdown
  const handleAdminLeaveAction = async (e, leaveId, status) => {
    e.stopPropagation();
    if (!leaveId) return;
    setActionLoadingId(leaveId);
    try {
      await api.updateLeave(activeToken, leaveId, { status });
      await loadNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      api.markNotificationRead(activeToken, n.id).catch(() => {});
      setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: 1 } : item));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setOpen(false);

    if (n.leaveId || n.title.toLowerCase().includes('leave')) {
      navigate(isAdmin ? '/admin/leaves' : '/leaves');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} color="#9c6137" />;
      case 'warning': return <AlertTriangle size={18} color="#cc9966" />;
      case 'danger': return <XCircle size={18} color="#dc2626" />;
      default: return <Info size={18} color="#b37a4c" />;
    }
  };

  return (
    <div className="notification-bell-container" ref={ref}>
      {/* Delete Confirmation Dialog */}
      {deleteTargetId && (
        <div className="modal-backdrop" onClick={(e) => { e.stopPropagation(); setDeleteTargetId(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, borderRadius: 16, padding: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertTriangle size={22} />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12' }}>Delete Notification?</h4>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>This notification will be deleted permanently.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn-secondary btn-sm" onClick={() => setDeleteTargetId(null)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-danger btn-sm" onClick={confirmDeleteSingle} style={{ flex: 1, background: '#dc2626' }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearAllModal && (
        <div className="modal-backdrop" onClick={(e) => { e.stopPropagation(); setShowClearAllModal(false); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, borderRadius: 16, padding: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Trash2 size={24} />
              </div>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: '#2b1b12' }}>Clear All Notifications?</h4>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>Clear all notifications from your inbox permanently?</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn-secondary btn-sm" onClick={() => setShowClearAllModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-danger btn-sm" onClick={confirmClearAll} style={{ flex: 1, background: '#dc2626' }}>Clear All</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="bell-btn" onClick={() => setOpen(!open)} title="Real-Time Notifications">
        <Bell size={20} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notif-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#2b1b12' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ background: '#fff4c2', color: '#9c6137', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {unreadCount > 0 && (
                <button className="btn-secondary btn-sm" onClick={handleMarkAllRead} style={{ padding: '3px 8px', fontSize: 11, gap: 4 }}>
                  <CheckCheck size={13} /> Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button className="btn-secondary btn-sm" onClick={() => setShowClearAllModal(true)} style={{ padding: '3px 8px', fontSize: 11, color: '#dc2626', gap: 4 }} title="Clear All Notifications">
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#7a6758', fontSize: 13 }}>
                <Bell size={24} style={{ opacity: 0.4, marginBottom: 6 }} />
                <div>No notifications yet</div>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`notif-item ${n.isRead ? '' : 'unread'}`}
                  onClick={() => handleNotificationClick(n)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div style={{ marginTop: 2 }}>{getIcon(n.type)}</div>
                  
                  <div style={{ flex: 1, paddingRight: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#2b1b12', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {n.title}
                      {!n.isRead && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b37a4c', display: 'inline-block' }} />
                      )}
                    </div>

                    <div style={{ fontSize: 13, color: '#7a6758', marginTop: 2, lineHeight: 1.4 }}>
                      {n.message}
                    </div>

                    {/* Inline Admin Approval / Rejection Action for Leave Notifications */}
                    {isAdmin && n.leaveId && n.title.includes('New Leave Request') && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                        <button 
                          className="btn-success btn-sm" 
                          onClick={(e) => handleAdminLeaveAction(e, n.leaveId, 'Approved')}
                          disabled={actionLoadingId === n.leaveId}
                          style={{ padding: '4px 10px', fontSize: 11, gap: 4, borderRadius: 6 }}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button 
                          className="btn-danger btn-sm" 
                          onClick={(e) => handleAdminLeaveAction(e, n.leaveId, 'Rejected')}
                          disabled={actionLoadingId === n.leaveId}
                          style={{ padding: '4px 10px', fontSize: 11, gap: 4, borderRadius: 6 }}
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    )}

                    <div style={{ fontSize: 11, color: '#a39183', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                  </div>

                  {/* Single Item Action Delete Icon */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteTargetId(n.id); }} 
                    style={{ position: 'absolute', right: 10, top: 12, background: 'transparent', border: 'none', color: '#a39183', cursor: 'pointer', padding: 4 }}
                    title="Delete notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
