import { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, Calendar } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ReportsAnalytics() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState({
    overview: { totalEmployees: 4, presentToday: 3, absentToday: 1, pendingLeaves: 0 },
    departmentBreakdown: [
      { department: 'Human Resources', count: 2 },
      { department: 'Engineering', count: 1 },
      { department: 'Design & Marketing', count: 1 }
    ],
    attendanceTrend: [
      { date: '2026-08-16', present: 3 },
      { date: '2026-08-17', present: 4 },
      { date: '2026-08-18', present: 4 },
      { date: '2026-08-19', present: 3 },
      { date: '2026-08-20', present: 4 },
      { date: '2026-08-21', present: 3 },
      { date: '2026-08-22', present: 4 }
    ],
    leaveTypeBreakdown: [
      { type: 'Paid', count: 2 },
      { type: 'Sick', count: 1 }
    ]
  });

  useEffect(() => {
    if (!token) return;
    api.getAnalytics(token).then(data => {
      if (data) setAnalytics(data);
    }).catch(() => {});
  }, [token]);

  const { overview, departmentBreakdown, attendanceTrend, leaveTypeBreakdown } = analytics;

  const handleExportCSV = () => {
    let csv = 'Metric,Value\n';
    csv += `Total Employees,${overview.totalEmployees}\n`;
    csv += `Present Today,${overview.presentToday}\n`;
    csv += `Absent Today,${overview.absentToday}\n`;
    csv += `Pending Leaves,${overview.pendingLeaves}\n\n`;

    csv += 'Department,Employee Count\n';
    departmentBreakdown.forEach((d) => {
      csv += `"${d.department}",${d.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ElyVia_HR_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const maxAtt = Math.max(...(attendanceTrend || []).map((t) => t.present), 1);

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>HR Analytics & Reports</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Real-time workforce attendance trends, department distribution, and leave utilization metrics
          </p>
        </div>
        <button className="btn-secondary btn-sm" onClick={handleExportCSV} style={{ gap: 8 }}>
          <Download size={16} /> Export Analytics (CSV)
        </button>
      </div>

      {/* Top Summary Cards */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20
      }}>
        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} color="#b37a4c" /> ACTIVE WORKFORCE
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>{overview.totalEmployees}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Registered personnel</div>
        </div>

        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color="#9c6137" /> PRESENT TODAY
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>{overview.presentToday}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Checked-in employees</div>
        </div>

        <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="#b37a4c" /> PENDING APPROVALS
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#b37a4c', marginTop: 4 }}>{overview.pendingLeaves}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Awaiting HR decision</div>
        </div>
      </div>

      {/* 7-Day Attendance Distribution Chart (Cream & Mocha Palette) */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#2b1b12' }}>7-Day Attendance Trend</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 220, paddingBottom: 10, borderBottom: '2px solid #eee5d8' }}>
          {(attendanceTrend || []).map((t, idx) => {
            const heightPct = Math.round((t.present / maxAtt) * 100);
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9c6137', marginBottom: 6 }}>
                  {t.present}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 44,
                    height: `${Math.max(heightPct, 15)}%`,
                    background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)',
                    borderRadius: '8px 8px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                  title={`${t.date}: ${t.present} present`}
                />
                <div style={{ fontSize: 11, color: '#7a6758', marginTop: 8, fontWeight: 600 }}>
                  {t.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department & Leave Distribution Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#2b1b12' }}>Department Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(departmentBreakdown || []).map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#2b1b12', marginBottom: 4 }}>
                  <span>{d.department}</span>
                  <span>{d.count} staff</span>
                </div>
                <div style={{ background: '#eee5d8', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.round((d.count / (overview.totalEmployees || 1)) * 100)}%`,
                      background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)',
                      height: '100%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#2b1b12' }}>Leave Requests by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(leaveTypeBreakdown || []).map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fdfaf6', borderRadius: 12, border: '1px solid #eee5d8' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#2b1b12' }}>{l.type} Leave</span>
                <span className="badge badge-leave">{l.count} requests</span>
              </div>
            ))}
            {(!leaveTypeBreakdown || leaveTypeBreakdown.length === 0) && <div className="muted" style={{ padding: 12 }}>No leave category data yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
