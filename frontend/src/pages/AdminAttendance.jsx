import { useEffect, useState } from 'react';
import { Calendar, Search, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { getAvatarUrl } from '../utils/avatar';

export default function AdminAttendance() {
  const { token } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

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
  }, [token, date]);

  const filtered = records.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.employeeId || '').toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const leaveCount = records.filter((r) => r.status === 'Leave').length;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Workforce Attendance Matrix</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Monitor organization-wide workforce attendance logs, clock-in times, and absences
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff', border: '1px solid #eee5d8', padding: '6px 14px', borderRadius: 12 }}>
          <Calendar size={16} color="#b37a4c" />
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            style={{ border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: '#2b1b12', outline: 'none' }} 
          />
        </div>
      </div>

      {/* COMPACT SUMMARY STAT BAR (NO CARD OVERLOAD) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 20,
        padding: 20,
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16
      }}>
        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: '16px 20px', borderRadius: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>PRESENT TODAY</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>{presentCount}</div>
        </div>

        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: '16px 20px', borderRadius: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>ON APPROVED LEAVE</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#b37a4c', marginTop: 2 }}>{leaveCount}</div>
        </div>

        <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: '16px 20px', borderRadius: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>INSPECTED DATE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginTop: 6 }}>{date}</div>
        </div>
      </div>

      {/* Roster Table */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Attendance Roster ({filtered.length})</h3>

          <div style={{ position: 'relative', width: 260 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#7a6758' }} />
            <input
              placeholder="Search by name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const avatar = getAvatarUrl(r);
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: '#2b1b12' }}>{r.employeeId}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img 
                          src={avatar} 
                          alt={r.name} 
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
                        />
                        <span style={{ fontWeight: 700, color: '#2b1b12' }}>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.department || 'General'}</td>
                    <td>
                      <span className={`badge ${r.status === 'Present' ? 'badge-present' : 'badge-pending'}`}>
                        {r.status || 'Present'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.checkIn || '—'}</td>
                    <td style={{ fontSize: 13 }}>{r.checkOut || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{r.workHours ? `${r.workHours} hrs` : '8.0 hrs'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 14 }}>
                    No attendance entries logged for {date}.
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
