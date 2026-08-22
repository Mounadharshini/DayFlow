import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, Eye, EyeOff, CheckCircle2, Sparkles, KeyRound, RefreshCw, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login steps: 'credentials' vs 'otp'
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [tempToken, setTempToken] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Manual Credentials Login (Triggers OTP email dispatch)
  const handleCredentialsSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.requireOtp) {
        setTempToken(res.tempToken);
        setUserEmail(res.email);
        setStep('otp'); // Switch directly to OTP verification step on this Login page!
      } else {
        login(res.token, res.user);
        navigate(res.user.role === 'Admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Manual Login OTP Code
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 6) {
      setError('Please enter the 6-digit OTP security code sent to your email');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.loginVerifyOtp({ tempToken, otp: otpInput.trim() });
      login(res.token, res.user);
      navigate(res.user.role === 'Admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    setResending(true);
    setResendMsg('');
    setError('');
    try {
      const res = await api.login({ email, password });
      setTempToken(res.tempToken);
      setResendMsg('New verification OTP dispatched to ' + userEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  // Google Sign-In (NORMAL LOGIN: NO PROMPTS, NO OTP NEEDED!)
  const triggerGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const googleUserRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const googleUser = await googleUserRes.json();
        
        if (!googleUser.email) {
          throw new Error('Could not retrieve email address from your Google Account.');
        }

        const res = await api.googleAuth({
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          picture: googleUser.picture || ''
        });

        // Direct Login without OTP for Google Accounts!
        login(res.token, res.user);
        navigate(res.user.role === 'Admin' ? '/admin' : '/dashboard');
      } catch (err) {
        setError(err.message || 'Google Sign-In failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-In popup was closed or cancelled.');
    }
  });

  return (
    <div className="auth-split-wrapper">
      {/* Left Column: Espresso & Mocha SaaS Hero */}
      <div className="auth-hero-section">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <img 
              src="/elyvia-logo.jpg" 
              alt="ElyVia Logo" 
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966', boxShadow: '0 2px 10px rgba(204,153,102,0.4)' }} 
            />
            <span className="brand-name" style={{ fontSize: 24 }}>ElyVia HRMS</span>
          </div>

          <div style={{ background: 'rgba(255, 244, 194, 0.15)', border: '1px solid rgba(255, 244, 194, 0.3)', padding: '6px 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fff4c2', marginBottom: 24 }}>
            <Sparkles size={15} /> Enterprise Workforce Portal
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Every workday, <br />
            <span style={{ background: 'linear-gradient(135deg, #fff4c2 0%, #cc9966 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              perfectly aligned.
            </span>
          </h1>

          <p style={{ color: '#d1c1b5', fontSize: 15, lineHeight: 1.6, maxWidth: 440 }}>
            Automate workforce management, daily check-in attendance logs, real-time SMTP leave workflow alerts, and PDF paystubs.
          </p>
        </div>

        {/* Hero Features List */}
        <div style={{ margin: '36px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, color: '#fff4c2', fontSize: 14, fontWeight: 600 }}>
            <CheckCircle2 size={18} color="#cc9966" /> Automated Work Hours &amp; Real-time Check-In
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, color: '#fff4c2', fontSize: 14, fontWeight: 600 }}>
            <CheckCircle2 size={18} color="#cc9966" /> Real Email OTP &amp; Gmail Notification Alerts
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#fff4c2', fontSize: 14, fontWeight: 600 }}>
            <CheckCircle2 size={18} color="#cc9966" /> Official PDF Paystubs &amp; 360° Employee Inspector
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 20 }}>
          <p style={{ fontSize: 13, color: '#d1c1b5', fontStyle: 'italic' }}>
            "ElyVia HRMS transformed our HR operations, cutting leave processing time down to seconds."
          </p>
          <div style={{ fontSize: 12, color: '#fff4c2', fontWeight: 700, marginTop: 6 }}>
            — Operations Director, Enterprise HR
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Credentials Form vs OTP Verification */}
      <div className="auth-form-section">
        {/* Back to Home Link */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/" style={{ fontSize: 13, fontWeight: 700, color: '#b37a4c', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={15} /> Back to Home Landing Page
          </Link>
        </div>

        {step === 'credentials' ? (
          <>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Sign in to ElyVia</h2>
              <p className="muted" style={{ marginTop: 4 }}>Enter your credentials to access your portal</p>
            </div>

            {/* Direct Normal Google Sign-In */}
            <button type="button" className="btn-google" onClick={() => triggerGoogleSignIn()} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google
            </button>

            <div className="divider-with-text">
              <span>OR CONTINUE WITH EMAIL</span>
            </div>

            <form onSubmit={handleCredentialsSubmit}>
              <label>Work Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#7a6758' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  style={{ paddingLeft: 38 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <label style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#b37a4c', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>

              <div style={{ position: 'relative', marginTop: 6 }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#7a6758' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: 10, background: 'transparent', border: 'none', color: '#7a6758', padding: 4 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="remember" style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#7a6758', cursor: 'pointer' }}>
                  Remember me for 7 days
                </label>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 24 }}>
                {loading ? 'Sending OTP Email...' : <>Sign In &amp; Send OTP <ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: '#7a6758' }}>
              Don't have an account? <Link to="/signup" style={{ fontWeight: 700, color: '#b37a4c' }}>Create employee account</Link>
            </div>
          </>
        ) : (
          /* STEP 2: MANUAL LOGIN OTP VERIFICATION ON THIS PAGE */
          <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <div style={{ background: '#fff4c2', color: '#b37a4c', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #eee5d8' }}>
                <KeyRound size={28} />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12' }}>Verify Login OTP Code</h2>
              <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                A 6-digit security code was dispatched to<br />
                <strong style={{ color: '#2b1b12' }}>{userEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyLoginOtp}>
              <label style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12, fontWeight: 700, color: '#7a6758', marginBottom: 8, display: 'block', textAlign: 'center' }}>
                Enter 6-Digit Security OTP Code
              </label>

              <div style={{ position: 'relative', marginTop: 8 }}>
                <input
                  type="text"
                  maxLength="6"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  required
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: 12,
                    textAlign: 'center',
                    padding: '14px',
                    borderColor: '#b37a4c',
                    background: '#fdfaf6'
                  }}
                />
              </div>

              {resendMsg && (
                <div style={{ fontSize: 13, color: '#9c6137', fontWeight: 600, marginTop: 10, textAlign: 'center' }}>
                  {resendMsg}
                </div>
              )}

              {error && <div className="error-msg" style={{ textAlign: 'center' }}>{error}</div>}

              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 24 }}>
                {loading ? 'Verifying OTP Code...' : <>Verify OTP &amp; Enter Portal <CheckCircle2 size={16} /></>}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee5d8' }}>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setStep('credentials')} style={{ fontSize: 12 }}>
                &larr; Back to Email &amp; Password
              </button>

              <button type="button" className="btn-secondary btn-sm" onClick={handleResendLoginOtp} disabled={resending} style={{ fontSize: 12, gap: 6 }}>
                <RefreshCw size={13} /> {resending ? 'Resending...' : 'Resend OTP Email'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
