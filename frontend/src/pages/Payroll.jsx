import { useEffect, useState } from 'react';
import { 
  CreditCard, DollarSign, Download, Eye, FileText, CheckCircle2, 
  ShieldCheck, RefreshCw, Printer, X, Building, Calendar, ArrowUpRight 
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export default function Payroll() {
  const { auth, token, user } = useAuth();
  const activeToken = token || auth?.token;
  const activeUser = user || auth?.user;
  const { showToast } = useToast();

  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaystub, setSelectedPaystub] = useState(null);

  const loadData = async () => {
    if (!activeToken) return;
    try {
      const res = await api.getMyPayroll(activeToken);
      setPayrollData(res);
    } catch (e) {
      console.error('Failed loading payroll data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Fast Sync Polling Every 3 Seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [activeToken]);

  const structure = payrollData?.structure || {
    name: activeUser?.name || 'Employee',
    employeeId: activeUser?.employeeId || 'EMP-101',
    department: activeUser?.department || 'Engineering',
    designation: activeUser?.designation || 'Specialist',
    annualSalary: 600000,
    monthlyGross: 50000,
    basicSalary: 25000,
    hra: 12500,
    allowances: 12500,
    pf: 3000,
    tax: 5000,
    grossSalary: 50000,
    totalDeductions: 8000,
    netSalary: 42000,
    bankName: 'ElyVia Corporate Bank',
    accountNumber: '**** **** 4892'
  };

  const history = payrollData?.history || [];

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Detailed Salary Slip View / Print Modal */}
      {selectedPaystub && (
        <div className="modal-backdrop" onClick={() => setSelectedPaystub(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, borderRadius: 20, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '2px solid #eee5d8', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/elyvia-logo.jpg" alt="ElyVia Logo" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #cc9966' }} />
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>ElyVia Corporate Payslip</h3>
                  <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 600 }}>Pay Period: {selectedPaystub.payPeriod || 'August 2026'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary btn-sm" onClick={handlePrintSlip} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6 }}>
                  <Printer size={15} /> Print / Save PDF
                </button>
                <button className="close-btn" onClick={() => setSelectedPaystub(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Payslip Header Info */}
            <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', borderRadius: 14, padding: 18, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>EMPLOYEE DETAILS</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{structure.name}</div>
                <div style={{ fontSize: 12, color: '#7a6758' }}>ID: {structure.employeeId} &bull; {structure.department}</div>
                <div style={{ fontSize: 12, color: '#7a6758' }}>{structure.designation}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>DISBURSEMENT DETAILS</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9c6137', marginTop: 2 }}>Status: {selectedPaystub.paymentStatus || 'Paid'}</div>
                <div style={{ fontSize: 12, color: '#7a6758' }}>Payment Date: {selectedPaystub.paymentDate || '2026-08-01'}</div>
                <div style={{ fontSize: 12, color: '#7a6758' }}>Bank: {structure.bankName}</div>
              </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="table-container" style={{ marginTop: 0, marginBottom: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th>Earnings Component</th>
                    <th>Amount (₹)</th>
                    <th>Deduction Component</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Basic Monthly Salary</td>
                    <td style={{ fontWeight: 700, color: '#2b1b12' }}>₹ {(selectedPaystub.basicSalary || structure.basicSalary).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>Provident Fund (PF)</td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>₹ {(selectedPaystub.pf || structure.pf).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>House Rent Allowance (HRA)</td>
                    <td style={{ fontWeight: 700, color: '#2b1b12' }}>₹ {(selectedPaystub.hra || structure.hra).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>Professional Tax</td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>₹ {(selectedPaystub.tax || structure.tax).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Special Allowances</td>
                    <td style={{ fontWeight: 700, color: '#2b1b12' }}>₹ {(selectedPaystub.allowances || structure.allowances).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, background: '#fdfaf6' }}>Total Deductions</td>
                    <td style={{ fontWeight: 800, color: '#dc2626', background: '#fdfaf6' }}>
                      ₹ {((selectedPaystub.pf || structure.pf) + (selectedPaystub.tax || structure.tax)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr style={{ background: '#fff4c2' }}>
                    <td style={{ fontWeight: 800, color: '#2b1b12' }}>Total Monthly Gross</td>
                    <td style={{ fontWeight: 800, color: '#2b1b12' }}>₹ {(selectedPaystub.grossSalary || structure.grossSalary).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 800, color: '#9c6137' }}>NET PAYABLE SALARY</td>
                    <td style={{ fontWeight: 900, fontSize: 16, color: '#9c6137' }}>
                      ₹ {(selectedPaystub.netSalary || structure.netSalary).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#7a6758', background: '#fdfaf6', padding: 12, borderRadius: 10, border: '1px solid #eee5d8' }}>
              ⚡ This is a computer-generated salary slip from <strong>ElyVia HRMS</strong> and requires no physical signature.
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>My Salary &amp; Payroll</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Read-only employee salary breakdown, monthly net pay calculations, and downloadable paystubs
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary btn-sm" 
            onClick={() => {
              if (history.length > 0) setSelectedPaystub(history[0]);
              else showToast('No issued salary slip available yet', 'info');
            }}
            style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6, padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
          >
            <FileText size={14} /> View Latest Salary Slip
          </button>
          <button className="btn-secondary btn-sm" onClick={loadData} disabled={loading} style={{ gap: 6, padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>
            <RefreshCw size={14} /> Refresh Real-Time Sync
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
        boxShadow: '0 2px 8px rgba(35, 23, 16, 0.04)'
      }}>
        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>ANNUAL COST TO COMPANY (CTC)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>₹ {structure.annualSalary.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Annual Total Package</div>
        </div>

        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>MONTHLY GROSS SALARY</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>₹ {structure.grossSalary.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Basic + HRA + Allowances</div>
        </div>

        <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>MONTHLY NET PAYABLE</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#9c6137', marginTop: 4 }}>₹ {structure.netSalary.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Disbursed to Bank Account</div>
        </div>

        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>TOTAL MONTHLY DEDUCTIONS</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>₹ {structure.totalDeductions.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2 }}>PF + Professional Tax</div>
        </div>
      </div>

      {/* Salary Structure Breakdown Table */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Salary Breakdown &amp; Component Validation</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Official salary structure configured in database engine</p>
          </div>

          <span className="badge badge-approved" style={{ padding: '6px 12px', fontSize: 12 }}>
            <ShieldCheck size={14} /> Read-Only Employee View
          </span>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Type</th>
                <th>Monthly Amount (₹)</th>
                <th>Annual Amount (₹)</th>
                <th>Validation Rule</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: '#2b1b12' }}>Basic Salary</td>
                <td><span className="badge badge-present">Earning</span></td>
                <td style={{ fontWeight: 700 }}>₹ {structure.basicSalary.toLocaleString('en-IN')}</td>
                <td>₹ {(structure.basicSalary * 12).toLocaleString('en-IN')}</td>
                <td style={{ fontSize: 12, color: '#7a6758' }}>Core Basic Compensation (50% CTC)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#2b1b12' }}>House Rent Allowance (HRA)</td>
                <td><span className="badge badge-present">Earning</span></td>
                <td style={{ fontWeight: 700 }}>₹ {structure.hra.toLocaleString('en-IN')}</td>
                <td>₹ {(structure.hra * 12).toLocaleString('en-IN')}</td>
                <td style={{ fontSize: 12, color: '#7a6758' }}>25% of Monthly Gross CTC</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#2b1b12' }}>Special Allowances</td>
                <td><span className="badge badge-present">Earning</span></td>
                <td style={{ fontWeight: 700 }}>₹ {structure.allowances.toLocaleString('en-IN')}</td>
                <td>₹ {(structure.allowances * 12).toLocaleString('en-IN')}</td>
                <td style={{ fontSize: 12, color: '#7a6758' }}>25% Flexible Allowance</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#2b1b12' }}>Provident Fund (PF)</td>
                <td><span className="badge badge-rejected">Deduction</span></td>
                <td style={{ fontWeight: 700, color: '#dc2626' }}>₹ {structure.pf.toLocaleString('en-IN')}</td>
                <td style={{ color: '#dc2626' }}>₹ {(structure.pf * 12).toLocaleString('en-IN')}</td>
                <td style={{ fontSize: 12, color: '#7a6758' }}>12% of Basic Salary</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#2b1b12' }}>Professional Tax</td>
                <td><span className="badge badge-rejected">Deduction</span></td>
                <td style={{ fontWeight: 700, color: '#dc2626' }}>₹ {structure.tax.toLocaleString('en-IN')}</td>
                <td style={{ color: '#dc2626' }}>₹ {(structure.tax * 12).toLocaleString('en-IN')}</td>
                <td style={{ fontSize: 12, color: '#7a6758' }}>Income Tax Deduction</td>
              </tr>
              <tr style={{ background: '#fff4c2' }}>
                <td style={{ fontWeight: 900, color: '#2b1b12' }}>GROSS &amp; NET SUMMARY</td>
                <td colSpan={2} style={{ fontWeight: 800, color: '#9c6137' }}>
                  Gross: ₹ {structure.grossSalary.toLocaleString('en-IN')} &bull; Deductions: ₹ {structure.totalDeductions.toLocaleString('en-IN')}
                </td>
                <td colSpan={2} style={{ fontWeight: 900, fontSize: 15, color: '#9c6137' }}>
                  NET PAY: ₹ {structure.netSalary.toLocaleString('en-IN')} / mo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Payroll Slip History */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginBottom: 18 }}>Issued Salary Slip History</h3>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Pay Period</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Payslip Slip</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id}>
                  <td style={{ fontWeight: 800, color: '#2b1b12' }}>{record.payPeriod}</td>
                  <td style={{ fontWeight: 700 }}>₹ {(record.grossSalary || structure.grossSalary).toLocaleString('en-IN')}</td>
                  <td style={{ color: '#dc2626', fontWeight: 600 }}>₹ {((record.pf || structure.pf) + (record.tax || structure.tax)).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 900, color: '#9c6137' }}>₹ {(record.netSalary || structure.netSalary).toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: 13, color: '#7a6758' }}>{record.paymentDate || '2026-08-01'}</td>
                  <td>
                    <span className="badge badge-approved">{record.paymentStatus || 'Paid'}</span>
                  </td>
                  <td>
                    <button 
                      className="btn-primary btn-sm" 
                      onClick={() => setSelectedPaystub(record)}
                      style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 4, fontSize: 12, padding: '5px 12px' }}
                    >
                      <FileText size={13} /> View Slip
                    </button>
                  </td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 14 }}>
                    No historical salary slips found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
