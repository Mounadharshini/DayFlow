import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Filter, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function AdminLeaves() {
  const { auth } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [comments, setComments] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = () => api.getAllLeaves(auth.token, filter).then(setLeaves);
  useEffect(() => { load(); }, [filter]);

  const decide = async (id, status) => {
    setBusyId(id);
    try {
      await api.updateLeave(auth.token, id, { status, adminComment: comments[id] || '' });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Leave Approvals & Workflow</h2>
            <p className="muted">Review pending employee leave requests, add feedback, and approve or reject.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Filter size={16} color="#64748b" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 160 }}>
              <option value="Pending">Pending Queue</option>
              <option value="Approved">Approved Requests</option>
              <option value="Rejected">Rejected Requests</option>
              <option value="All">All Requests</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="table-container">
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
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    {l.name}
                    <div style={{ fontSize: 12, color: '#64748b' }}>{l.employeeId} • {l.department || 'General'}</div>
                  </td>
                  <td><span className="badge badge-leave">{l.type}</span></td>
                  <td style={{ fontWeight: 700 }}>{l.daysCount || 1} day(s)</td>
                  <td>{l.startDate} → {l.endDate}</td>
                  <td style={{ maxWidth: 200, fontSize: 13 }}>{l.remarks || '—'}</td>
                  <td><Badge status={l.status} /></td>
                  <td>
                    {l.status === 'Pending' ? (
                      <input
                        placeholder="Add HR comment..."
                        value={comments[l.id] || ''}
                        onChange={(e) => setComments({ ...comments, [l.id]: e.target.value })}
                        style={{ width: 160, padding: 6, fontSize: 13 }}
                      />
                    ) : (
                      <span className="muted">{l.adminComment || '—'}</span>
                    )}
                  </td>
                  <td>
                    {l.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-success btn-sm" disabled={busyId === l.id} onClick={() => decide(l.id, 'Approved')}>
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button className="btn-danger btn-sm" disabled={busyId === l.id} onClick={() => decide(l.id, 'Rejected')}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 24 }}>No leave requests found matching filter "{filter}".</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
