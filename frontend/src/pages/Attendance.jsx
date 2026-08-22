import { useEffect, useState } from 'react';
import { Calendar, Clock, Filter, CheckCircle2, Play, Square } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export default function Attendance() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [range, setRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === todayStr);

  const loadAttendance = async (r = range) => {
    if (!token) return;
    try {
      const data = await api.getMyAttendance(token, r);
      setRecords(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [token]);

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      await api.checkIn(token);
      showToast('Checked in successfully!', 'success');
      loadAttendance();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    try {
      await api.checkOut(token);
      showToast('Checked out successfully!', 'success');
      loadAttendance();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPresent = records.filter(r => r.status === 'Present').length;
  const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 8), 0);

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Attendance Records</h1>
        <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
          Track your daily clock-in timestamps, status, and logged work hours
        </p>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      {/* COMPACT SINGLE TOP SUMMARY CARD (SECTION 7 REQUIREMENT) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
        boxShadow: '0 4px 14px rgba(35, 23, 16, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TODAY'S CLOCK LOG &bull; {todayStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              <span className={`badge ${todayRecord?.checkIn ? 'badge-present' : 'badge-pending'}`}>
                {todayRecord?.checkIn ? (todayRecord.checkOut ? 'Completed' : 'Present (Working)') : 'Not Checked In'}
              </span>
              <span style={{ fontSize: 14, color: '#2b1b12', fontWeight: 600 }}>
                Check-In: <strong>{todayRecord?.checkIn || '-- : -- AM'}</strong>
              </span>
              <span style={{ fontSize: 14, color: '#2b1b12', fontWeight: 600 }}>
                Check-Out: <strong>{todayRecord?.checkOut || '-- : -- PM'}</strong>
              </span>
              <span style={{ fontSize: 14, color: '#9c6137', fontWeight: 700 }}>
                Duration: {todayRecord?.workHours ? `${todayRecord.workHours}h` : '8h'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className="btn-primary btn-sm" 
              disabled={loading || Boolean(todayRecord?.checkIn)} 
              onClick={handleCheckIn} 
              style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '10px 20px', gap: 8 }}
            >
              <Play size={15} /> Check In Now
            </button>
            <button 
              className="btn-secondary btn-sm" 
              disabled={loading || !todayRecord?.checkIn || Boolean(todayRecord?.checkOut)} 
              onClick={handleCheckOut} 
              style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '10px 20px', gap: 8 }}
            >
              <Square size={15} /> Check Out Now
            </button>
          </div>
        </div>

        {/* Inline Stats Row */}
        <div style={{ borderTop: '1px solid #eee5d8', marginTop: 20, paddingTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 700 }}>DAYS LOGGED</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{records.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 700 }}>DAYS PRESENT</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>{totalPresent}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 700 }}>TOTAL WORK HOURS</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#b37a4c', marginTop: 2 }}>{totalWorkHours.toFixed(1)} hrs</div>
          </div>
        </div>
      </div>

      {/* ATTENDANCE TABLE SECTION */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Attendance Log Table</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#7a6758" />
            <select value={range} onChange={(e) => { setRange(e.target.value); loadAttendance(e.target.value); }} style={{ width: 160, padding: '7px 12px', fontSize: 13 }}>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Records</option>
            </select>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: '#2b1b12' }}>{r.date}</td>
                  <td>{r.checkIn || '—'}</td>
                  <td>{r.checkOut || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{r.workHours ? `${r.workHours} hrs` : '8.0 hrs'}</td>
                  <td>
                    <span className={`badge ${r.status === 'Present' ? 'badge-present' : r.status === 'Absent' ? 'badge-absent' : 'badge-pending'}`}>
                      {r.status || 'Present'}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 14 }}>
                    No attendance records found for this selected date range.
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
