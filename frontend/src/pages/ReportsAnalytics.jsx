import { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ReportsAnalytics() {
  const { auth } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.getAnalytics(auth.token).then(setAnalytics).catch(() => {});
  }, [auth.token]);

  if (!analytics) return <div><Navbar /><div className="container muted">Loading HR analytics...</div></div>;

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

  const maxAtt = Math.max(...attendanceTrend.map((t) => t.present), 1);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12' }}>HR Analytics & Reports</h2>
            <p className="muted">Real-time attendance trends, workforce distribution, and leave utilization metrics.</p>
          </div>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={18} /> Export Analytics (CSV)
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid-cards">
          <div className="card">
            <div className="card-header-icon">
              <h3>Active Workforce</h3>
              <div className="icon-wrapper icon-primary"><Users size={20} /></div>
            </div>
            <div className="big">{overview.totalEmployees}</div>
            <p className="muted">Total registered personnel</p>
          </div>

          <div className="card">
            <div className="card-header-icon">
              <h3>Present Today</h3>
              <div className="icon-wrapper icon-success"><Calendar size={20} /></div>
            </div>
            <div className="big" style={{ color: '#9c6137' }}>{overview.presentToday}</div>
            <p className="muted">Checked in employees</p>
          </div>

          <div className="card">
            <div className="card-header-icon">
              <h3>Pending Approvals</h3>
              <div className="icon-wrapper icon-warning"><TrendingUp size={20} /></div>
            </div>
            <div className="big" style={{ color: '#cc9966' }}>{overview.pendingLeaves}</div>
            <p className="muted">Awaiting HR decision</p>
          </div>
        </div>

        {/* 7-Day Attendance Distribution Chart (Cream & Mocha Palette) */}
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#2b1b12' }}>7-Day Attendance Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 220, paddingBottom: 10, borderBottom: '2px solid #eee5d8' }}>
            {attendanceTrend.map((t, idx) => {
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
                      height: `${heightPct}%`,
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#2b1b12' }}>Department Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {departmentBreakdown.map((d, i) => (
                <div key={i}>
                  <div className="flex-between" style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    <span>{d.department}</span>
                    <span>{d.count} staff</span>
                  </div>
                  <div style={{ background: '#eee5d8', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round((d.count / (overview.totalEmployees || 1)) * 100)}%`,
                        background: '#b37a4c',
                        height: '100%'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#2b1b12' }}>Leave Requests by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leaveTypeBreakdown.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fdfaf6', borderRadius: 10, border: '1px solid #eee5d8' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#2b1b12' }}>{l.type} Leave</span>
                  <span className="badge badge-leave">{l.count} requests</span>
                </div>
              ))}
              {leaveTypeBreakdown.length === 0 && <div className="muted">No leave category data yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
