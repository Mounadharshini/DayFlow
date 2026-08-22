import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Calendar, CreditCard, RefreshCw, CheckCheck, Sparkles } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All' | 'Attendance' | 'Leave' | 'Payroll' | 'System'
  const [message, setMessage] = useState('');

  const fetchNotifs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getNotifications(token);
      setNotifications(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
      setMessage('All notifications marked as read');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {}
  };

  const filtered = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Attendance') return n.title.toLowerCase().includes('attendance') || n.title.toLowerCase().includes('check');
    if (filter === 'Leave') return n.title.toLowerCase().includes('leave');
    if (filter === 'Payroll') return n.title.toLowerCase().includes('salary') || n.title.toLowerCase().includes('payroll');
    if (filter === 'System') return n.title.toLowerCase().includes('account') || n.title.toLowerCase().includes('system');
    return true;
  });

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Notifications Center</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            System updates, leave approval notifications, and workday alerts
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary btn-sm" onClick={fetchNotifs} disabled={loading} style={{ gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-primary btn-sm" onClick={handleMarkAllRead} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6 }}>
            <CheckCheck size={16} /> Mark All Read
          </button>
        </div>
      </div>

      {message && (
        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', color: '#9c6137', padding: '12px 18px', borderRadius: 12, fontWeight: 700, marginBottom: 20, fontSize: 13 }}>
          {message}
        </div>
      )}

      {/* Category Tabs */}
      <div className="tabs-header">
        {['All', 'Attendance', 'Leave', 'Payroll', 'System'].map(cat => (
          <button
            key={cat}
            className={`tab-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#7a6758', fontSize: 14 }}>
          Loading notifications...
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(n => (
            <div 
              key={n.id}
              style={{
                background: !n.isRead ? '#fff4c2' : '#ffffff',
                border: `1px solid ${!n.isRead ? '#eee5d8' : '#eee5d8'}`,
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                boxShadow: '0 2px 6px rgba(35, 23, 16, 0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                background: n.type === 'success' ? '#9c6137' : n.type === 'warning' ? '#cc9966' : '#b37a4c', 
                color: 'white', 
                width: 40, 
                height: 40, 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0 
              }}>
                {n.title.toLowerCase().includes('leave') ? <Calendar size={20} /> :
                 n.title.toLowerCase().includes('salary') ? <CreditCard size={20} /> :
                 <Bell size={20} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#2b1b12' }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 600 }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>

                <p style={{ color: '#7a6758', fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#ffffff', borderRadius: 20, border: '1px solid #eee5d8', margin: '20px 0' }}>
          <div style={{ background: '#fff4c2', color: '#b37a4c', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bell size={32} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>No notifications found</h3>
          <p className="muted" style={{ marginTop: 6, fontSize: 14, maxWidth: 400, margin: '6px auto 0' }}>
            You have no notifications in the <strong>{filter}</strong> category. New workday alerts will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
