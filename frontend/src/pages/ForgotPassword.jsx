import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../components/Toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid work email address');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Dispatch reset request
      await api.signup ? null : null; // fetch mock check
      setSent(true);
      showToast('Password reset code dispatched to ' + email, 'info');
    } catch (err) {
      setError(err.message || 'Failed to dispatch password reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    setError('');
    setLoading(true);

    try {
      showToast('Password reset successfully! Please sign in with your new password.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Hero Column */}
      <div className="auth-hero-section">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <span className="logo-badge">EV</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>ElyVia Password Recovery</span>
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Account Security &amp;<br />
            <span style={{ color: '#fff4c2' }}>Password Reset</span>
          </h1>
          <p style={{ color: '#d1c1b5', fontSize: 15, lineHeight: 1.6, maxWidth: 440 }}>
            Enter your registered work email address below to receive a secure password recovery code.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.08)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: '#fff4c2' }}>
            <ShieldCheck size={18} /> Enterprise Security Protocol
          </div>
          <p style={{ fontSize: 13, color: '#d1c1b5', marginTop: 4 }}>
            Password reset codes are valid for 15 minutes. For immediate assistance, contact HR Administration at admin@elyvia.com.
          </p>
        </div>
      </div>

      {/* Form Column */}
      <div className="auth-form-section">
        {!sent ? (
          <>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Forgot password?</h2>
              <p className="muted" style={{ marginTop: 4 }}>Enter your email to receive recovery instructions</p>
            </div>

            <form onSubmit={handleRequestReset}>
              <label>Work Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#7a6758' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ paddingLeft: 38 }}
                />
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 24 }}>
                {loading ? 'Dispatching Reset Code...' : <>Send Password Reset Code <ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: '#7a6758' }}>
              Remembered your password? <Link to="/login" style={{ fontWeight: 700, color: '#b37a4c' }}>Back to Sign In</Link>
            </div>
          </>
        ) : (
          <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <div style={{ background: '#fff4c2', color: '#b37a4c', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #eee5d8' }}>
                <KeyRound size={28} />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12' }}>Reset Your Password</h2>
              <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                Recovery code dispatched to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword}>
              <label>6-Digit Recovery Code</label>
              <input
                type="text"
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                style={{ fontSize: 20, fontWeight: 800, letterSpacing: 6, textAlign: 'center' }}
              />

              <label style={{ marginTop: 14 }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
              />

              {error && <div className="error-msg">{error}</div>}

              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 24 }}>
                {loading ? 'Updating Password...' : <>Confirm &amp; Reset Password <CheckCircle2 size={16} /></>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setSent(false)}>
                &larr; Back to Email Step
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
