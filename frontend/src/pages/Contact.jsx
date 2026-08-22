import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '../components/Toast';
import PublicHeader from '../components/PublicHeader';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General HR Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Your message has been sent to HR Administration!', 'success');
    }, 800);
  };

  return (
    <div style={{ background: '#fdfaf6', minHeight: '100vh', color: '#2b1b12', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* 1. Shared Unified Navbar (Home | Features | About | Contact) */}
      <PublicHeader />

      {/* 2. Sleek Clean Header (Solid Dark Espresso with subtle accent - NO harsh gradient band) */}
      <section style={{ 
        background: '#231710', 
        color: 'white', 
        padding: '50px 24px 60px', 
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 244, 194, 0.15)'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ background: 'rgba(255, 244, 194, 0.15)', border: '1px solid rgba(255, 244, 194, 0.3)', padding: '6px 16px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fff4c2', marginBottom: 20 }}>
            <MessageSquare size={15} /> ElyVia Support &amp; HR Communications
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 14 }}>Contact HR Support</h1>
          <p style={{ color: '#d1c1b5', fontSize: 16, lineHeight: 1.6 }}>
            Have questions regarding workforce onboarding, leave policies, or payroll structures? Our HR administration team is here to assist you.
          </p>
        </div>
      </section>

      {/* 3. Main Contact Cards Content (Clean & Seamless Background) */}
      <section style={{ maxWidth: 1100, margin: '40px auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
          {/* Contact Details Card */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.05)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 24 }}>Get in Touch</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ background: '#fff4c2', color: '#b37a4c', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#7a6758', textTransform: 'uppercase' }}>WORK EMAIL</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2b1b12', marginTop: 2 }}>admin@elyvia.com</div>
                  <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>General HR &amp; support inquiries</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ background: '#f4ece4', color: '#9c6137', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#7a6758', textTransform: 'uppercase' }}>PHONE DIRECTORY</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2b1b12', marginTop: 2 }}>+1 (555) 019-2834</div>
                  <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Mon - Fri &bull; 9:00 AM - 6:00 PM EST</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ background: '#fff4c2', color: '#b37a4c', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#7a6758', textTransform: 'uppercase' }}>HEADQUARTERS</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2b1b12', marginTop: 2 }}>ElyVia HR Tech Park</div>
                  <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Suite 400 &bull; Corporate District</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ background: '#f4ece4', color: '#9c6137', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#7a6758', textTransform: 'uppercase' }}>RESPONSE TIME</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2b1b12', marginTop: 2 }}>Within 2 Business Hours</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form Card */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', padding: 36, borderRadius: 24, boxShadow: '0 8px 24px rgba(35,23,16,0.05)' }}>
            {!submitted ? (
              <>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b1b12', marginBottom: 6 }}>Send Inquiry Message</h3>
                <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Fill in your contact details below to reach HR Administration.</p>

                <form onSubmit={handleSubmit}>
                  <label>Your Full Name</label>
                  <input 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith"
                    required 
                  />

                  <label>Work Email Address</label>
                  <input 
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@company.com"
                    required 
                  />

                  <label>Inquiry Category</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    <option value="General HR Inquiry">General HR Inquiry</option>
                    <option value="Attendance Policy">Attendance Policy</option>
                    <option value="Leave Management">Leave Management</option>
                    <option value="Payroll & Salary">Payroll &amp; Salary Structure</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>

                  <label>Message Content</label>
                  <textarea 
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your inquiry details here..."
                    required
                  />

                  <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 24, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                    {loading ? 'Sending Message...' : <>Submit Inquiry Message <Send size={16} /></>}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ background: '#fff4c2', color: '#b37a4c', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #eee5d8' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#2b1b12' }}>Message Received!</h3>
                <p style={{ color: '#7a6758', fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
                  Thank you, <strong>{form.name}</strong>. Your message regarding <strong>{form.subject}</strong> has been routed to HR Administration.
                </p>

                <button className="btn-secondary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: 'General HR Inquiry', message: '' }); }} style={{ marginTop: 28 }}>
                  Send Another Inquiry
                </button>
              </div>
            )}
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
