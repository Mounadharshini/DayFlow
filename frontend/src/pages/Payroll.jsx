import { useEffect, useState } from 'react';
import { CreditCard, FileText, Printer, DollarSign, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import PaystubModal from '../components/PaystubModal';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Payroll() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [paystub, setPaystub] = useState(null);
  const [selectedPaystub, setSelectedPaystub] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.getMyPaystub(token);
      setPaystub(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {selectedPaystub && <PaystubModal paystub={selectedPaystub} onClose={() => setSelectedPaystub(null)} />}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>
            Salary & Paystubs
          </h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Read-only monthly compensation statements and tax deduction breakdowns
          </p>
        </div>

        {paystub && (
          <button 
            className="btn-primary btn-sm" 
            onClick={() => setSelectedPaystub(paystub)} 
            style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', padding: '10px 20px', gap: 8 }}
          >
            <Printer size={16} /> View & Print Paystub PDF
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#7a6758', fontSize: 14 }}>
          Loading salary statements...
        </div>
      ) : paystub ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Compensation Overview Banner */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #231710 0%, #3d291c 60%, #9c6137 100%)',
            color: 'white',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 12px 32px rgba(35, 23, 16, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ background: 'rgba(255, 244, 194, 0.15)', border: '1px solid rgba(255, 244, 194, 0.3)', padding: '4px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#fff4c2', marginBottom: 12 }}>
                  <CheckCircle2 size={14} color="#cc9966" /> PAYROLL PROCESSED & DISBURSED
                </div>
                <div style={{ fontSize: 13, color: '#d1c1b5', fontWeight: 700, textTransform: 'uppercase' }}>AUGUST 2026 NET TAKE-HOME</div>
                <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff4c2', margin: '4px 0 8px' }}>
                  ₹ {(paystub.netPay || paystub.netSalary || 100800).toLocaleString('en-IN')}
                </h2>
                <div style={{ fontSize: 13, color: '#d1c1b5' }}>
                  Direct Bank Disbursement &bull; Employee ID: <strong>{user?.employeeId || 'EMP-101'}</strong>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '20px 28px', borderRadius: 18, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#cc9966', fontWeight: 800, textTransform: 'uppercase' }}>ANNUAL PACKAGE</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white', marginTop: 4 }}>
                  ₹ {(paystub.annualSalary || 120000).toLocaleString('en-IN')} / yr
                </div>
              </div>
            </div>
          </div>

          {/* Inline Summary Stat Row */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #eee5d8',
            borderRadius: 20,
            padding: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20
          }}>
            <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>MONTHLY GROSS SALARY</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
                ₹ {(paystub.monthlyGross || 120000).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#7a6758', marginTop: 4 }}>Before deductions</div>
            </div>

            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>TOTAL DEDUCTIONS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
                -₹ {(paystub.deductions?.totalDeductions || 19200).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>PF + Tax Deductions</div>
            </div>

            <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>NET DISBURSEMENT</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>
                ₹ {(paystub.netPay || 100800).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#9c6137', marginTop: 4 }}>Net Salary Received</div>
            </div>
          </div>

          {/* Component Breakdown Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Earnings Breakdown */}
            <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginBottom: 16 }}>Earnings Component Breakdown</h3>
              <div className="paystub-row">
                <span>Basic Salary (50%)</span>
                <strong>₹ {(paystub.earnings?.basic || 60000).toLocaleString()} / mo</strong>
              </div>
              <div className="paystub-row">
                <span>House Rent Allowance (HRA 25%)</span>
                <strong>₹ {(paystub.earnings?.hra || 30000).toLocaleString()} / mo</strong>
              </div>
              <div className="paystub-row">
                <span>Special Allowances (25%)</span>
                <strong>₹ {(paystub.earnings?.allowances || 30000).toLocaleString()} / mo</strong>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#dc2626', marginBottom: 16 }}>Deductions & Taxes</h3>
              <div className="paystub-row">
                <span>Provident Fund (PF 6%)</span>
                <strong style={{ color: '#dc2626' }}>-₹ {(paystub.deductions?.pf || 7200).toLocaleString()} / mo</strong>
              </div>
              <div className="paystub-row">
                <span>Income Tax / TDS (10%)</span>
                <strong style={{ color: '#dc2626' }}>-₹ {(paystub.deductions?.tax || 12000).toLocaleString()} / mo</strong>
              </div>
              <div className="paystub-row" style={{ borderTop: '2px solid #eee5d8', marginTop: 10, paddingTop: 10 }}>
                <span>Total Monthly Deductions</span>
                <strong style={{ color: '#dc2626' }}>-₹ {(paystub.deductions?.totalDeductions || 19200).toLocaleString()} / mo</strong>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, background: '#ffffff', borderRadius: 20, border: '1px solid #eee5d8' }}>
          No paystub record found.
        </div>
      )}
    </div>
  );
}
