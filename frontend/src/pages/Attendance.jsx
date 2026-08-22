import { useEffect, useState } from 'react';
import { Calendar, Play, Square, Clock, Filter, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Attendance() {
  const { auth } = useAuth();
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState('week');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === todayStr);

  const load = async (r = range) => {
    const data = await api.getMyAttendance(auth.token, r);
    setRecords(data);
  };

  useEffect(() => { load(); }, [auth.token]);

  const handleCheckIn = async () => {
    setLoading(true); setError('');
    try { await api.checkIn(auth.token); await load(); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const handleCheckOut = async () => {
    setLoading(true); setError('');
    try { await api.checkOut(auth.token); await load(); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const totalPresent = records.filter(r => r.status === 'Present').length;
  const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 8), 0);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>My Attendance Log</h2>
            <p className="muted">Track your daily clock-in timestamps, status, and logged work hours.</p>
          </div>
        </div>

        {/* Today's Punch Widget */}
        <div className="card" style={{ marginTop: 20, marginBottom: 28, background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                TODAY'S CLOCK LOG — {todayStr}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Status:</span>
                {todayRecord ? <Badge status={todayRecord.status} /> : <Badge status="Absent" />}
                <span className="muted" style={{ fontSize: 13 }}>
                  • Check-In: <strong>{todayRecord?.checkIn || 'Not logged'}</strong> • Check-Out: <strong>{todayRecord?.checkOut || 'Not logged'}</strong>
                </span>
              </div>
              {error && <div className="error-msg">{error}</div>}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-success" disabled={loading || Boolean(todayRecord?.checkIn)} onClick={handleCheckIn} style={{ padding: '10px 18px' }}>
                <Play size={16} /> Punch In
              </button>
              <button className="btn-danger" disabled={loading || !todayRecord?.checkIn || Boolean(todayRecord?.checkOut)} onClick={handleCheckOut} style={{ padding: '10px 18px' }}>
                <Square size={16} /> Punch Out
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="card">
            <h3>Days Logged</h3>
            <div className="big">{records.length}</div>
          </div>
          <div className="card">
            <h3>Days Present</h3>
            <div className="big" style={{ color: '#10b981' }}>{totalPresent}</div>
          </div>
          <div className="card">
            <h3>Total Work Hours</h3>
            <div className="big" style={{ color: '#4f46e5' }}>{totalWorkHours.toFixed(1)} hrs</div>
          </div>
        </div>

        {/* History Table */}
        <div className="flex-between">
          <h3 className="section-title" style={{ margin: 0 }}>Attendance History</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#64748b" />
            <select value={range} onChange={(e) => { setRange(e.target.value); load(e.target.value); }} style={{ width: 180 }}>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Records</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Duration</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.date}</td>
                  <td><Badge status={r.status} /></td>
                  <td>{r.checkIn || '—'}</td>
                  <td>{r.checkOut || '—'}</td>
                  <td>{r.workHours ? `${r.workHours} hrs` : '8.0 hrs'}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>No attendance records found for this range.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
