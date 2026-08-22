import { useEffect, useState } from 'react';
import { Calendar, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function AdminAttendance() {
  const { auth } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => api.getAllAttendance(auth.token, `?date=${date}`).then(setRecords);
  useEffect(() => { load(); }, [date]);

  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const leaveCount = records.filter((r) => r.status === 'Leave').length;

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Organization Attendance Matrix</h2>
            <p className="muted">Monitor workforce attendance logs, clock-in times, and absences across departments.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Calendar size={18} color="#4f46e5" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 180 }} />
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 24 }}>
          <div className="card">
            <h3>Present Today</h3>
            <div className="big" style={{ color: '#10b981' }}>{presentCount}</div>
          </div>
          <div className="card">
            <h3>On Approved Leave</h3>
            <div className="big" style={{ color: '#4f46e5' }}>{leaveCount}</div>
          </div>
          <div className="card">
            <h3>Date Inspected</h3>
            <div className="big" style={{ fontSize: 20 }}>{date}</div>
          </div>
        </div>

        {/* Table & Search */}
        <div className="flex-between" style={{ marginTop: 28 }}>
          <h3 className="section-title" style={{ margin: 0 }}>Attendance Roster ({filtered.length})</h3>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              placeholder="Filter by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Emp ID</th><th>Employee Name</th><th>Department</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Work Hours</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.employeeId}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{r.name}</td>
                  <td>{r.department || 'General'}</td>
                  <td><Badge status={r.status} /></td>
                  <td>{r.checkIn || '—'}</td>
                  <td>{r.checkOut || '—'}</td>
                  <td>{r.workHours ? `${r.workHours} hrs` : '8.0 hrs'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 24 }}>No attendance entries logged for {date}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
