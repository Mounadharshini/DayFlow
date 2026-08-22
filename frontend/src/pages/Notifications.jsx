import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, AlertCircle, Info, Calendar, CreditCard, RefreshCw, 
  CheckCheck, Sparkles, Trash2, Check, X, Eye, ShieldCheck, AlertTriangle,
  ChevronRight, Filter, Layers, Clock, ArrowUpRight, User, Mail, MessageSquare
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
  const [filter, setFilter] = useState('All'); // 'All' | 'Unread' | 'Leave' | 'Attendance' | 'Profile' | 'Support'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [adminComments, setAdminComments] = useState({});

  // Review Inspector Modal State
  const [selectedNotif, setSelectedNotif] = useState(null);

  // Double Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    leaveId: null,
    status: null,
    notifId: null,
    comment: ''
  });

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
    if (e) e.stopPropagation();
    try {
      await api.markNotificationRead(activeToken, notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  // Confirm & Delete Single Notification Permanently
  const confirmDeleteSingle = async () => {
    if (!deleteTargetId) return;
    const targetId = deleteTargetId;
    setDeleteTargetId(null);
    if (selectedNotif?.id === targetId) setSelectedNotif(null);

    saveDeletedId(targetId);

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

  // Confirm & Clear All Notifications Permanently
  const confirmClearAll = async () => {
    setShowClearAllModal(false);
    setSelectedNotif(null);
    setIsClearedAll();

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

  const requestLeaveActionConfirmation = (e, leaveId, status, notifId) => {
    if (e) e.stopPropagation();
    if (!leaveId) return;
    setConfirmModal({
      open: true,
      leaveId,
      status,
      notifId,
      comment: adminComments[leaveId] || ''
    });
  };

  const executeAdminLeaveAction = async () => {
    const { leaveId, status, notifId, comment } = confirmModal;
    if (!leaveId || !status) return;

    setConfirmModal({ open: false, leaveId: null, status: null, notifId: null, comment: '' });
    setActionLoadingId(leaveId);

    try {
      await api.updateLeave(activeToken, leaveId, { status, adminComment: comment });
      if (notifId) {
        await api.markNotificationRead(activeToken, notifId);
      }
      showToast(`Leave request ${status.toLowerCase()} successfully! Employee notified.`, status === 'Approved' ? 'success' : 'info');
      setSelectedNotif(null);
      await fetchNotifs();
    } catch (err) {
      showToast(err.message || 'Leave decision update failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReviewModal = (n) => {
    if (!n.isRead) {
      handleMarkSingleRead(null, n.id);
    }
    setSelectedNotif(n);
  };

  const filtered = notifications.filter(n => {
    const t = (n.title || '').toLowerCase();
    const m = (n.message || '').toLowerCase();
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Leave') return t.includes('leave') || m.includes('leave');
    if (filter === 'Attendance') return t.includes('attendance') || t.includes('check') || m.includes('clock');
    if (filter === 'Profile') return t.includes('profile') || m.includes('profile');
    if (filter === 'Support') return t.includes('support') || t.includes('contact') || m.includes('inquiry');
    return true;
  });

  const leaveCount = notifications.filter(n => (n.title || '').toLowerCase().includes('leave')).length;
  const attendanceCount = notifications.filter(n => (n.title || '').toLowerCase().includes('attendance') || (n.title || '').toLowerCase().includes('check')).length;
  const profileCount = notifications.filter(n => (n.title || '').toLowerCase().includes('profile')).length;
  const supportCount = notifications.filter(n => (n.title || '').toLowerCase().includes('support') || (n.title || '').toLowerCase().includes('contact')).length;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* DOUBLE CONFIRMATION MODAL FOR APPROVAL / REJECTION */}
      {confirmModal.open && (
        <div className="modal-backdrop" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, borderRadius: 20, textAlign: 'center' }}>
            <div style={{
              background: confirmModal.status === 'Approved' ? '#fff4c2' : '#fee2e2',
              color: confirmModal.status === 'Approved' ? '#9c6137' : '#dc2626',
              width: 54,
              height: 54,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              {confirmModal.status === 'Approved' ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
            </div>

            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#2b1b12', margin: 0 }}>
              Confirm Leave {confirmModal.status}?
            </h3>

            <p className="muted" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              Are you sure you want to <strong>{confirmModal.status?.toUpperCase()}</strong> this leave request? This will update the database and send a notification to the employee.
            </p>

            {confirmModal.comment && (
              <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 10, borderRadius: 10, fontSize: 12, color: '#7a6758', marginTop: 12, textAlign: 'left' }}>
                <strong>HR Comment:</strong> {confirmModal.comment}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22 }}>
              <button 
                className="btn-secondary" 
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={executeAdminLeaveAction}
                style={{ 
                  flex: 1, 
                  background: confirmModal.status === 'Approved' ? 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' : '#dc2626' 
                }}
              >
                Confirm {confirmModal.status}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ADMIN NOTIFICATION VIEW & REVIEW MODAL */}
      {selectedNotif && (
        <div className="modal-backdrop" onClick={() => setSelectedNotif(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, borderRadius: 20 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#fff4c2', color: '#9c6137', padding: 8, borderRadius: 10 }}>
                  <Bell size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>
                    {selectedNotif.title}
                  </h3>
                  <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {selectedNotif.createdAt ? new Date(selectedNotif.createdAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' }) : 'Just now'}
                  </p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedNotif(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', borderRadius: 14, padding: 18, margin: '14px 0 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', marginBottom: 6 }}>
                NOTIFICATION DETAILS &amp; REQUEST CONTENT
              </div>
              <p style={{ color: '#2b1b12', fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                {selectedNotif.message}
              </p>
            </div>

            {/* ACTION SUITE FOR PENDING LEAVE REQUEST NOTIFICATIONS */}
            {isAdmin && selectedNotif.leaveId && selectedNotif.title.includes('New Leave Request') ? (
              <div style={{ background: '#ffffff', border: '1px solid #cc9966', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#9c6137', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} /> Take Instant Admin Action
                </div>

                <label style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', marginBottom: 4, display: 'block' }}>HR Admin Comment (Optional):</label>
                <input 
                  placeholder="Enter HR approval/rejection comment..."
                  value={adminComments[selectedNotif.leaveId] || ''}
                  onChange={(e) => setAdminComments({ ...adminComments, [selectedNotif.leaveId]: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', fontSize: 13, marginBottom: 14 }}
                />

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={(e) => requestLeaveActionConfirmation(e, selectedNotif.leaveId, 'Rejected', selectedNotif.id)}
                    disabled={actionLoadingId === selectedNotif.leaveId}
                    style={{ color: '#dc2626', borderColor: '#fca5a5', gap: 6, padding: '6px 14px', fontSize: 12 }}
                  >
                    <X size={14} /> Reject Request
                  </button>
                  <button 
                    className="btn-primary btn-sm"
                    onClick={(e) => requestLeaveActionConfirmation(e, selectedNotif.leaveId, 'Approved', selectedNotif.id)}
                    disabled={actionLoadingId === selectedNotif.leaveId}
                    style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6, padding: '6px 14px', fontSize: 12 }}
                  >
                    <Check size={14} /> Approve Request
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn-secondary btn-sm" onClick={() => setDeleteTargetId(selectedNotif.id)}>
                  <Trash2 size={14} /> Delete
                </button>
                <button className="btn-primary btn-sm" onClick={() => setSelectedNotif(null)} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>
              {isAdmin ? 'ElyVia HR Admin Notifications 👑' : 'Notifications Center'}
            </h1>
            {unreadCount > 0 && (
              <span style={{ background: '#b37a4c', color: 'white', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999 }}>
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            {isAdmin 
              ? 'Real-time database feed for employee leave requests, attendance logs, profile updates, and inquiries'
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
                  onClick={() => handleOpenReviewModal(n)}
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
                        {(n.title || '').toLowerCase().includes('leave') ? <Calendar size={19} /> :
                         (n.title || '').toLowerCase().includes('salary') ? <CreditCard size={19} /> :
                         (n.title || '').toLowerCase().includes('profile') ? <User size={19} /> :
                         (n.title || '').toLowerCase().includes('support') ? <MessageSquare size={19} /> :
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

                    {/* Top Right Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button 
                        className="btn-secondary btn-sm" 
                        onClick={() => handleOpenReviewModal(n)}
                        style={{ padding: '5px 10px', fontSize: 11, gap: 4 }}
                      >
                        <Eye size={13} /> View / Review
                      </button>
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
                            onClick={(e) => requestLeaveActionConfirmation(e, n.leaveId, 'Approved', n.id)}
                            disabled={actionLoadingId === n.leaveId}
                            style={{ padding: '5px 12px', fontSize: 11, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 4, borderRadius: 6 }}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button 
                            className="btn-secondary btn-sm" 
                            onClick={(e) => requestLeaveActionConfirmation(e, n.leaveId, 'Rejected', n.id)}
                            disabled={actionLoadingId === n.leaveId}
                            style={{ padding: '5px 12px', fontSize: 11, color: '#dc2626', borderColor: '#fca5a5', gap: 4, borderRadius: 6 }}
                          >
                            <X size={13} /> Reject
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
                { key: 'Profile', label: 'Profile Updates', count: profileCount },
                { key: 'Support', label: 'Support Inquiries', count: supportCount },
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
