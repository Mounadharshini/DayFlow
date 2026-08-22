import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e, overrideEmail, overridePw) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    const loginEmail = overrideEmail || email;
    const loginPw = overridePw || password;

    try {
      const { token, user } = await api.login({ email: loginEmail, password: loginPw });
      login(token, user);
      navigate(user.role === 'Admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="auth-card">
        <div className="brand">
          <span>DF</span> Dayflow
        </div>
        <div className="tagline">Every workday, perfectly aligned.</div>

        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, marginBottom: 20, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Login Personas
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => handleSubmit(null, 'admin@dayflow.com', 'Admin@123')}
              style={{ fontSize: 12, justifyContent: 'center' }}
            >
              <Shield size={14} color="#4f46e5" /> HR Admin
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => handleSubmit(null, 'alex.morgan@dayflow.com', 'Employee@123')}
              style={{ fontSize: 12, justifyContent: 'center' }}
            >
              <UserCheck size={14} color="#10b981" /> Employee
            </button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e)}>
          <label>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
              style={{ paddingLeft: 38 }}
            />
          </div>

          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ paddingLeft: 38 }}
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 24 }}>
            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
          Don't have an account? <Link to="/signup" style={{ fontWeight: 700 }}>Sign up now</Link>
        </div>
      </div>
    </div>
  );
}
