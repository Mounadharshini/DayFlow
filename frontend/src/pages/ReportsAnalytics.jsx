import { useEffect, useState } from 'react';
import { BarChart3, PieChart, Users, Calendar, Download, Printer, TrendingUp, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ReportsAnalytics() {
  const { auth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics(auth.token).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [auth.token]);

  if (loading || !data) return <div><Navbar /><div className="container">Loading HR Analytics...</div></div>;

  const { metrics, departmentStats, leaveStats, attendanceTrend } = data;

  const handleExportCSV = () => {
    let csv = 'Date,Day,Present,On Leave,Absent\n';
    attendanceTrend.forEach(t => {
      csv += `${t.date},${t.day},${t.present},${t.leave},${t.absent}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dayflow_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>HR Analytics & Reports Dashboard</h2>
            <p className="muted">Visual intelligence into employee attendance trends, leave utilization, and departmental metrics.</p>
          </div>
          <button className="btn-primary" onClick={handleExportCSV} style={{ width: 'auto' }}>
            <Download size={16} /> Export Attendance Report (CSV)
          </button>
        </div>

        {/* Top Analytics Metrics */}
        <div className="grid-cards" style={{ marginTop: 24 }}>
          <div className="card">
            <div className="card-header-icon">
              <h3>Active Workforce</h3>
              <div className="icon-wrapper icon-primary"><Users size={20} /></div>
            </div>
            <div className="big">{metrics.totalEmployees}</div>
            <p className="muted">Registered employees</p>
          </div>

          <div className="card">
            <div className="card-header-icon">
              <h3>Today's Attendance Rate</h3>
              <div className="icon-wrapper icon-success"><CheckCircle2 size={20} /></div>
            </div>
            <div className="big" style={{ color: '#10b981' }}>
              {metrics.totalEmployees > 0 ? Math.round((metrics.todayPresent / metrics.totalEmployees) * 100) : 100}%
            </div>
            <p className="muted">{metrics.todayPresent} present / {metrics.todayOnLeave} on leave</p>
          </div>

          <div className="card">
            <div className="card-header-icon">
              <h3>Pending Leave Approvals</h3>
              <div className="icon-wrapper icon-warning"><Calendar size={20} /></div>
            </div>
            <div className="big" style={{ color: '#f59e0b' }}>{metrics.pendingLeaves}</div>
            <p className="muted">Action required in queue</p>
          </div>

          <div className="card">
            <div className="card-header-icon">
              <h3>Est. Monthly Payroll Payout</h3>
              <div className="icon-wrapper icon-primary"><TrendingUp size={20} /></div>
            </div>
            <div className="big">₹{metrics.monthlyPayroll.toLocaleString()}</div>
            <p className="muted">Gross salary budget</p>
          </div>
        </div>

        {/* Charts & Graphs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          {/* Attendance Trend Chart */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color="#4f46e5" /> 7-Day Attendance Distribution
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 16, borderBottom: '2px solid #e2e8f0', paddingBottom: 12 }}>
              {attendanceTrend.map((t) => {
                const total = Math.max(1, metrics.totalEmployees);
                const pHeight = Math.round((t.present / total) * 140);
                const lHeight = Math.round((t.leave / total) * 140);
                return (
                  <div key={t.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 140 }}>
                      <div
                        title={`Present: ${t.present}`}
                        style={{ width: 14, height: Math.max(8, pHeight), background: '#10b981', borderRadius: 4 }}
                      />
                      <div
                        title={`On Leave: ${t.leave}`}
                        style={{ width: 14, height: Math.max(4, lHeight), background: '#4f46e5', borderRadius: 4 }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginTop: 6 }}>{t.day}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 16, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, background: '#10b981', borderRadius: 3 }} /> Present
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, background: '#4f46e5', borderRadius: 3 }} /> On Approved Leave
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieChart size={18} color="#10b981" /> Departmental Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {departmentStats.map((d) => {
                const pct = metrics.totalEmployees > 0 ? Math.round((d.count / metrics.totalEmployees) * 100) : 0;
                return (
                  <div key={d.department}>
                    <div className="flex-between" style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      <span>{d.department}</span>
                      <span>{d.count} employee(s) ({pct}%)</span>
                    </div>
                    <div style={{ background: '#f1f5f9', height: 10, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ background: 'var(--primary-gradient)', width: `${pct}%`, height: '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
