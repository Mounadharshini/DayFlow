import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Award, HeartHandshake, Layers
} from 'lucide-react';
import PublicHeader from '../components/PublicHeader';

export default function About() {
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
            <Award size={15} /> Purpose-Built HR Infrastructure
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 14 }}>About ElyVia HRMS</h1>
          <p style={{ color: '#d1c1b5', fontSize: 17, lineHeight: 1.6 }}>
            Engineered to streamline human resource workflows, eliminate spreadsheet fragmentation, and empower modern workforces with transparent self-service access.
          </p>
        </div>
      </section>

      {/* 3. Main Content Grid */}
      <section style={{ maxWidth: 1100, margin: '40px auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, marginBottom: 48 }}>
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#fff4c2', color: '#b37a4c', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <HeartHandshake size={22} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Our Vision</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7 }}>
              To deliver an intuitive, real-time HR operating system where attendance tracking, time-off management, and salary structure specifications operate in complete harmony.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#f4ece4', color: '#9c6137', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>100% Database Persistence</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7 }}>
              Zero fake data or client-only mock fallbacks. Every check-in punch, leave request, and salary update is written directly to backend database storage.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.04)' }}>
            <div style={{ background: '#fff4c2', color: '#b37a4c', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 10 }}>Data Privacy &amp; Role Security</h3>
            <p style={{ color: '#7a6758', fontSize: 14, lineHeight: 1.7 }}>
              Role-based authorization guarantees employee data privacy. Employees inspect exclusively their own records while HR Administrators manage company operations.
            </p>
          </div>
        </div>

        {/* Company Metrics Box */}
        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 40, borderRadius: 24 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', textAlign: 'center', marginBottom: 28 }}>
            Engineered for Modern Enterprise Operations
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#9c6137' }}>100%</div>
              <div style={{ fontSize: 13, color: '#7a6758', fontWeight: 600, marginTop: 4 }}>Real Database Data</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#b37a4c' }}>0ms</div>
              <div style={{ fontSize: 13, color: '#7a6758', fontWeight: 600, marginTop: 4 }}>Mock Fallbacks</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#2b1b12' }}>24/7</div>
              <div style={{ fontSize: 13, color: '#7a6758', fontWeight: 600, marginTop: 4 }}>Self-Service Access</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#9c6137' }}>OAuth</div>
              <div style={{ fontSize: 13, color: '#7a6758', fontWeight: 600, marginTop: 4 }}>Google &amp; JWT Security</div>
            </div>
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
