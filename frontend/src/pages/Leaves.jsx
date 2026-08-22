import { useEffect, useState } from 'react';
import { Calendar, Plus, Send, X, FileText, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export default function Leaves() {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({ paidLeaveRemaining: 12, sickLeaveRemaining: 8 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: 'Paid Leave',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    daysCount: 1,
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!token) return;
    try {
      const res = await api.getMyLeaves(token);
      setLeaves(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const calcDays = (start, end) => {
    if (!start || !end) return 1;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (d2 < d1) return 1;
    const diff = Math.abs(d2 - d1);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleStartDateChange = (val) => {
    const days = calcDays(val, form.endDate);
    setForm({ ...form, startDate: val, daysCount: days });
  };

  const handleEndDateChange = (val) => {
    const days = calcDays(form.startDate, val);
    setForm({ ...form, endDate: val, daysCount: days });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.applyLeave(token, form);
      setShowModal(false);
      showToast('Leave request submitted successfully.', 'success');
      setForm({
        type: 'Paid Leave',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        daysCount: 1,
        remarks: ''
      });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Leave Requests</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Manage your time-off requests and track approval statuses
          </p>
        </div>

        <button 
          className="btn-primary btn-sm" 
          onClick={() => setShowModal(true)}
          style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '10px 20px', gap: 8 }}
        >
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      {/* COMPACT SEGMENTED STAT BAR (SECTION 8 REQUIREMENT) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 20,
        padding: 20,
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        boxShadow: '0 2px 8px rgba(35, 23, 16, 0.04)'
      }}>
        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>PENDING</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>{pendingCount}</div>
          </div>
          <Clock size={24} color="#b37a4c" />
        </div>

        <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>APPROVED</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>{approvedCount}</div>
          </div>
          <CheckCircle2 size={24} color="#9c6137" />
        </div>

        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>REJECTED</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626', marginTop: 2 }}>{rejectedCount}</div>
          </div>
          <X size={24} color="#dc2626" />
        </div>
      </div>

      {/* REQUEST TABLE */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginBottom: 18 }}>My Submitted Leave Requests</h3>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Date Range</th>
                <th>Days</th>
                <th>Remarks</th>
                <th>Submitted Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700, color: '#2b1b12' }}>{l.type}</td>
                  <td style={{ fontSize: 13 }}>{l.startDate} &rarr; {l.endDate}</td>
                  <td style={{ fontWeight: 700 }}>{l.daysCount || 1} day(s)</td>
                  <td style={{ color: '#7a6758', fontSize: 13 }}>{l.remarks || '—'}</td>
                  <td style={{ fontSize: 13, color: '#7a6758' }}>{l.createdAt ? l.createdAt.slice(0, 10) : 'Today'}</td>
                  <td>
                    <span className={`badge ${l.status === 'Approved' ? 'badge-approved' : l.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}

              {leaves.length === 0 && (
                /* EMPTY STATE (SECTION 15 REQUIREMENT) */
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ background: '#fff4c2', color: '#b37a4c', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Calendar size={28} />
                    </div>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12' }}>No leave requests yet</h4>
                    <p className="muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}>
                      Your submitted leave requests and approval status will appear here.
                    </p>
                    <button className="btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                      <Plus size={14} /> Apply for Leave
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL (SECTION 9 REQUIREMENT) */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>Apply for Leave</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Leave Type</label>
              <select 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="Paid Leave">Paid Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                <div>
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => handleStartDateChange(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={form.endDate} 
                    onChange={e => handleEndDateChange(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <label style={{ marginTop: 14 }}>Number of Days</label>
              <input 
                type="number" 
                min="1" 
                max="30" 
                value={form.daysCount} 
                onChange={e => setForm({ ...form, daysCount: parseInt(e.target.value, 10) || 1 })} 
                required 
              />

              <label style={{ marginTop: 14 }}>Remarks / Reason</label>
              <textarea 
                rows="3" 
                value={form.remarks} 
                onChange={e => setForm({ ...form, remarks: e.target.value })} 
                placeholder="State the reason for your time-off request..." 
                required 
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ width: 'auto', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
