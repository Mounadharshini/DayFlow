import { useEffect, useState } from 'react';
import { 
  Calendar, Plus, Send, X, FileText, CheckCircle2, Clock, 
  AlertCircle, ShieldCheck, RefreshCw, Filter, Eye, ChevronRight, Info,
  Check, XCircle, ArrowUpRight
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export default function Leaves() {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({ paidLeaveRemaining: 12, sickLeaveRemaining: 8 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // Modals state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [form, setForm] = useState({
    type: 'Paid',
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
      setLeaves(res.leaves || res || []);
      if (res.balances) {
        setBalances(res.balances);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Fast Sync Polling Every 2 Seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
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
      const payloadType = form.type.replace(' Leave', '');
      await api.applyLeave(token, { ...form, type: payloadType });
      setShowApplyModal(false);
      showToast('Leave request submitted to HR Admin in real time!', 'success');
      setForm({
        type: 'Paid',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        daysCount: 1,
        remarks: ''
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;
  const totalDaysTaken = leaves
    .filter(l => l.status === 'Approved')
    .reduce((sum, l) => sum + (l.daysCount || 1), 0);

  const filteredLeaves = leaves.filter(l => {
    if (activeFilter === 'All') return true;
    return l.status === activeFilter;
  });

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* View Request Details Modal */}
      {selectedLeave && (
        <div className="modal-backdrop" onClick={() => setSelectedLeave(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, borderRadius: 20, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #eee5d8', paddingBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: '#2b1b12' }}>Leave Request Details</h3>
                <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Request ID: #{selectedLeave.id}</div>
              </div>
              <button className="close-btn" onClick={() => setSelectedLeave(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdfaf6', padding: 14, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>LEAVE TYPE</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{selectedLeave.type} Leave</div>
                </div>
                <span className={`badge ${selectedLeave.status === 'Approved' ? 'badge-approved' : selectedLeave.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                  {selectedLeave.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758' }}>START DATE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2b1b12', marginTop: 2 }}>{selectedLeave.startDate}</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758' }}>END DATE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2b1b12', marginTop: 2 }}>{selectedLeave.endDate}</div>
                </div>
              </div>

              <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 12, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#9c6137' }}>TOTAL DURATION</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#9c6137' }}>{selectedLeave.daysCount || 1} Day(s)</span>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', marginBottom: 4 }}>EMPLOYEE REMARKS</div>
                <div style={{ fontSize: 13, color: '#2b1b12', background: '#fdfaf6', padding: 12, borderRadius: 10, border: '1px solid #eee5d8', lineHeight: 1.5 }}>
                  {selectedLeave.remarks || 'No remarks provided.'}
                </div>
              </div>

              {selectedLeave.adminComment && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#b37a4c', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={14} /> HR ADMIN COMMENT
                  </div>
                  <div style={{ fontSize: 13, color: '#2b1b12', background: '#fff4c2', padding: 12, borderRadius: 10, border: '1px solid #cc9966', lineHeight: 1.5 }}>
                    {selectedLeave.adminComment}
                  </div>
                </div>
              )}

              <div style={{ fontSize: 11, color: '#7a6758', textAlign: 'right', marginTop: 4 }}>
                Submitted: {selectedLeave.createdAt ? new Date(selectedLeave.createdAt).toLocaleString() : 'Recently'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-backdrop" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, borderRadius: 20 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: '#2b1b12' }}>Apply for Time-Off</h3>
                <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>Submit leave request for HR Admin approval</p>
              </div>
              <button className="close-btn" onClick={() => setShowApplyModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-msg" style={{ marginBottom: 14, fontSize: 12 }}>{error}</div>}

              <label>Leave Type</label>
              <select 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="Paid">Paid Leave ({balances.paidLeaveRemaining || 0} days available)</option>
                <option value="Sick">Sick Leave ({balances.sickLeaveRemaining || 0} days available)</option>
                <option value="Unpaid">Unpaid Leave (Unlimited)</option>
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
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

              {/* Automatic Calculated Duration Badge */}
              <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: '10px 14px', borderRadius: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#9c6137' }}>Calculated Duration:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#9c6137' }}>{form.daysCount} Day(s)</span>
              </div>

              <label style={{ marginTop: 12 }}>Reason / Remarks</label>
              <textarea 
                rows="3" 
                value={form.remarks} 
                onChange={e => setForm({ ...form, remarks: e.target.value })} 
                placeholder="State the reason for your time-off request..." 
                required 
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowApplyModal(false)} style={{ padding: '7px 12px', fontSize: 12 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm" disabled={submitting} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '7px 16px', fontSize: 12 }}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Leave &amp; Time-Off Management</h1>
          <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>
            Track your leave balance, submit time-off requests, and view real-time HR approval statuses
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-secondary btn-sm" onClick={loadData} disabled={loading} style={{ gap: 6, padding: '6px 12px', fontSize: 12 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button 
            className="btn-primary btn-sm" 
            onClick={() => setShowApplyModal(true)}
            style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '6px 14px', gap: 5, borderRadius: 8, fontWeight: 700, fontSize: 12 }}
          >
            <Plus size={14} /> Apply Leave
          </button>
        </div>
      </div>

      {/* COMPACT LEAVE BALANCE & STATUS METRICS GRID */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 18,
        padding: 20,
        marginBottom: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)'
      }}>
        {/* Paid Leave Balance */}
        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: '16px 18px', borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>PAID LEAVE BALANCE</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
            {balances.paidLeaveRemaining || 0} <span style={{ fontSize: 13, fontWeight: 600, color: '#7a6758' }}>/ 12 Days</span>
          </div>
          <div style={{ fontSize: 11, color: '#7a6758', marginTop: 2 }}>Annual paid allowance</div>
        </div>

        {/* Sick Leave Balance */}
        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: '16px 18px', borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>SICK LEAVE BALANCE</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>
            {balances.sickLeaveRemaining || 0} <span style={{ fontSize: 13, fontWeight: 600, color: '#7a6758' }}>/ 8 Days</span>
          </div>
          <div style={{ fontSize: 11, color: '#7a6758', marginTop: 2 }}>Medical &amp; sick allowance</div>
        </div>

        {/* Pending Requests */}
        <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: '16px 18px', borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>PENDING HR APPROVAL</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>
            {pendingCount} <span style={{ fontSize: 13, fontWeight: 600, color: '#7a6758' }}>Requests</span>
          </div>
          <div style={{ fontSize: 11, color: '#7a6758', marginTop: 2 }}>Awaiting HR decision</div>
        </div>

        {/* Approved Days Taken */}
        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: '16px 18px', borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>APPROVED DAYS TAKEN</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
            {totalDaysTaken} <span style={{ fontSize: 13, fontWeight: 600, color: '#7a6758' }}>Days</span>
          </div>
          <div style={{ fontSize: 11, color: '#7a6758', marginTop: 2 }}>Total approved time-off</div>
        </div>
      </div>

      {/* 2-COLUMN SPLIT LAYOUT: LEFT TABLE FEED + RIGHT CONTROL SIDEBAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT STREAM: LEAVE REQUESTS TABLE */}
        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 24, boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Leave History &amp; Approval Requests</h3>
              <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                Showing <strong>{activeFilter}</strong> requests ({filteredLeaves.length})
              </p>
            </div>
          </div>

          <div className="table-container" style={{ marginTop: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date Range</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>HR Feedback</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 800, color: '#2b1b12' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ background: '#fff4c2', color: '#b37a4c', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Calendar size={15} />
                        </div>
                        <span>{l.type}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 600, color: '#2b1b12' }}>
                      {l.startDate} <span style={{ color: '#7a6758', margin: '0 2px' }}>&rarr;</span> {l.endDate}
                    </td>
                    <td style={{ fontWeight: 700, color: '#b37a4c', fontSize: 13 }}>
                      {l.daysCount || 1} d
                    </td>
                    <td>
                      <span className={`badge ${l.status === 'Approved' ? 'badge-approved' : l.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#7a6758', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.adminComment ? `💬 ${l.adminComment}` : '—'}
                    </td>
                    <td>
                      <button 
                        className="btn-secondary btn-sm" 
                        onClick={() => setSelectedLeave(l)}
                        style={{ padding: '4px 10px', fontSize: 12, gap: 4, borderRadius: 7 }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredLeaves.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 24px' }}>
                      <div style={{ background: '#fff4c2', color: '#b37a4c', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <Calendar size={20} />
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: '#2b1b12', margin: 0 }}>No leave records found</h4>
                      <p className="muted" style={{ fontSize: 12, marginTop: 4, marginBottom: 14 }}>
                        No time-off requests match filter "<strong>{activeFilter}</strong>".
                      </p>
                      <button 
                        className="btn-primary btn-sm" 
                        onClick={() => setShowApplyModal(true)} 
                        style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '6px 14px', borderRadius: 8, fontSize: 12, width: 'auto', display: 'inline-flex' }}
                      >
                        <Plus size={14} /> Apply for Leave
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR: QUICK FILTERS & NAVIGATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Quick Filter Menu Card */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#2b1b12', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} color="#b37a4c" /> Filter Requests
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { key: 'All', label: 'All Requests', count: leaves.length },
                { key: 'Pending', label: 'Pending Approval', count: pendingCount },
                { key: 'Approved', label: 'Approved Leaves', count: approvedCount },
                { key: 'Rejected', label: 'Rejected Requests', count: rejectedCount },
              ].map(item => (
                <div 
                  key={item.key}
                  onClick={() => setActiveFilter(item.key)}
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: 10, 
                    cursor: 'pointer',
                    background: activeFilter === item.key ? '#fff4c2' : 'transparent',
                    border: `1px solid ${activeFilter === item.key ? '#cc9966' : 'transparent'}`,
                    fontWeight: activeFilter === item.key ? 800 : 600,
                    fontSize: 13,
                    color: activeFilter === item.key ? '#9c6137' : '#7a6758',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ 
                    background: activeFilter === item.key ? '#b37a4c' : '#fdfaf6', 
                    color: activeFilter === item.key ? 'white' : '#7a6758',
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

          {/* Apply Leave Action Card */}
          <div style={{ background: '#231710', color: 'white', borderRadius: 18, padding: 20, boxShadow: '0 8px 20px rgba(35, 23, 16, 0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#cc9966', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Need Time Off?
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 4 }}>
              Submit Request
            </div>
            <p style={{ fontSize: 12, color: '#d1c1b5', marginTop: 4, lineHeight: 1.4 }}>
              Submit paid, sick, or unpaid leave requests directly to HR Admin.
            </p>

            <button 
              className="btn-primary btn-sm" 
              onClick={() => setShowApplyModal(true)} 
              style={{ width: 'auto', display: 'inline-flex', marginTop: 12, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 5, fontSize: 12, padding: '7px 14px', borderRadius: 8, fontWeight: 700 }}
            >
              <Plus size={13} /> Apply for Leave
            </button>
          </div>

          {/* Leave Guidelines Card */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#2b1b12', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} color="#b37a4c" /> Leave Policy Rules
            </h4>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: '#7a6758', lineHeight: 1.6 }}>
              <li><strong>Paid Leave:</strong> 12 days per year. Requires 2 days advance notice.</li>
              <li><strong>Sick Leave:</strong> 8 days per year for medical emergencies.</li>
              <li><strong>Unpaid Leave:</strong> Subject to HR Admin approval.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
