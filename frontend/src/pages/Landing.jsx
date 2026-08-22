import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, ShieldCheck, Users, Calendar, FileCheck, CreditCard, 
  BarChart3, Sparkles, LayoutDashboard, Check, MessageSquare, Mail, Phone, MapPin
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import PublicHeader from '../components/PublicHeader';

export default function Landing() {
  const { auth, token, user } = useAuth();
  const activeToken = token || auth?.token;
  const activeUser = user || auth?.user;

  const isAdmin = activeUser?.role === 'Admin';
  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  return (
    <div id="home" style={{ background: '#fdfaf6', minHeight: '100vh', color: '#2b1b12', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* 1. Shared Unified Navbar */}
      <PublicHeader />

      {/* 2. Solid Dark Espresso Hero Section (No Blending) */}
      <section style={{ 
        padding: '85px 24px 75px', 
        background: '#231710', 
        color: 'white', 
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ 
            background: 'rgba(255, 244, 194, 0.15)', 
            border: '1px solid rgba(204, 153, 102, 0.35)', 
            padding: '8px 20px', 
            borderRadius: 999, 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            fontSize: 13, 
            fontWeight: 700, 
            color: '#fff4c2', 
            marginBottom: 28 
          }}>
            <Sparkles size={16} color="#d4af37" className="glitter-sparkle" /> Modern Enterprise Workforce Management Platform
          </div>

          <h1 style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Every Workday,<br />
            <span className="shimmer-text">
              Perfectly Aligned &amp; Automated.
            </span>
          </h1>

          <p style={{ color: '#d1c1b5', fontSize: 18, lineHeight: 1.6, maxWidth: 720, margin: '0 auto 40px' }}>
            ElyVia HRMS provides complete employee self-service, automated attendance clocking, instant leave workflows, structured payroll statements, and 360° workforce analytics in a unified workspace.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {activeToken ? (
              <Link 
                to={dashboardPath} 
                className="btn-primary" 
                style={{ width: 'auto', padding: '16px 38px', fontSize: 16, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', color: '#ffffff', boxShadow: '0 4px 16px rgba(179, 122, 76, 0.35)', gap: 10, whiteSpace: 'nowrap' }}
              >
                <LayoutDashboard size={18} /> Access Your Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/signup" 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '16px 38px', fontSize: 16, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', color: '#ffffff', boxShadow: '0 4px 16px rgba(179, 122, 76, 0.35)', gap: 10, whiteSpace: 'nowrap' }}
                >
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/login" 
                  className="btn-secondary" 
                  style={{ width: 'auto', padding: '16px 32px', fontSize: 16, background: '#fff4c2', color: '#2b1b12', border: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  Sign In to Portal
                </Link>
              </>
            )}
          </div>

          {/* Trust Highlights */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 52, flexWrap: 'wrap', fontSize: 14, color: '#fff4c2', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} color="#cc9966" /> Real Database Persistence</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} color="#cc9966" /> Role-Based Access Control</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} color="#cc9966" /> Gmail SMTP &amp; OAuth 2.0</span>
          </div>
        </div>
      </section>

      {/* 3. HRMS Core Features Section */}
      <section id="features" style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 36px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#b37a4c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Enterprise Capability Suite
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>
            Built for High-Growth Workforces &amp; HR Teams
          </h2>
          <p className="muted" style={{ fontSize: 16, marginTop: 10, maxWidth: 640, margin: '10px auto 0' }}>
            A comprehensive human resource management ecosystem designed for operational clarity.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          <div className="card" style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 32, borderRadius: 20 }}>
            <div className="icon-wrapper icon-primary" style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Automated Attendance Tracking</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Exact server-timestamp check-in and check-out tracking, daily working hour calculations, and duplicate punch prevention.
            </p>
          </div>

          <div className="card" style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 32, borderRadius: 20 }}>
            <div className="icon-wrapper icon-success" style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <FileCheck size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Leave Request &amp; Approval Engine</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Apply for Paid, Sick, or Unpaid leaves with duration calculators, balance quotas, HR feedback comments, and real-time status updates.
            </p>
          </div>

          <div className="card" style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 32, borderRadius: 20 }}>
            <div className="icon-wrapper icon-warning" style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <CreditCard size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Salary Structure &amp; Paystubs</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Read-only employee payroll view detailing Basic salary, HRA, Allowances, PF, Tax, and printable PDF salary paystubs.
            </p>
          </div>

          <div className="card" style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 32, borderRadius: 20 }}>
            <div className="icon-wrapper icon-primary" style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Employee Directory &amp; Profile Vault</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Structured employee details, contact updates, personnel document attachments, and role promotion privileges.
            </p>
          </div>

          <div className="card" style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 32, borderRadius: 20 }}>
            <div className="icon-wrapper icon-success" style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>HR Analytics &amp; CSV Data Reports</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              7-day attendance trend distribution charts, departmental ratio metrics, and instant CSV report exports.
            </p>
          </div>

          <div className="card" style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 32, borderRadius: 20 }}>
            <div className="icon-wrapper icon-warning" style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 20 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Enterprise Role Security &amp; JWT</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.6 }}>
              Strict role-based routing protecting employee data. Employees inspect exclusively their own records; HR manages the organization.
            </p>
          </div>
        </div>
      </section>

      {/* 4. About Section */}
      <section id="about" style={{ 
        background: '#fff4c2', 
        borderTop: '1px solid #eee5d8', 
        borderBottom: '1px solid #eee5d8', 
        padding: '80px 36px' 
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#9c6137', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Why Modern Workforces Choose ElyVia
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 20 }}>
              Eliminate Fragmented HR Spreadsheets
            </h2>
            <p style={{ color: '#7a6758', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              Legacy HR tools rely on static spreadsheets and disconnected systems. ElyVia HRMS provides a single, unified database where every punch, leave request, and salary update is synchronized in real time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ background: '#b37a4c', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Check size={14} />
                </div>
                <div>
                  <strong style={{ color: '#2b1b12' }}>100% Database Persistence:</strong> Zero fake data or client-only state fallbacks.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ background: '#b37a4c', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Check size={14} />
                </div>
                <div>
                  <strong style={{ color: '#2b1b12' }}>Zero Alert Popups:</strong> Professional toast notifications and interactive feedback modals.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ background: '#b37a4c', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Check size={14} />
                </div>
                <div>
                  <strong style={{ color: '#2b1b12' }}>Expansive Canvas Layout:</strong> Wide 1600px canvas tailored for modern high-resolution displays.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: 36, borderRadius: 24, border: '1px solid #eee5d8', boxShadow: '0 12px 32px rgba(35, 23, 16, 0.08)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 20 }}>System Highlights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#9c6137' }}>100%</div>
                <div style={{ fontSize: 13, color: '#7a6758', fontWeight: 600, marginTop: 2 }}>Database Driven</div>
              </div>
              <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#b37a4c' }}>0ms</div>
                <div style={{ fontSize: 13, color: '#7a6758', fontWeight: 600, marginTop: 2 }}>Mock Fallback</div>
              </div>
              <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12' }}>24/7</div>
                <div style={{ fontSize: 13, color: '#7a6758', fontWeight: 600, marginTop: 2 }}>Self-Service Access</div>
              </div>
              <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#9c6137' }}>OAuth</div>
                <div style={{ fontSize: 13, color: '#7a6758', fontWeight: 600, marginTop: 2 }}>Google &amp; JWT Auth</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Clean Pre-Footer Heading Section */}
      <section style={{ 
        background: '#231710', 
        color: 'white', 
        padding: '50px 24px', 
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>
            Ready to Experience ElyVia HRMS?
          </h2>
          <p style={{ color: '#d1c1b5', fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>
            Empower your team with automated attendance tracking, leave workflows, and payroll structure compliance.
          </p>
          <div>
            <Link 
              to="/contact" 
              className="btn-secondary btn-sm" 
              style={{ background: 'rgba(255, 244, 194, 0.15)', color: '#fff4c2', border: '1px solid rgba(204, 153, 102, 0.3)', padding: '10px 24px', borderRadius: 10, fontWeight: 700, gap: 8 }}
            >
              <MessageSquare size={16} /> Open Contact Support Page &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Contact & Real-World Enterprise Footer */}
      <footer id="contact" style={{ background: '#19100b', color: '#d1c1b5', padding: '60px 36px 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 48 }}>
            {/* Column 1: Logo & Description */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <img src="/elyvia-logo.jpg" alt="ElyVia Logo" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }} />
                <span className="brand-name" style={{ fontSize: 22 }}>ElyVia HRMS</span>
              </div>
              <p style={{ fontSize: 13, color: '#a39183', lineHeight: 1.6 }}>
                Enterprise Human Resource Management System engineered for automated attendance tracking, leave workflow management, and payroll compliance.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <li><Link to="/" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Home Portal</Link></li>
                <li><Link to="/features" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Features</Link></li>
                <li><Link to="/about" style={{ color: '#d1c1b5', textDecoration: 'none' }}>About Us</Link></li>
                <li><Link to="/contact" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Contact Support</Link></li>
                <li><Link to="/login" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Employee Sign In</Link></li>
              </ul>
            </div>

            {/* Column 3: Features */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                HRMS Features
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <li><Link to="/attendance" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Attendance Tracking</Link></li>
                <li><Link to="/leaves" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Leave Management</Link></li>
                <li><Link to="/payroll" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Payroll &amp; Paystubs</Link></li>
                <li><Link to="/profile" style={{ color: '#d1c1b5', textDecoration: 'none' }}>Employee Directory</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact & Support */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                Support &amp; Contact
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#d1c1b5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={15} color="#cc9966" /> admin@elyvia.com
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={15} color="#cc9966" /> +1 (555) 019-2834
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={15} color="#cc9966" /> Corporate HQ &bull; Tech Park
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            borderTop: '1px solid rgba(255,244,194,0.1)', 
            paddingTop: 24, 
            display: 'flex', 
            justify: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 16, 
            fontSize: 12, 
            color: '#a39183' 
          }}>
            <div>
              &copy; {new Date().getFullYear()} ElyVia HRMS Platform. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <a href="#home" style={{ color: '#a39183', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#home" style={{ color: '#a39183', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#home" style={{ color: '#a39183', textDecoration: 'none' }}>Security Standard</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
