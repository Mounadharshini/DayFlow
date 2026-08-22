import { Printer, Download, X } from 'lucide-react';

export default function PaystubModal({ paystub, onClose }) {
  if (!paystub) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content printable-area" style={{ maxWidth: 750 }}>
        <div className="modal-header no-print">
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Salary Slip & Paystub</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={16} /> Print / Save PDF
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="paystub-card">
          <div className="paystub-header">
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.5px' }}>
                DAYFLOW HRMS
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                Official Salary Disbursement Record
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{paystub.payPeriod}</div>
              <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 4 }}>
                Status: {paystub.paymentStatus}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '16px 0', borderBottom: '1px solid #e2e8f0', fontSize: 13 }}>
            <div>
              <div className="muted">Employee Name</div>
              <strong style={{ fontSize: 15, color: '#0f172a' }}>{paystub.name}</strong>
              <div className="muted" style={{ marginTop: 8 }}>Employee ID</div>
              <strong>{paystub.employeeId}</strong>
            </div>
            <div>
              <div className="muted">Department</div>
              <strong>{paystub.department || 'General'}</strong>
              <div className="muted" style={{ marginTop: 8 }}>Designation</div>
              <strong>{paystub.designation || 'Staff'}</strong>
            </div>
          </div>

          <div className="paystub-grid">
            <div className="paystub-box">
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Earnings</h4>
              <div className="paystub-row">
                <span className="muted">Basic Salary</span>
                <span>₹{paystub.earnings.basic.toLocaleString()}</span>
              </div>
              <div className="paystub-row">
                <span className="muted">House Rent Allowance (HRA)</span>
                <span>₹{paystub.earnings.hra.toLocaleString()}</span>
              </div>
              <div className="paystub-row">
                <span className="muted">Special Allowance</span>
                <span>₹{paystub.earnings.allowances.toLocaleString()}</span>
              </div>
              <div className="paystub-row" style={{ fontWeight: 700, color: '#0f172a', paddingTop: 10, marginTop: 4 }}>
                <span>Total Gross Earnings</span>
                <span>₹{paystub.earnings.totalEarnings.toLocaleString()}</span>
              </div>
            </div>

            <div className="paystub-box">
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Deductions</h4>
              <div className="paystub-row">
                <span className="muted">Provident Fund (PF)</span>
                <span>₹{paystub.deductions.pf.toLocaleString()}</span>
              </div>
              <div className="paystub-row">
                <span className="muted">Income Tax (TDS)</span>
                <span>₹{paystub.deductions.tax.toLocaleString()}</span>
              </div>
              <div className="paystub-row" style={{ fontWeight: 700, color: '#ef4444', paddingTop: 10, marginTop: 18 }}>
                <span>Total Deductions</span>
                <span>₹{paystub.deductions.totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#eef2ff', padding: 20, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #c7d2fe' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4338ca' }}>Net Salary Payable</div>
              <div style={{ fontSize: 12, color: '#6366f1' }}>Transferred to {paystub.bankName} ({paystub.accountNumber})</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#4f46e5' }}>
              ₹{paystub.netPay.toLocaleString()}
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
            This is a computer-generated salary statement from Dayflow HRMS and does not require a physical signature.
          </div>
        </div>
      </div>
    </div>
  );
}
