import { useEffect, useState } from 'react';
import { CalendarDays, Send, AlertCircle, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Leaves() {
  const { auth } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({ paidLeaveRemaining: 12, sickLeaveRemaining: 8 });
  const [form, setForm] = useState({ type: 'Paid', startDate: '', endDate: '', remarks: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const res = await api.getMyLeaves(auth.token);
    setLeaves(res.leaves || []);
    if (res.balances) setBalances(res.balances);
  };

  useEffect(() => { loadData(); }, [auth.token]);

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const d1 = new Date(form.startDate);
    const d2 = new Date(form.endDate);
    if (d2 < d1) return 0;
    const diff = Math.abs(d2 - d1);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setSubmitting(true);
    try {
      await api.applyLeave(auth.token, form);
      setForm({ type: 'Paid', startDate: '', endDate: '', remarks: '' });
      setMessage('Leave request submitted successfully. HR Admin will review shortly.');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const daysRequested = calcDays();

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Leave & Time-Off</h2>
            <p className="muted">Request paid time off, sick leave, or view leave history.</p>
          </div>
        </div>

        {/* Leave Balances Header Cards */}
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 24 }}>
          <div className="card">
            <h3>Paid Leave Balance</h3>
            <div className="big" style={{ color: '#4f46e5' }}>{balances.paidLeaveRemaining} days</div>
            <p className="muted">Annual quota remaining</p>
          </div>
          <div className="card">
            <h3>Sick Leave Balance</h3>
            <div className="big" style={{ color: '#10b981' }}>{balances.sickLeaveRemaining} days</div>
            <p className="muted">Medical leave available</p>
          </div>
          <div className="card">
            <h3>Unpaid Leave</h3>
            <div className="big" style={{ color: '#f59e0b' }}>Unlimited</div>
            <p className="muted">Subject to HR approval</p>
          </div>
        </div>

        {/* Apply Form */}
        <div className="card" style={{ marginTop: 24, maxWidth: 600 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Apply for Leave</h3>
          {message && <div style={{ background: '#d1fae5', color: '#047857', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{message}</div>}
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Leave Category</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="Paid">Paid Leave (Deducted from Paid quota)</option>
              <option value="Sick">Sick Leave (Deducted from Sick quota)</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label>Start Date</label>
                <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label>End Date</label>
                <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            {daysRequested > 0 && (
              <div style={{ background: '#eef2ff', color: '#4338ca', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginTop: 12 }}>
                Total duration requested: {daysRequested} day(s)
              </div>
            )}

            <label>Reason / Remarks</label>
            <textarea rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Reason for time off..." />

            <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 20 }}>
              {submitting ? 'Submitting...' : <><Send size={16} /> Submit Leave Request</>}
            </button>
          </form>
        </div>

        {/* Requests History */}
        <h3 className="section-title">My Leave History</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Type</th><th>Duration</th><th>Dates</th><th>Remarks</th><th>Status</th><th>HR Comment</th></tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700 }}>{l.type} Leave</td>
                  <td>{l.daysCount || 1} day(s)</td>
                  <td>{l.startDate} → {l.endDate}</td>
                  <td>{l.remarks || '—'}</td>
                  <td><Badge status={l.status} /></td>
                  <td className="muted">{l.adminComment || '—'}</td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>No leave requests submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
