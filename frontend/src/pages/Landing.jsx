import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Shield, Users, Calendar, FileCheck, CreditCard, BarChart3, Sparkles, Star, Award, Zap, ChevronRight, Lock, Mail } from 'lucide-react';

export default function Landing() {
  return (
    <div className="landing-wrapper" style={{ background: '#fdfaf6', minHeight: '100vh', color: '#2b1b12' }}>
      {/* Landing Navbar */}
      <header style={{ background: '#231710', color: 'white', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(35, 23, 16, 0.15)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="logo-badge" style={{ padding: '8px 12px', fontSize: 18 }}>EV</span>
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>ElyVia</span>
              <span style={{ fontSize: 11, color: '#cc9966', fontWeight: 700, marginLeft: 8, letterSpacing: '0.05em' }}>HRMS</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, fontWeight: 600 }}>
            <a href="#features" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Features</a>
            <a href="#solutions" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Solutions</a>
            <a href="#pricing" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Pricing</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" className="btn-secondary btn-sm" style={{ background: 'rgba(255, 244, 194, 0.1)', color: '#fff4c2', border: '1px solid rgba(255, 244, 194, 0.25)', padding: '9px 18px' }}>
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary btn-sm" style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
              Register Account <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(180deg, #231710 0%, #3d291c 70%, #fdfaf6 100%)', color: 'white', textAlignment: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255, 244, 194, 0.15)', border: '1px solid rgba(255, 244, 194, 0.3)', padding: '8px 18px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fff4c2', marginBottom: 28 }}>
            <Sparkles size={16} /> Enterprise Workforce Intelligence Platform
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Every workday, <br />
            <span style={{ background: 'linear-gradient(135deg, #fff4c2 0%, #cc9966 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              perfectly aligned.
            </span>
          </h1>

          <p style={{ color: '#d1c1b5', fontSize: 18, lineHeight: 1.6, maxWidth: 680, margin: '0 auto 36px' }}>
            The all-in-one HRMS solution designed to streamline employee onboarding, automated attendance tracking, instant Gmail SMTP leave approvals, and official PDF paystubs.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-primary" style={{ width: 'auto', padding: '16px 36px', fontSize: 16, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', boxShadow: '0 8px 24px rgba(179, 122, 76, 0.4)' }}>
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ width: 'auto', padding: '16px 32px', fontSize: 16, background: '#fff4c2', color: '#3d291c', border: 'none', fontWeight: 700 }}>
              Sign In to Portal
            </Link>
          </div>

          {/* Hero Feature Highlights Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 48, flexWrap: 'wrap', fontSize: 14, color: '#fff4c2', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} color="#cc9966" /> Zero Native Dependencies</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} color="#cc9966" /> Real Gmail SMTP Email Alerts</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} color="#cc9966" /> Google OAuth 2.0 Integration</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>
            Built for Modern Workforces & HR Teams
          </h2>
          <p className="muted" style={{ fontSize: 16, marginTop: 8 }}>
            Everything you need to manage your organization in one elegant Cream & Brown portal
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          {/* Card 1: Attendance */}
          <div className="card" style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 32 }}>
            <div className="icon-wrapper" style={{ background: '#b37a4c', color: 'white', width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Automated Attendance & Live Clock</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Real-time check-in and check-out logger calculating exact work hours, late flags, and attendance matrixes.
            </p>
          </div>

          {/* Card 2: Leaves */}
          <div className="card" style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 32 }}>
            <div className="icon-wrapper" style={{ background: '#9c6137', color: 'white', width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <FileCheck size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Instant Gmail Leave Approvals</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Apply for Paid, Sick, or Unpaid leaves with balance tracking. Triggers real HTML emails with approval action buttons.
            </p>
          </div>

          {/* Card 3: Payroll */}
          <div className="card" style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 32 }}>
            <div className="icon-wrapper" style={{ background: '#cc9966', color: 'white', width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <CreditCard size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Printable Salary Slips & Paystubs</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Complete breakdown of Basic pay, HRA, Allowances, PF, and Tax deductions with one-click printable PDF salary statements.
            </p>
          </div>

          {/* Card 4: Workforce Roster */}
          <div className="card" style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 32 }}>
            <div className="icon-wrapper" style={{ background: '#3d291c', color: 'white', width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>360° Employee Inspector & Promotion</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Searchable employee roster allowing HR Administrators to inspect profiles, update salaries, and promote staff to HR Admin.
            </p>
          </div>

          {/* Card 5: Analytics */}
          <div className="card" style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 32 }}>
            <div className="icon-wrapper" style={{ background: '#b37a4c', color: 'white', width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>HR Analytics & CSV Exporter</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Visual 7-day attendance trend distribution charts, departmental ratio metrics, and instant CSV data export.
            </p>
          </div>

          {/* Card 6: Security */}
          <div className="card" style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 32 }}>
            <div className="icon-wrapper" style={{ background: '#9c6137', color: 'white', width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Google OAuth & Email OTP Security</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Sign in effortlessly using your official Google Account or 6-digit email OTP verification directly on the signup screen.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section style={{ background: 'linear-gradient(135deg, #231710 0%, #3d291c 100%)', color: 'white', padding: '60px 24px', textAlign: 'center', margin: '40px 0 0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Ready to transform your HR management?</h2>
          <p style={{ color: '#d1c1b5', fontSize: 16, marginBottom: 32 }}>
            Join ElyVia today and experience effortless workday alignment.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/signup" className="btn-primary" style={{ width: 'auto', padding: '14px 32px', fontSize: 15, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
              Create Employee Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ width: 'auto', padding: '14px 28px', fontSize: 15, background: '#fff4c2', color: '#2b1b12', border: 'none' }}>
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer style={{ background: '#19100b', color: '#d1c1b5', padding: '40px 24px 24px', borderTop: '1px solid rgba(255,244,194,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="logo-badge" style={{ padding: '6px 10px', fontSize: 16 }}>EV</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>ElyVia HRMS</span>
          </div>

          <div style={{ fontSize: 13, color: '#a39183' }}>
            &copy; {new Date().getFullYear()} ElyVia Operating System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
