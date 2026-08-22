import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Calendar, FileCheck, CreditCard, Clock, Play, Square, 
  Sparkles, CheckCircle2 
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function EmployeeDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    if (!token) return;
    try {
      const data = await api.getEmployeeDashboard(token);
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleCheckIn = async () => {
    setClockLoading(true);
    try {
      await api.checkIn(token);
      showToast('Successfully clocked in for today!', 'success');
      await fetchDashboard();
    } catch (err) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setClockLoading(true);
    try {
      await api.checkOut(token);
      showToast('Successfully clocked out for today!', 'success');
      await fetchDashboard();
    } catch (err) {
      showToast(err.message || 'Check-out failed', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  // Determine Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const profile = dashboardData?.user || user;
  const avatarUrl = getAvatarUrl(profile);
  const todayRecord = dashboardData?.todayRecord;
  const leaveSummary = dashboardData?.leaveSummary || { pending: 0, approved: 0, rejected: 0 };
  const recentActivities = dashboardData?.recentActivities || [];

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* 1. Time-Aware Welcome Hero Banner (Always renders immediately!) */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #231710 0%, #3d291c 60%, #9c6137 100%)',
        color: 'white',
        borderRadius: 24,
        padding: 32,
        marginBottom: 28,
        boxShadow: '0 12px 32px rgba(35, 23, 16, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img 
              src={avatarUrl} 
              alt={profile?.name || 'User'} 
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #cc9966' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#fff4c2', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {greeting}, 👋
                </span>
                <span className="badge badge-present" style={{ fontSize: 11, background: 'rgba(255, 244, 194, 0.2)', color: '#fff4c2' }}>
                  {profile?.role === 'Admin' ? 'HR Administrator 👑' : 'Active Employee'}
                </span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '4px 0 6px', letterSpacing: '-0.5px' }}>
                {profile?.name || 'Employee'}
              </h1>
              <div style={{ fontSize: 13, color: '#d1c1b5', fontWeight: 500 }}>
                {profile?.designation || 'Staff Member'} &bull; {profile?.department || 'Human Resources'} &bull; ID: <strong>{profile?.employeeId || 'EMP-101'}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 244, 194, 0.1)', border: '1px solid rgba(255, 244, 194, 0.2)', padding: '16px 24px', borderRadius: 16, textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#cc9966', fontWeight: 800, textTransform: 'uppercase' }}>TODAY'S DATE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      {/* 2. Quick Access Workspace Hub */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginBottom: 16 }}>Quick Access Hub</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <Link to="/profile" className="card" style={{ textDecoration: 'none', background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, transition: 'all 0.2s ease' }}>
          <div style={{ background: '#fff4c2', color: '#b37a4c', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <User size={22} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#2b1b12' }}>My Profile</div>
          <div style={{ fontSize: 13, color: '#7a6758', marginTop: 4 }}>Job details &amp; docs</div>
        </Link>

        <Link to="/attendance" className="card" style={{ textDecoration: 'none', background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, transition: 'all 0.2s ease' }}>
          <div style={{ background: '#f4ece4', color: '#9c6137', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Calendar size={22} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#2b1b12' }}>Attendance</div>
          <div style={{ fontSize: 13, color: '#7a6758', marginTop: 4 }}>Clock in &amp; work log</div>
        </Link>

        <Link to="/leaves" className="card" style={{ textDecoration: 'none', background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, transition: 'all 0.2s ease' }}>
          <div style={{ background: '#fff4c2', color: '#b37a4c', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <FileCheck size={22} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#2b1b12' }}>Leave Requests</div>
          <div style={{ fontSize: 13, color: '#7a6758', marginTop: 4 }}>Apply &amp; check status</div>
        </Link>

        <Link to="/payroll" className="card" style={{ textDecoration: 'none', background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, transition: 'all 0.2s ease' }}>
          <div style={{ background: '#f4ece4', color: '#9c6137', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <CreditCard size={22} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#2b1b12' }}>Salary / Payroll</div>
          <div style={{ fontSize: 13, color: '#7a6758', marginTop: 4 }}>Paystubs &amp; tax breakdown</div>
        </Link>
      </div>

      {/* 3. Section Grid: Today's Clock-In Log & Leave Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Today's Clock Tracker */}
        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Today's Clock Status</h3>
            <span className={`badge ${todayRecord?.checkIn ? 'badge-present' : 'badge-pending'}`}>
              {todayRecord?.checkIn ? (todayRecord.checkOut ? 'Completed' : 'Present (Working)') : 'Not Clocked In'}
            </span>
          </div>

          <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#7a6758', fontWeight: 600 }}>Check-In Time:</span>
              <strong style={{ fontSize: 14, color: '#2b1b12' }}>{todayRecord?.checkIn || '-- : -- AM'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#7a6758', fontWeight: 600 }}>Check-Out Time:</span>
              <strong style={{ fontSize: 14, color: '#2b1b12' }}>{todayRecord?.checkOut || '-- : -- PM'}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button 
              className="btn-primary btn-sm" 
              disabled={clockLoading || Boolean(todayRecord?.checkIn)} 
              onClick={handleCheckIn}
              style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6 }}
            >
              <Play size={14} /> Punch In
            </button>
            <button 
              className="btn-secondary btn-sm" 
              disabled={clockLoading || !todayRecord?.checkIn || Boolean(todayRecord?.checkOut)} 
              onClick={handleCheckOut}
              style={{ color: '#dc2626', borderColor: '#fca5a5', gap: 6 }}
            >
              <Square size={14} /> Punch Out
            </button>
          </div>
        </div>

        {/* Leave Quota Overview */}
        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Leave Quotas & Status</h3>
            <Link to="/leaves" style={{ fontSize: 13, fontWeight: 700, color: '#b37a4c', textDecoration: 'none' }}>
              Apply Leave &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
            <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>PENDING</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>{leaveSummary.pending}</div>
            </div>

            <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>APPROVED</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>{leaveSummary.approved}</div>
            </div>

            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>REJECTED</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', marginTop: 2 }}>{leaveSummary.rejected}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Workspace Activity Feed */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginBottom: 16 }}>Recent Activity Stream</h3>
        {recentActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivities.slice(0, 5).map(act => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#fdfaf6', borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ background: '#b37a4c', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#2b1b12' }}>{act.title}</div>
                  <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>{act.message}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: '#7a6758', fontSize: 13 }}>
            No recent activity logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
