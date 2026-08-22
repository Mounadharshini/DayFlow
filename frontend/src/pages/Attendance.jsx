import { useEffect, useState } from 'react';
import { 
  Calendar, Clock, Filter, CheckCircle2, Play, Square, RefreshCw, 
  UserCheck, AlertTriangle, ShieldCheck, Sun, Moon, ArrowUpRight 
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export default function Attendance() {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [range, setRange] = useState('week'); // 'day' | 'week' | 'month'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === todayStr);

  const loadAttendance = async (r = range) => {
    if (!token) return;
    try {
      const data = await api.getMyAttendance(token, r === 'day' ? 'week' : r);
      setRecords(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Real-Time Live Sync Polling Every 2 Seconds
  useEffect(() => {
    loadAttendance();
    const interval = setInterval(loadAttendance, 2000);
    return () => clearInterval(interval);
  }, [token, range]);

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      await api.checkIn(token);
      showToast('Checked in successfully! Timestamp logged in database.', 'success');
      await loadAttendance();
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    try {
      await api.checkOut(token);
      showToast('Checked out successfully! Work hours calculated.', 'info');
      await loadAttendance();
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'Check-out failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalPresent = records.filter(r => r.status === 'Present').length;
  const totalHalfDays = records.filter(r => r.status === 'Half-day').length;
  const totalLeaves = records.filter(r => r.status === 'Leave').length;
  const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 8), 0);

  const filteredRecords = records.filter(r => {
    if (range === 'day') return r.date === todayStr;
    return true;
  });

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Attendance Log &amp; Check-In</h1>
          <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>
            Read-only employee clock timestamps, working hours, and real-time status verification
          </p>
        </div>

        <button className="btn-secondary btn-sm" onClick={() => loadAttendance(range)} style={{ gap: 6 }}>
          <RefreshCw size={14} /> Refresh Clock
        </button>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 18, fontSize: 13 }}>{error}</div>}

      {/* TODAY'S ATTENDANCE STATUS CARD WITH COMPACT BUTTONS */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 18,
        padding: 22,
        marginBottom: 24,
        boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TODAY'S WORKDAY CLOCK LOG &bull; {todayStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
              <span className={`badge ${todayRecord?.checkIn ? (todayRecord.status === 'Half-day' ? 'badge-pending' : todayRecord.status === 'Leave' ? 'badge-rejected' : 'badge-present') : 'badge-pending'}`}>
                {todayRecord?.checkIn 
                  ? (todayRecord.checkOut ? `Completed (${todayRecord.status})` : `Checked In (${todayRecord.status})`) 
                  : 'Not Checked In'}
              </span>
              <span style={{ fontSize: 13, color: '#2b1b12', fontWeight: 600 }}>
                Check-In: <strong>{todayRecord?.checkIn || '-- : -- AM'}</strong>
              </span>
              <span style={{ fontSize: 13, color: '#2b1b12', fontWeight: 600 }}>
                Check-Out: <strong>{todayRecord?.checkOut || '-- : -- PM'}</strong>
              </span>
              <span style={{ fontSize: 13, color: '#9c6137', fontWeight: 800 }}>
                Log Duration: {todayRecord?.workHours ? `${todayRecord.workHours} hrs` : '8.0 hrs'}
              </span>
            </div>
          </div>

          {/* Compact Short Check-In / Check-Out Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="btn-primary btn-sm" 
              disabled={loading || Boolean(todayRecord?.checkIn)} 
              onClick={handleCheckIn} 
              style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '6px 14px', gap: 5, borderRadius: 8, fontSize: 12, fontWeight: 700 }}
            >
              <Play size={13} /> Check In
            </button>
            <button 
              className="btn-secondary btn-sm" 
              disabled={loading || !todayRecord?.checkIn || Boolean(todayRecord?.checkOut)} 
              onClick={handleCheckOut} 
              style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '6px 14px', gap: 5, borderRadius: 8, fontSize: 12, fontWeight: 700 }}
            >
              <Square size={13} /> Check Out
            </button>
          </div>
        </div>

        {/* Inline Metrics Row */}
        <div style={{ borderTop: '1px solid #eee5d8', marginTop: 18, paddingTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>LOGGED DAYS</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{records.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>DAYS PRESENT</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>{totalPresent}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>HALF-DAYS</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#b37a4c', marginTop: 2 }}>{totalHalfDays}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>APPROVED LEAVES</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626', marginTop: 2 }}>{totalLeaves}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>TOTAL WORK HOURS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#9c6137', marginTop: 2 }}>{totalWorkHours.toFixed(1)} hrs</div>
          </div>
        </div>
      </div>

      {/* ATTENDANCE TABLE SECTION WITH VIEW FILTERS */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Attendance Log History</h3>
            <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>Database-driven attendance records enforced with role security</p>
          </div>
          
          {/* Daily / Weekly / Monthly View Tabs */}
          <div style={{ display: 'flex', gap: 6, background: '#fdfaf6', padding: 4, borderRadius: 10, border: '1px solid #eee5d8' }}>
            {[
              { key: 'day', label: 'Daily View' },
              { key: 'week', label: 'Weekly View' },
              { key: 'month', label: 'Monthly View' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setRange(tab.key); loadAttendance(tab.key); }}
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: range === tab.key ? 800 : 600,
                  color: range === tab.key ? '#9c6137' : '#7a6758',
                  background: range === tab.key ? '#ffffff' : 'transparent',
                  borderRadius: 7,
                  border: 'none',
                  boxShadow: range === tab.key ? '0 1px 4px rgba(35, 23, 16, 0.08)' : 'none',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Logged Work Hours</th>
                <th>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 800, color: '#2b1b12' }}>{r.date}</td>
                  <td style={{ fontSize: 13 }}>{r.checkIn || '—'}</td>
                  <td style={{ fontSize: 13 }}>{r.checkOut || '—'}</td>
                  <td style={{ fontWeight: 700, color: '#9c6137' }}>{r.workHours ? `${r.workHours} hrs` : '8.0 hrs'}</td>
                  <td>
                    <span className={`badge ${r.status === 'Present' ? 'badge-present' : r.status === 'Half-day' ? 'badge-pending' : r.status === 'Leave' ? 'badge-rejected' : 'badge-absent'}`}>
                      {r.status || 'Present'}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 24px', color: '#7a6758', fontSize: 13 }}>
                    No attendance records found for this view filter.
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
