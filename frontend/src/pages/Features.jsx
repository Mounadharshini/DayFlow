import { Link } from 'react-router-dom';
import { 
  Calendar, FileCheck, CreditCard, Users, BarChart3, ShieldCheck, Sparkles 
} from 'lucide-react';
import PublicHeader from '../components/PublicHeader';

export default function Features() {
  return (
    <div style={{ background: '#fdfaf6', minHeight: '100vh', color: '#2b1b12', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* 1. Shared Unified Navbar (Home | Features | About | Contact) */}
      <PublicHeader />

      {/* 2. Sleek Clean Header */}
      <section style={{ 
        background: '#231710', 
        color: 'white', 
        padding: '50px 24px 60px', 
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 244, 194, 0.15)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ background: 'rgba(255, 244, 194, 0.15)', border: '1px solid rgba(255, 244, 194, 0.3)', padding: '6px 16px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fff4c2', marginBottom: 20 }}>
            <Sparkles size={15} /> Comprehensive Capabilities Platform
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 14 }}>ElyVia HRMS Features</h1>
          <p style={{ color: '#d1c1b5', fontSize: 17, lineHeight: 1.6 }}>
            Explore our complete suite of workforce management tools engineered for attendance precision, instant leave workflows, and automated payroll structures.
          </p>
        </div>
      </section>

      {/* 3. Main Features Grid */}
      <section style={{ maxWidth: 1200, margin: '40px auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#fff4c2', color: '#b37a4c', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 12 }}>Automated Attendance Logger</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Server-timestamp check-in and check-out logs, automated work duration metrics, duplicate punch prevention, and daily/weekly logs.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#f4ece4', color: '#9c6137', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FileCheck size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 12 }}>Leave Workflow &amp; Approvals</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Submit Paid, Sick, or Unpaid leave applications. Features leave duration auto-calculators, remaining quota tracking, and HR comments.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#fff4c2', color: '#b37a4c', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <CreditCard size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 12 }}>Salary Breakdown &amp; Paystubs</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Read-only employee payroll portal detailing Basic salary, HRA, Allowances, PF, Tax, and printable PDF salary paystubs.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#f4ece4', color: '#9c6137', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 12 }}>360° Employee Directory</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Searchable employee roster allowing HR Administrators to inspect profiles, update compensation, and promote staff to HR Admin.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#fff4c2', color: '#b37a4c', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 12 }}>HR Analytics &amp; CSV Export</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Visual 7-day attendance trend distribution charts, departmental ratio metrics, and instant CSV report exports.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#f4ece4', color: '#9c6137', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 12 }}>Enterprise Security &amp; OAuth</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Sign in effortlessly using your official Google Account or 6-digit email OTP verification directly on the sign up screen.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#19100b', color: '#d1c1b5', padding: '36px 24px', borderTop: '1px solid rgba(255,244,194,0.1)', textAlign: 'center', fontSize: 13 }}>
        &copy; {new Date().getFullYear()} ElyVia HRMS Platform. All rights reserved.
      </footer>
    </div>
  );
}
