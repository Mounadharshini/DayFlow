import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Filter, ShieldCheck, RefreshCw, Eye, Check, X, ArrowUpRight } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function AdminLeaves() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [comments, setComments] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    if (!token) return;
    try {
      const res = await api.getAllLeaves(token, filter);
      setLeaves(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Real-Time Live Sync Polling Every 3 Seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [token, filter]);

  const decide = async (id, status) => {
    setBusyId(id);
    try {
      await api.updateLeave(token, id, { status, adminComment: comments[id] || '' });
      showToast(`Leave request ${status.toLowerCase()} successfully.`, status === 'Approved' ? 'success' : 'info');
      await load();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>HR Leave Approvals &amp; Queue 👑</h1>
          <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>
            Review pending employee leave requests, issue feedback comments, and approve or reject in real time
          </p>
        </div>

        <button className="btn-secondary btn-sm" onClick={load} style={{ gap: 6 }}>
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {/* 2-COLUMN SPLIT LAYOUT: LEFT TABLE FEED + RIGHT CONTROL SIDEBAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT MAIN QUEUE TABLE */}
        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 24, boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Leave Queue ({leaves.length})</h3>
              <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                Filter: <strong>{filter}</strong>
              </p>
            </div>
          </div>

          <div className="table-container" style={{ marginTop: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Days</th>
                  <th>Date Range</th>
                  <th>Status</th>
                  <th>HR Comment &amp; Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => {
                  const avatar = getAvatarUrl(l);
                  return (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img 
                            src={avatar} 
                            alt={l.name} 
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: '#2b1b12', fontSize: 13 }}>{l.name}</div>
                            <div style={{ fontSize: 11, color: '#7a6758' }}>{l.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-leave">{l.type}</span></td>
                      <td style={{ fontWeight: 700, fontSize: 13 }}>{l.daysCount || 1} d</td>
                      <td style={{ fontSize: 12 }}>{l.startDate} &rarr; {l.endDate}</td>
                      <td>
                        <span className={`badge ${l.status === 'Approved' ? 'badge-approved' : l.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === 'Pending' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <input
                              placeholder="Add HR comment..."
                              value={comments[l.id] || ''}
                              onChange={(e) => setComments({ ...comments, [l.id]: e.target.value })}
                              style={{ width: '100%', padding: '5px 8px', fontSize: 11 }}
                            />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button 
                                className="btn-primary btn-sm" 
                                disabled={busyId === l.id} 
                                onClick={() => decide(l.id, 'Approved')}
                                style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '4px 10px', fontSize: 11, gap: 4, flex: 1 }}
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button 
                                className="btn-secondary btn-sm" 
                                disabled={busyId === l.id} 
                                onClick={() => decide(l.id, 'Rejected')}
                                style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '4px 10px', fontSize: 11, gap: 4, flex: 1 }}
                              >
                                <X size={12} /> Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#7a6758' }}>{l.adminComment || '—'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 13 }}>
                      No leave requests match filter "{filter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR: QUICK FILTERS & CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Quick Filter Menu Card */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#2b1b12', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} color="#b37a4c" /> Filter Queue
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { key: 'Pending', label: 'Pending Queue' },
                { key: 'Approved', label: 'Approved Requests' },
                { key: 'Rejected', label: 'Rejected Requests' },
                { key: 'All', label: 'All Requests' },
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
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Card */}
          <div style={{ background: '#231710', color: 'white', borderRadius: 18, padding: 22, boxShadow: '0 8px 20px rgba(35, 23, 16, 0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#cc9966', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              HR Decision Center
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>
              Real-Time Approvals
            </div>
            <p style={{ fontSize: 12, color: '#d1c1b5', marginTop: 6, lineHeight: 1.4 }}>
              Approving a leave request updates the employee's attendance record and dispatches an instant real-time notification.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
