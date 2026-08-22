import { useEffect, useState } from 'react';
import { CreditCard, FileText, Printer, Shield, DollarSign, Edit3, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import PaystubModal from '../components/PaystubModal';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Payroll() {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.role === 'Admin';

  const [paystub, setPaystub] = useState(null);
  const [adminPayroll, setAdminPayroll] = useState(null);
  const [selectedPaystub, setSelectedPaystub] = useState(null);
  const [editingEmp, setEditingEmp] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (isAdmin) {
      const res = await api.getAllPayrolls(auth.token);
      setAdminPayroll(res);
    } else {
      const res = await api.getMyPaystub(auth.token);
      setPaystub(res);
    }
  };

  useEffect(() => { loadData(); }, [auth.token, isAdmin]);

  const handleEditSalary = (emp) => {
    setEditingEmp(emp);
    setForm({
      salary: emp.annualSalary,
      basicSalary: emp.earnings.basic * 12,
      hra: emp.earnings.hra * 12,
      allowances: emp.earnings.allowances * 12,
      pf: emp.deductions.pf * 12,
      tax: emp.deductions.tax * 12
    });
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Find employee db id by matching employeeId
      const empList = await api.getAllEmployees(auth.token);
      const target = empList.find(u => u.employeeId === editingEmp.employeeId);
      if (target) {
        await api.updateEmployee(auth.token, target.id, {
          name: target.name,
          phone: target.phone,
          address: target.address,
          department: target.department,
          designation: target.designation,
          salary: Number(form.salary),
          basicSalary: Number(form.basicSalary),
          hra: Number(form.hra),
          allowances: Number(form.allowances),
          pf: Number(form.pf),
          tax: Number(form.tax)
        });
      }
      setEditingEmp(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />
      {selectedPaystub && <PaystubModal paystub={selectedPaystub} onClose={() => setSelectedPaystub(null)} />}

      {/* Salary Edit Modal for Admin */}
      {editingEmp && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Update Salary Structure: {editingEmp.name}</h3>
            <form onSubmit={handleSaveSalary}>
              <label>Annual Gross Salary (₹)</label>
              <input
                type="number"
                value={form.salary}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setForm({
                    ...form,
                    salary: s,
                    basicSalary: Math.round(s * 0.5),
                    hra: Math.round(s * 0.25),
                    allowances: Math.round(s * 0.25),
                    pf: Math.round(s * 0.06),
                    tax: Math.round(s * 0.10)
                  });
                }}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label>Annual Basic (50%)</label>
                  <input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: Number(e.target.value) })} />
                </div>
                <div>
                  <label>Annual HRA (25%)</label>
                  <input type="number" value={form.hra} onChange={(e) => setForm({ ...form, hra: Number(e.target.value) })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label>Annual Allowances</label>
                  <input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })} />
                </div>
                <div>
                  <label>Annual PF</label>
                  <input type="number" value={form.pf} onChange={(e) => setForm({ ...form, pf: Number(e.target.value) })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Structure'}</button>
                <button type="button" className="btn-secondary" onClick={() => setEditingEmp(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container">
        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
              {isAdmin ? 'HR Payroll Administration' : 'My Payroll & Compensation'}
            </h2>
            <p className="muted">
              {isAdmin ? 'Manage organization salary structures, deductions, and paystubs.' : 'View your monthly salary breakdown, tax deductions, and downloadable paystubs.'}
            </p>
          </div>
          {!isAdmin && paystub && (
            <button className="btn-primary" onClick={() => setSelectedPaystub(paystub)} style={{ width: 'auto' }}>
              <Printer size={16} /> View & Print Salary Slip
            </button>
          )}
        </div>

        {/* Employee Read-Only Payroll View */}
        {!isAdmin && paystub && (
          <div>
            <div className="grid-cards" style={{ marginTop: 24 }}>
              <div className="card">
                <h3>Monthly Gross Salary</h3>
                <div className="big">₹{paystub.monthlyGross.toLocaleString()}</div>
                <p className="muted">Before tax & PF deductions</p>
              </div>
              <div className="card">
                <h3>Total Monthly Deductions</h3>
                <div className="big" style={{ color: '#ef4444' }}>-₹{paystub.deductions.totalDeductions.toLocaleString()}</div>
                <p className="muted">PF (₹{paystub.deductions.pf}) + Tax (₹{paystub.deductions.tax})</p>
              </div>
              <div className="card">
                <h3>Net Monthly Take-Home</h3>
                <div className="big" style={{ color: '#10b981' }}>₹{paystub.netPay.toLocaleString()}</div>
                <p className="muted">Direct bank disbursement</p>
              </div>
            </div>

            <div className="card" style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Salary Component Breakdown</h3>
              <div className="detail-grid">
                <div><span className="muted">Basic Salary</span><strong>₹{paystub.earnings.basic.toLocaleString()} / mo</strong></div>
                <div><span className="muted">House Rent Allowance (HRA)</span><strong>₹{paystub.earnings.hra.toLocaleString()} / mo</strong></div>
                <div><span className="muted">Special Allowances</span><strong>₹{paystub.earnings.allowances.toLocaleString()} / mo</strong></div>
                <div><span className="muted">Annual Projected Salary</span><strong>₹{paystub.annualSalary.toLocaleString()} / yr</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Organization Payroll Matrix */}
        {isAdmin && adminPayroll && (
          <div>
            <div className="grid-cards" style={{ marginTop: 24 }}>
              <div className="card">
                <h3>Total Staff</h3>
                <div className="big">{adminPayroll.summary.totalEmployees}</div>
              </div>
              <div className="card">
                <h3>Monthly Gross Payout</h3>
                <div className="big">₹{adminPayroll.summary.totalMonthlyGross.toLocaleString()}</div>
              </div>
              <div className="card">
                <h3>Monthly Net Disbursement</h3>
                <div className="big" style={{ color: '#10b981' }}>₹{adminPayroll.summary.totalNetDisbursement.toLocaleString()}</div>
              </div>
              <div className="card">
                <h3>Monthly Tax/PF Deductions</h3>
                <div className="big" style={{ color: '#ef4444' }}>₹{adminPayroll.summary.totalDeductions.toLocaleString()}</div>
              </div>
            </div>

            <h3 className="section-title">Employee Salary Directory</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Monthly Gross</th>
                    <th>PF & Tax</th>
                    <th>Net Pay</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminPayroll.payrolls.map((p) => (
                    <tr key={p.employeeId}>
                      <td style={{ fontWeight: 700 }}>{p.employeeId}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                      <td>{p.department || 'General'}</td>
                      <td style={{ fontWeight: 700 }}>₹{p.monthlyGross.toLocaleString()}</td>
                      <td style={{ color: '#ef4444' }}>₹{p.deductions.totalDeductions.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>₹{p.netPay.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-secondary btn-sm" onClick={() => setSelectedPaystub(p)}>
                            <Printer size={14} /> Paystub
                          </button>
                          <button className="btn-secondary btn-sm" onClick={() => handleEditSalary(p)}>
                            <Edit3 size={14} /> Edit Structure
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
