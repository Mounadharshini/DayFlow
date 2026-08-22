import { useEffect, useState } from 'react';
import { Calendar, Search, CheckCircle2, Clock, Edit2, X, RefreshCw, Filter, UserCheck, AlertTriangle } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function AdminAttendance() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Attendance correction modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'Present',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    workHours: 8.5
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!token) return;
    try {
      const res = await api.getAllAttendance(token, `?date=${date}`);
      setRecords(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [token, date]);

  const openCorrectionModal = (record) => {
    setSelectedRecord(record);
    setEditForm({
      status: record.status || 'Present',
      checkIn: record.checkIn || '09:00:00',
      checkOut: record.checkOut || '17:30:00',
      workHours: record.workHours || 8.0
    });
  };

  const handleSaveCorrection = async () => {
    if (!selectedRecord || !token) return;
    setSaving(true);
    try {
      await api.updateAttendanceRecord(token, selectedRecord.id, editForm);
      showToast(`Attendance updated for ${selectedRecord.name}! Saved to database.`, 'success');
      setSelectedRecord(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to update attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = records.filter((r) => {
    const matchesSearch =
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.employeeId || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const halfDayCount = records.filter((r) => r.status === 'Half-day').length;
  const leaveCount = records.filter((r) => r.status === 'Leave').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Admin Workforce Attendance Matrix</h1>
          <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>
            Monitor and correct organization-wide employee attendance logs in real time
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #eee5d8', padding: '6px 14px', borderRadius: 12 }}>
            <Calendar size={15} color="#b37a4c" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#2b1b12', outline: 'none' }} 
            />
          </div>
          <button className="btn-secondary btn-sm" onClick={load} style={{ gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* SUMMARY METRICS BAR */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 18,
        padding: 18,
        marginBottom: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 14
      }}>
        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: '14px 18px', borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>PRESENT</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#9c6137', marginTop: 2 }}>{presentCount}</div>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '14px 18px', borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>HALF-DAY</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#d97706', marginTop: 2 }}>{halfDayCount}</div>
        </div>

        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: '14px 18px', borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>APPROVED LEAVE</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#b37a4c', marginTop: 2 }}>{leaveCount}</div>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px', borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>ABSENT</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', marginTop: 2 }}>{absentCount}</div>
        </div>
      </div>

      {/* Roster Table Container */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2b1b12', margin: 0 }}>
            Employee Roster for {date} ({filtered.length})
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color="#7a6758" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                style={{ padding: '6px 12px', fontSize: 12, width: 140 }}
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Half-day">Half-day</option>
                <option value="Leave">Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#7a6758' }} />
              <input
                placeholder="Search name, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 30, fontSize: 12 }}
              />
            </div>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const avatar = getAvatarUrl(r);
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, color: '#2b1b12' }}>{r.employeeId}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img 
                          src={avatar} 
                          alt={r.name} 
                          style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
                        />
                        <span style={{ fontWeight: 700, color: '#2b1b12' }}>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.department || 'General'}</td>
                    <td>
                      <span className={`badge ${r.status === 'Present' ? 'badge-present' : r.status === 'Half-day' ? 'badge-pending' : r.status === 'Leave' ? 'badge-rejected' : 'badge-absent'}`}>
                        {r.status || 'Present'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.checkIn || '—'}</td>
                    <td style={{ fontSize: 13 }}>{r.checkOut || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#9c6137' }}>{r.workHours ? `${r.workHours} hrs` : '8.0 hrs'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-secondary btn-sm" 
                        onClick={() => openCorrectionModal(r)}
                        style={{ padding: '4px 10px', fontSize: 12, gap: 4 }}
                      >
                        <Edit2 size={12} /> Correct
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px 24px', color: '#7a6758', fontSize: 13 }}>
                    No attendance entries found for {date} matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CORRECTION / EDIT ATTENDANCE MODAL */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(35, 23, 16, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 460,
            padding: 24,
            border: '1px solid #eee5d8',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Correct Attendance Log</h3>
                <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>{selectedRecord.name} ({selectedRecord.employeeId}) &bull; {selectedRecord.date}</p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6758' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Attendance Status</label>
                <select 
                  value={editForm.status} 
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                >
                  <option value="Present">Present</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Leave">Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Check-In Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 09:00:00" 
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Check-Out Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 17:30:00" 
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Working Hours Logged</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={editForm.workHours}
                  onChange={(e) => setEditForm({ ...editForm, workHours: e.target.value })}
                  style={{ fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => setSelectedRecord(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary btn-sm"
                  onClick={handleSaveCorrection}
                  disabled={saving}
                  style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}
                >
                  {saving ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
