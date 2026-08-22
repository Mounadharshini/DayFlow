import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, FileText, CreditCard, User, AlertCircle, CheckCircle2, ArrowRight, Play, Square } from 'lucide-react';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function EmployeeDashboard() {
  const { auth, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [today, setToday] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [paystub, setPaystub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockTime, setClockTime] = useState(new Date().toLocaleTimeString());
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const loadData = async () => {
    try {
      const p = await api.getMyProfile(auth.token);
      setProfile(p);
      const att = await api.getMyAttendance(auth.token);
      setToday(att.find((r) => r.date === todayStr) || null);
      const lv = await api.getMyLeaves(auth.token);
      setLeaves((lv.leaves || []).slice(0, 5));
      const pay = await api.getMyPaystub(auth.token);
      setPaystub(pay);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setClockTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, [auth.token]);

  const handleCheckIn = async () => {
    try {
      await api.checkIn(auth.token);
      await loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.checkOut(auth.token);
      await loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSendVerify = async () => {
    try {
      const res = await api.sendVerifyEmail(auth.token);
      setOtpSent(true);
      setVerifyMsg(`Demo OTP sent: ${res.demoOtp}`);
    } catch (e) {
      setVerifyMsg(e.message);
    }
  };

  const handleConfirmVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.confirmVerifyEmail(auth.token, otpInput);
      setVerifyMsg(res.message);
      const p = await api.getMyProfile(auth.token);
      setProfile(p);
    } catch (e) {
      setVerifyMsg(e.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        {/* Email Verification Banner */}
        {profile && !profile.isEmailVerified && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 16, borderRadius: 12, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle color="#d97706" size={20} />
              <div>
                <strong style={{ color: '#92400e', fontSize: 14 }}>Your email address is unverified</strong>
                <p style={{ color: '#b45309', fontSize: 13 }}>Verify your email to receive HR notification alerts and salary updates.</p>
              </div>
            </div>
            {!otpSent ? (
              <button className="btn-warning btn-sm" onClick={handleSendVerify}>Send Verification OTP</button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input placeholder="Enter OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} style={{ width: 110, padding: 6 }} />
                <button className="btn-primary btn-sm" onClick={handleConfirmVerify} disabled={verifying}>Verify</button>
              </div>
            )}
            {verifyMsg && <div style={{ width: '100%', fontSize: 12, color: '#d97706', fontWeight: 600 }}>{verifyMsg}</div>}
          </div>
        )}

        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
              Welcome back, {auth.user.name.split(' ')[0]} 👋
            </h2>
            <p className="muted">Here is your daily HR summary and attendance widget.</p>
          </div>
          <div style={{ textAlign: 'right', background: 'white', padding: '10px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>CURRENT SYSTEM TIME</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5' }}>{clockTime}</div>
          </div>
        </div>

        {/* Quick Check-In / Check-Out Widget */}
        <div className="card" style={{ marginTop: 24, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #cbd5e1' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TODAY'S WORK LOG — {todayStr}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Status:</span>
                {today ? <Badge status={today.status} /> : <Badge status="Absent" />}
                {today?.checkIn && (
                  <span className="muted" style={{ fontSize: 13 }}>
                    Check-in: <strong>{today.checkIn}</strong> {today.checkOut ? `• Check-out: ${today.checkOut}` : ''}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn-success"
                disabled={Boolean(today?.checkIn)}
                onClick={handleCheckIn}
                style={{ padding: '10px 18px', opacity: today?.checkIn ? 0.6 : 1 }}
              >
                <Play size={16} /> Check In
              </button>
              <button
                className="btn-danger"
                disabled={!today?.checkIn || Boolean(today?.checkOut)}
                onClick={handleCheckOut}
                style={{ padding: '10px 18px', opacity: !today?.checkIn || today?.checkOut ? 0.6 : 1 }}
              >
                <Square size={16} /> Check Out
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid-cards">
          <Link to="/profile" className="card">
            <div className="card-header-icon">
              <h3>My Profile</h3>
              <div className="icon-wrapper icon-primary"><User size={20} /></div>
            </div>
            <div className="big" style={{ fontSize: 18 }}>{auth.user.name}</div>
            <p className="muted" style={{ marginTop: 4 }}>{profile?.designation || 'Staff'} • {profile?.department || 'General'}</p>
          </Link>

          <Link to="/attendance" className="card">
            <div className="card-header-icon">
              <h3>Attendance Log</h3>
              <div className="icon-wrapper icon-success"><Calendar size={20} /></div>
            </div>
            <div className="big">{today ? today.status : 'Not Checked In'}</div>
            <p className="muted" style={{ marginTop: 4 }}>Click to view 30-day log</p>
          </Link>

          <Link to="/leaves" className="card">
            <div className="card-header-icon">
              <h3>Leave Balances</h3>
              <div className="icon-wrapper icon-warning"><FileText size={20} /></div>
            </div>
            <div className="big">{profile?.paidLeaveRemaining ?? 12} Paid</div>
            <p className="muted" style={{ marginTop: 4 }}>{profile?.sickLeaveRemaining ?? 8} Sick leaves available</p>
          </Link>

          <Link to="/payroll" className="card">
            <div className="card-header-icon">
              <h3>Net Monthly Pay</h3>
              <div className="icon-wrapper icon-primary"><CreditCard size={20} /></div>
            </div>
            <div className="big">₹{(paystub?.netPay || 0).toLocaleString()}</div>
            <p className="muted" style={{ marginTop: 4 }}>View salary slip details</p>
          </Link>
        </div>

        {/* Recent Leave Requests */}
        <div className="flex-between">
          <h3 className="section-title">Recent Leave Requests</h3>
          <Link to="/leaves" style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            Apply New Leave <ArrowRight size={16} />
          </Link>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Type</th><th>Duration</th><th>Dates</th><th>Remarks</th><th>Status</th></tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700 }}>{l.type} Leave</td>
                  <td>{l.daysCount || 1} day(s)</td>
                  <td>{l.startDate} → {l.endDate}</td>
                  <td>{l.remarks || '—'}</td>
                  <td><Badge status={l.status} /></td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>No recent leave requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
