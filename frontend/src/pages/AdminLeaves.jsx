import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Filter } from 'lucide-react';
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

  useEffect(() => {
    load();
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

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Leave Approvals & Workflow</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Review pending employee leave requests, add feedback comments, and approve or reject
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff', border: '1px solid #eee5d8', padding: '6px 14px', borderRadius: 12 }}>
          <Filter size={16} color="#b37a4c" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: '#2b1b12', outline: 'none' }}>
            <option value="Pending">Pending Queue</option>
            <option value="Approved">Approved Requests</option>
            <option value="Rejected">Rejected Requests</option>
            <option value="All">All Requests</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginBottom: 18 }}>Leave Queue ({leaves.length})</h3>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Days</th>
                <th>Date Range</th>
                <th>Employee Remarks</th>
                <th>Status</th>
                <th>HR Feedback Comment</th>
                <th>Actions</th>
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
                          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#2b1b12' }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: '#7a6758' }}>{l.employeeId} &bull; {l.department || 'General'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-leave">{l.type}</span></td>
                    <td style={{ fontWeight: 700 }}>{l.daysCount || 1} day(s)</td>
                    <td style={{ fontSize: 13 }}>{l.startDate} &rarr; {l.endDate}</td>
                    <td style={{ maxWidth: 200, fontSize: 13, color: '#7a6758' }}>{l.remarks || '—'}</td>
                    <td>
                      <span className={`badge ${l.status === 'Approved' ? 'badge-approved' : l.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status === 'Pending' ? (
                        <input
                          placeholder="Add HR comment..."
                          value={comments[l.id] || ''}
                          onChange={(e) => setComments({ ...comments, [l.id]: e.target.value })}
                          style={{ width: 160, padding: '6px 10px', fontSize: 13 }}
                        />
                      ) : (
                        <span style={{ fontSize: 13, color: '#7a6758' }}>{l.adminComment || '—'}</span>
                      )}
                    </td>
                    <td>
                      {l.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            className="btn-primary btn-sm" 
                            disabled={busyId === l.id} 
                            onClick={() => decide(l.id, 'Approved')}
                            style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '6px 12px', fontSize: 12, gap: 4 }}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button 
                            className="btn-secondary btn-sm" 
                            disabled={busyId === l.id} 
                            onClick={() => decide(l.id, 'Rejected')}
                            style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '6px 12px', fontSize: 12, gap: 4 }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 14 }}>
                    No leave requests found matching filter "{filter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
