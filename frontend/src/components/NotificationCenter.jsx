import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function NotificationCenter() {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications(auth.token);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      // Ignore background errors
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [auth.token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async () => {
    try {
      await api.markNotificationsRead(auth.token);
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: 1 })));
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} color="#10b981" />;
      case 'warning': return <AlertTriangle size={18} color="#f59e0b" />;
      case 'danger': return <XCircle size={18} color="#ef4444" />;
      default: return <Info size={18} color="#3b82f6" />;
    }
  };

  return (
    <div className="notification-bell-container" ref={ref}>
      <button className="bell-btn" onClick={() => setOpen(!open)} title="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notif-header">
            <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
            {unreadCount > 0 && (
              <button className="btn-secondary btn-sm" onClick={handleMarkRead} style={{ padding: '4px 8px', fontSize: 12 }}>
                <CheckCheck size={14} /> Mark read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                  <div style={{ marginTop: 2 }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
