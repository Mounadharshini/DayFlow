import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, User, Hash, CheckCircle2, ShieldAlert, Sparkles, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Step state: 'register' vs 'otp'
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [otpInput, setOtpInput] = useState('');
  const [userToken, setUserToken] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const getPasswordStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Za-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service to create an account');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.signup(form);
      setUserToken(res.token);
      setRegisteredEmail(form.email);
      setStep('otp'); // Switch directly to OTP verification step on this page!
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 6) {
      setError('Please enter the 6-digit OTP code sent to your email');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.confirmVerifyEmail(userToken, otpInput.trim());
      // Log the verified user in
      login(userToken, res.user);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setResendMsg('');
    setError('');
    try {
      await api.sendVerifyEmail(userToken);
      setResendMsg('New OTP code dispatched to ' + registeredEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleGoogleSignUp = useGoogleLogin({
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

        login(res.token, res.user);
        navigate(res.user.role === 'Admin' ? '/admin' : '/dashboard');
      } catch (err) {
        setError(err.message || 'Google Sign-Up failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-Up was cancelled or encountered an error.');
    }
  });

  return (
    <div className="auth-split-wrapper">
      {/* Left Column: Bronze & Mocha Onboarding Hero */}
      <div className="auth-hero-section signup-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <span className="logo-badge" style={{ background: 'linear-gradient(135deg, #cc9966 0%, #9c6137 100%)' }}>EV</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>ElyVia Onboarding</span>
          </div>

          <div style={{ background: 'rgba(255, 244, 194, 0.15)', border: '1px solid rgba(255, 244, 194, 0.3)', padding: '6px 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fff4c2', marginBottom: 24 }}>
            <Sparkles size={15} /> Employee Registration Portal
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Join your team on <br />
            <span style={{ background: 'linear-gradient(135deg, #fff4c2 0%, #cc9966 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ElyVia HRMS
            </span>
          </h1>
          <p style={{ color: '#d1c1b5', fontSize: 15, lineHeight: 1.6, maxWidth: 440 }}>
            Create your official employee account to log daily attendance, manage paid leave requests, and inspect monthly paystubs.
          </p>
        </div>

        {/* Onboarding Timeline Steps */}
        <div style={{ margin: '36px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ background: step === 'register' ? '#b37a4c' : 'rgba(255, 255, 255, 0.2)', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
              {step === 'otp' ? '✓' : '1'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Create Employee Account</div>
              <div style={{ fontSize: 13, color: '#d1c1b5' }}>Provide your Employee ID and work email address.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ background: step === 'otp' ? '#b37a4c' : 'rgba(255, 255, 255, 0.15)', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>2</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Email OTP Verification</div>
              <div style={{ fontSize: 13, color: '#d1c1b5' }}>Instant OTP confirmation sent directly to your Gmail inbox.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>3</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Instant Portal Access</div>
              <div style={{ fontSize: 13, color: '#d1c1b5' }}>Access your personalized dashboard immediately.</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fff4c2' }}>
            <ShieldAlert size={16} /> HR Admin Permissions Note
          </div>
          <p style={{ fontSize: 12, color: '#d1c1b5', marginTop: 4 }}>
            Public signups are assigned <strong>Employee</strong> access. Admin privileges can only be granted by existing HR Administrators.
          </p>
        </div>
      </div>

      {/* Right Column: Dynamic Step 1 vs Step 2 (Inline OTP) */}
      <div className="auth-form-section">
        {step === 'register' ? (
          <>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Create employee account</h2>
              <p className="muted" style={{ marginTop: 4 }}>Get started with your company email</p>
            </div>

            {/* Google Sign-Up Button */}
            <button type="button" className="btn-google" onClick={() => handleGoogleSignUp()} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign up with Google
            </button>

            <div className="divider-with-text">
              <span>OR FILL IN EMPLOYEE DETAILS</span>
            </div>

            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label>Employee ID</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#7a6758' }} />
                    <input
                      value={form.employeeId}
                      onChange={update('employeeId')}
                      required
                      placeholder="EMP-105"
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>
                <div>
                  <label>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#7a6758' }} />
                    <input
                      value={form.name}
                      onChange={update('name')}
                      required
                      placeholder="John Smith"
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>
              </div>

              <label>Work Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#7a6758' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  required
                  placeholder="john.smith@company.com"
                  style={{ paddingLeft: 38 }}
                />
              </div>

              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#7a6758' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  required
                  placeholder="Min 8 chars, letter & number"
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

              {/* Text Only Password Strength Label */}
              {form.password && (
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: strength <= 1 ? '#dc2626' : strength === 2 ? '#d97706' : '#b37a4c' }}>
                  Password Strength: {strength <= 1 ? 'Weak' : strength === 2 ? 'Medium' : 'Strong'}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="agree" style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#7a6758', cursor: 'pointer' }}>
                  I agree to the Terms of Service & Privacy Policy
                </label>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 24 }}>
                {loading ? 'Sending OTP Email...' : <>Register & Verify Email <ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: '#7a6758' }}>
              Already registered? <Link to="/login" style={{ fontWeight: 700, color: '#b37a4c' }}>Sign in to account</Link>
            </div>
          </>
        ) : (
          /* STEP 2: INLINE OTP VERIFICATION FORM ON THIS PAGE */
          <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <div style={{ background: '#fff4c2', color: '#b37a4c', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #eee5d8' }}>
                <KeyRound size={28} />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12' }}>Verify Email Address</h2>
              <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                We sent a 6-digit verification code to<br />
                <strong style={{ color: '#2b1b12' }}>{registeredEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP}>
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
                {loading ? 'Verifying Code...' : <>Verify Email & Enter Dashboard <CheckCircle2 size={16} /></>}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee5d8' }}>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setStep('register')} style={{ fontSize: 12 }}>
                &larr; Back to Edit Info
              </button>

              <button type="button" className="btn-secondary btn-sm" onClick={handleResendOTP} disabled={resending} style={{ fontSize: 12, gap: 6 }}>
                <RefreshCw size={13} /> {resending ? 'Resending...' : 'Resend OTP Email'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
