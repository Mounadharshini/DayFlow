import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, UserCheck, ArrowRight, Lock, Mail, User, Hash, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', password: '', role: 'Employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.signup(form);
      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }
      login(res.token, res.user);
      setTimeout(() => {
        navigate(res.user.role === 'Admin' ? '/admin' : '/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="brand">
          <span>DF</span> Dayflow
        </div>
        <div className="tagline">Join your team on Dayflow HRMS</div>

        {demoOtp ? (
          <div style={{ background: '#d1fae5', color: '#047857', padding: 20, borderRadius: 12, textAlign: 'center' }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: 18, fontWeight: 800 }}>Account Created!</h4>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Simulated Email Verification OTP: <strong>{demoOtp}</strong>
            </p>
            <p style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Employee ID</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
                  <input
                    value={form.employeeId}
                    onChange={update('employeeId')}
                    required
                    placeholder="EMP-201"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
              <div>
                <label>Role</label>
                <select value={form.role} onChange={update('role')}>
                  <option value="Employee">Employee</option>
                  <option value="Admin">HR Admin</option>
                </select>
              </div>
            </div>

            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
              <input
                value={form.name}
                onChange={update('name')}
                required
                placeholder="Jane Doe"
                style={{ paddingLeft: 36 }}
              />
            </div>

            <label>Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                required
                placeholder="jane@company.com"
                style={{ paddingLeft: 36 }}
              />
            </div>

            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                placeholder="Min 8 chars, 1 letter, 1 number"
                style={{ paddingLeft: 36 }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Must be at least 8 characters with a mix of letters and numbers.
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 24 }}>
              {loading ? 'Creating Account...' : <>Complete Registration <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 700 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
