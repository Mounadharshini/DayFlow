import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, AlertCircle, Info, Calendar, CreditCard, RefreshCw, 
  CheckCheck, Sparkles, Trash2, Check, X, Eye, ShieldCheck, AlertTriangle,
  ChevronRight, Filter, Layers, Clock, ArrowUpRight
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export default function Notifications() {
  const { auth, user, token } = useAuth();
  const activeUser = user || auth?.user;
  const activeToken = token || auth?.token;
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All' | 'Unread' | 'Leave' | 'Attendance' | 'System'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [adminComments, setAdminComments] = useState({});

  // Confirmation Modals State
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const navigate = useNavigate();
  const isAdmin = activeUser?.role === 'Admin';

  const userIdKey = activeUser?.id ? String(activeUser.id) : 'guest';

  // Retrieve stored deleted IDs & clear status from localStorage
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

  const fetchNotifs = async () => {
    if (!activeToken) return;
    try {
      const data = await api.getNotifications(activeToken);
      const clearedTime = getIsClearedAll();
      const deletedSet = getDeletedIdsSet();

      let rawNotifs = data.notifications || [];

      // Filter out notifications created BEFORE clear-all action or explicitly deleted
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Fast Sync Polling Every 2 Seconds
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 2000);
    return () => clearInterval(interval);
  }, [activeToken]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead(activeToken);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'info');
    } catch (e) {}
  };

  const handleMarkSingleRead = async (e, notifId) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(activeToken, notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  // Confirm & Delete Single Notification Permanently (with localStorage & DB persistence)
  const confirmDeleteSingle = async () => {
    if (!deleteTargetId) return;
    const targetId = deleteTargetId;
    setDeleteTargetId(null);

    // Save in localStorage so navigation away and back NEVER restores it
    saveDeletedId(targetId);

    // Optimistically update local state immediately
    const target = notifications.find(n => n.id === targetId);
    setNotifications(prev => prev.filter(n => String(n.id) !== String(targetId)));
    if (target && !target.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    showToast('Notification deleted permanently', 'info');

    try {
      if (activeToken) {
        await api.deleteNotification(activeToken, targetId);
      }
    } catch (e) {
      console.error('API delete warning:', e);
    }
  };

  // Confirm & Clear All Notifications Permanently (with localStorage & DB persistence)
  const confirmClearAll = async () => {
    setShowClearAllModal(false);

    // Set cleared flag in localStorage so navigation away and back NEVER restores old items
    setIsClearedAll();

    // Optimistically update local state immediately
    setNotifications([]);
    setUnreadCount(0);
    showToast('All notifications cleared permanently', 'success');

    try {
      if (activeToken) {
        await api.clearAllNotifications(activeToken);
      }
    } catch (e) {
      console.error('API clear all warning:', e);
    }
  };

  const handleAdminLeaveAction = async (e, leaveId, status, notifId) => {
    e.stopPropagation();
    if (!leaveId) return;
    setActionLoadingId(leaveId);
    try {
      const comment = adminComments[leaveId] || '';
      await api.updateLeave(activeToken, leaveId, { status, adminComment: comment });
      if (notifId) {
        await api.markNotificationRead(activeToken, notifId);
      }
      showToast(`Leave request ${status.toLowerCase()} successfully! Real-time notification sent.`, status === 'Approved' ? 'success' : 'info');
      await fetchNotifs();
    } catch (err) {
      showToast(err.message || 'Leave decision update failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleNotificationCardClick = (n) => {
    if (!n.isRead) {
      api.markNotificationRead(activeToken, n.id).catch(() => {});
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: 1 } : item));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (n.leaveId || n.title.toLowerCase().includes('leave')) {
      navigate(isAdmin ? '/admin/leaves' : '/leaves');
    } else if (n.title.toLowerCase().includes('attendance') || n.title.toLowerCase().includes('check')) {
      navigate(isAdmin ? '/admin/attendance' : '/attendance');
    } else if (n.title.toLowerCase().includes('salary') || n.title.toLowerCase().includes('payroll')) {
      navigate(isAdmin ? '/admin/payroll' : '/payroll');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Leave') return n.title.toLowerCase().includes('leave');
    if (filter === 'Attendance') return n.title.toLowerCase().includes('attendance') || n.title.toLowerCase().includes('check');
    if (filter === 'System') return n.title.toLowerCase().includes('account') || n.title.toLowerCase().includes('system');
    return true;
  });

  const leaveCount = notifications.filter(n => n.title.toLowerCase().includes('leave')).length;
  const attendanceCount = notifications.filter(n => n.title.toLowerCase().includes('attendance') || n.title.toLowerCase().includes('check')).length;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Delete Single Item Confirmation Modal */}
      {deleteTargetId && (
        <div className="modal-backdrop" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, borderRadius: 20 }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertTriangle size={26} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#2b1b12' }}>Delete Notification?</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                Are you sure you want to delete this notification? This action cannot be undone.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                <button className="btn-secondary" onClick={() => setDeleteTargetId(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={confirmDeleteSingle} style={{ flex: 1, background: '#dc2626' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="modal-backdrop" onClick={() => setShowClearAllModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, borderRadius: 20 }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={26} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#2b1b12' }}>Clear All Notifications?</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                Are you sure you want to clear <strong>ALL ({notifications.length})</strong> notifications from your inbox? This will permanently remove all workday alerts.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                <button className="btn-secondary" onClick={() => setShowClearAllModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={confirmClearAll} style={{ flex: 1, background: '#dc2626' }}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>
              {isAdmin ? 'HR Admin Notification Center 👑' : 'Notifications Center'}
            </h1>
            {unreadCount > 0 && (
              <span style={{ background: '#b37a4c', color: 'white', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999 }}>
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            {isAdmin 
              ? 'Manage real-time employee leave requests, workday alerts, and administrative notifications'
              : 'Track workday updates, leave request approval status, and organizational alerts in real time'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-secondary btn-sm" onClick={fetchNotifs} disabled={loading} style={{ gap: 6 }}>
            <RefreshCw size={14} /> Refresh Sync
          </button>
          {unreadCount > 0 && (
            <button className="btn-secondary btn-sm" onClick={handleMarkAllRead} style={{ gap: 6 }}>
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn-danger btn-sm" onClick={() => setShowClearAllModal(true)} style={{ padding: '8px 14px', gap: 6, borderRadius: 10, fontWeight: 700, background: '#dc2626' }}>
              <Trash2 size={15} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* 2-COLUMN SPLIT SIDE-BY-SIDE LAYOUT WITH PERFECT ALIGNMENT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT MAIN STREAM: NOTIFICATIONS FEED */}
        <div>
          {loading ? (
            <div style={{ background: '#ffffff', borderRadius: 18, border: '1px solid #eee5d8', padding: 40, textAlign: 'center', color: '#7a6758', fontSize: 14 }}>
              Syncing real-time notifications...
            </div>
          ) : filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationCardClick(n)}
                  style={{
                    background: !n.isRead ? '#fff4c2' : '#ffffff',
                    border: `1px solid ${!n.isRead ? '#cc9966' : '#eee5d8'}`,
                    borderRadius: 18,
                    padding: '20px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: !n.isRead ? '0 4px 14px rgba(204, 153, 102, 0.12)' : '0 2px 6px rgba(35, 23, 16, 0.03)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  {/* Card Header Row: Icon, Title, Badge, Time & Action Icons */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ 
                        background: n.type === 'success' ? '#9c6137' : n.type === 'warning' ? '#cc9966' : n.type === 'danger' ? '#dc2626' : '#b37a4c', 
                        color: 'white', 
                        width: 40, 
                        height: 40, 
                        borderRadius: 12, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0 
                      }}>
                        {n.title.toLowerCase().includes('leave') ? <Calendar size={19} /> :
                         n.title.toLowerCase().includes('salary') ? <CreditCard size={19} /> :
                         <Bell size={19} />}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#2b1b12', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {n.title}
                          {!n.isRead && (
                            <span style={{ background: '#b37a4c', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                              NEW
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 500, marginTop: 2 }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now'}
                        </div>
                      </div>
                    </div>

                    {/* Top Right Action Icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                      {!n.isRead && (
                        <button 
                          className="btn-secondary btn-sm" 
                          onClick={(e) => handleMarkSingleRead(e, n.id)} 
                          style={{ padding: '5px 8px', fontSize: 11, borderRadius: 8 }}
                          title="Mark as read"
                        >
                          <CheckCheck size={14} color="#b37a4c" />
                        </button>
                      )}
                      <button 
                        className="btn-secondary btn-sm" 
                        onClick={(e) => { e.stopPropagation(); setDeleteTargetId(n.id); }} 
                        style={{ padding: '5px 8px', fontSize: 11, color: '#dc2626', borderRadius: 8 }}
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card Message Body */}
                  <p style={{ color: '#524336', fontSize: 14, lineHeight: 1.55, margin: 0, paddingLeft: 54 }}>
                    {n.message}
                  </p>

                  {/* HR ADMIN ACTION SUITE FOR LEAVE NOTIFICATIONS */}
                  {isAdmin && n.leaveId && n.title.includes('New Leave Request') && (
                    <div 
                      style={{ 
                        marginTop: 6, 
                        marginLeft: 54,
                        padding: 14, 
                        background: '#fdfaf6', 
                        borderRadius: 12, 
                        border: '1px solid #eee5d8',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#b37a4c', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={14} /> HR Admin Instant Decision Action
                      </div>

                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                          placeholder="Add HR comment (optional)..."
                          value={adminComments[n.leaveId] || ''}
                          onChange={(e) => setAdminComments({ ...adminComments, [n.leaveId]: e.target.value })}
                          style={{ flex: 1, minWidth: 200, padding: '7px 12px', fontSize: 12, background: '#ffffff', borderRadius: 8 }}
                        />

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn-primary btn-sm" 
                            onClick={(e) => handleAdminLeaveAction(e, n.leaveId, 'Approved', n.id)}
                            disabled={actionLoadingId === n.leaveId}
                            style={{ padding: '7px 14px', fontSize: 12, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 5, borderRadius: 8 }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            className="btn-secondary btn-sm" 
                            onClick={(e) => handleAdminLeaveAction(e, n.leaveId, 'Rejected', n.id)}
                            disabled={actionLoadingId === n.leaveId}
                            style={{ padding: '7px 14px', fontSize: 12, color: '#dc2626', borderColor: '#fca5a5', gap: 5, borderRadius: 8 }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#ffffff', borderRadius: 20, border: '1px solid #eee5d8' }}>
              <div style={{ background: '#fff4c2', color: '#b37a4c', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Bell size={28} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12' }}>No notifications found</h3>
              <p className="muted" style={{ marginTop: 4, fontSize: 13, maxWidth: 360, margin: '4px auto 0' }}>
                You have no notifications under filter "<strong>{filter}</strong>". Real-time alerts will appear here automatically.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: QUICK FILTERS & CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Quick Filter Menu Card */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#2b1b12', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} color="#b37a4c" /> Filter Notifications
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { key: 'All', label: 'All Notifications', count: notifications.length },
                { key: 'Unread', label: 'Unread Messages', count: unreadCount },
                { key: 'Leave', label: 'Leave Requests', count: leaveCount },
                { key: 'Attendance', label: 'Attendance Alerts', count: attendanceCount },
                { key: 'System', label: 'System Updates', count: notifications.filter(n => n.title.toLowerCase().includes('system') || n.title.toLowerCase().includes('account')).length },
              ].map(item => (
                <div 
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: 10, 
                    cursor: 'pointer',
                    background: filter === item.key ? '#fff4c2' : 'transparent',
                    border: `1px solid ${filter === item.key ? '#cc9966' : 'transparent'}`,
                    fontWeight: filter === item.key ? 800 : 600,
                    fontSize: 13,
                    color: filter === item.key ? '#9c6137' : '#7a6758',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ 
                    background: filter === item.key ? '#b37a4c' : '#fdfaf6', 
                    color: filter === item.key ? 'white' : '#7a6758',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999 
                  }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics & Actions Card */}
          <div style={{ background: '#231710', color: 'white', borderRadius: 18, padding: 22, boxShadow: '0 8px 20px rgba(35, 23, 16, 0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#cc9966', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real-Time Inbox Status
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
              {unreadCount} <span style={{ fontSize: 13, fontWeight: 600, color: '#d1c1b5' }}>Unread Alerts</span>
            </div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {unreadCount > 0 && (
                <button 
                  className="btn-primary btn-sm" 
                  onClick={handleMarkAllRead} 
                  style={{ width: '100%', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6, fontSize: 12, padding: '9px 14px' }}
                >
                  <CheckCheck size={14} /> Mark All as Read
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  className="btn-secondary btn-sm" 
                  onClick={() => setShowClearAllModal(true)} 
                  style={{ width: '100%', color: '#fca5a5', borderColor: 'rgba(252, 165, 165, 0.3)', background: 'rgba(220, 38, 38, 0.15)', gap: 6, fontSize: 12, padding: '9px 14px' }}
                >
                  <Trash2 size={14} /> Clear All Notifications
                </button>
              )}
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#2b1b12', marginBottom: 12 }}>
              {isAdmin ? 'HR Administration Shortcuts' : 'Workspace Shortcuts'}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isAdmin ? (
                <>
                  <div 
                    onClick={() => navigate('/admin/leaves')}
                    style={{ padding: '10px 12px', background: '#fdfaf6', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#2b1b12' }}
                  >
                    <span>Leave Approvals Queue</span>
                    <ArrowUpRight size={15} color="#b37a4c" />
                  </div>
                  <div 
                    onClick={() => navigate('/admin/employees')}
                    style={{ padding: '10px 12px', background: '#fdfaf6', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#2b1b12' }}
                  >
                    <span>Employee Roster</span>
                    <ArrowUpRight size={15} color="#b37a4c" />
                  </div>
                  <div 
                    onClick={() => navigate('/admin/attendance')}
                    style={{ padding: '10px 12px', background: '#fdfaf6', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#2b1b12' }}
                  >
                    <span>Workforce Attendance</span>
                    <ArrowUpRight size={15} color="#b37a4c" />
                  </div>
                </>
              ) : (
                <>
                  <div 
                    onClick={() => navigate('/leaves')}
                    style={{ padding: '10px 12px', background: '#fdfaf6', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#2b1b12' }}
                  >
                    <span>Apply for Leave</span>
                    <ArrowUpRight size={15} color="#b37a4c" />
                  </div>
                  <div 
                    onClick={() => navigate('/attendance')}
                    style={{ padding: '10px 12px', background: '#fdfaf6', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#2b1b12' }}
                  >
                    <span>Check In / Check Out</span>
                    <ArrowUpRight size={15} color="#b37a4c" />
                  </div>
                  <div 
                    onClick={() => navigate('/payroll')}
                    style={{ padding: '10px 12px', background: '#fdfaf6', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#2b1b12' }}
                  >
                    <span>My Salary &amp; Paystub</span>
                    <ArrowUpRight size={15} color="#b37a4c" />
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
