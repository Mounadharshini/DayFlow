import { useEffect, useState } from 'react';
import { CreditCard, Printer, Edit3, ShieldCheck, Search, CheckCircle2 } from 'lucide-react';
import PaystubModal from '../components/PaystubModal';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export default function AdminPayroll() {
  const { auth, token } = useAuth();
  const activeToken = token || auth?.token;
  const { showToast } = useToast();

  const [adminPayroll, setAdminPayroll] = useState(null);
  const [selectedPaystub, setSelectedPaystub] = useState(null);
  const [editingEmp, setEditingEmp] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    if (!activeToken) return;
    try {
      const res = await api.getAllPayrolls(activeToken);
      setAdminPayroll(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeToken]);

  const handleEditSalary = (emp) => {
    setEditingEmp(emp);
    setForm({
      salary: emp.annualSalary || 60000,
      basicSalary: emp.earnings?.basic ? emp.earnings.basic * 12 : 30000,
      hra: emp.earnings?.hra ? emp.earnings.hra * 12 : 15000,
      allowances: emp.earnings?.allowances ? emp.earnings.allowances * 12 : 15000,
      pf: emp.deductions?.pf ? emp.deductions.pf * 12 : 3600,
      tax: emp.deductions?.tax ? emp.deductions.tax * 12 : 6000
    });
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const empList = await api.getAllEmployees(activeToken);
      const target = empList.find(u => u.employeeId === editingEmp.employeeId);
      if (target) {
        await api.updateEmployee(activeToken, target.id, {
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
          tax: Number(form.tax),
          role: target.role
        });
        showToast(`Salary structure updated for ${target.name}`, 'success');
      }
      setEditingEmp(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update salary', 'error');
    } finally {
      setSaving(false);
    }
  };

  const payrolls = adminPayroll?.payrolls || [];
  const filtered = payrolls.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {selectedPaystub && <PaystubModal paystub={selectedPaystub} onClose={() => setSelectedPaystub(null)} />}

      {/* Salary Edit Modal */}
      {editingEmp && (
        <div className="modal-backdrop" onClick={() => setEditingEmp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 16 }}>
              Update Salary Structure: {editingEmp.name}
            </h3>

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
                  <label>Annual Tax / TDS</label>
                  <input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingEmp(null)}>
                  Cancel
                </button>
                <button className="btn-primary" type="submit" disabled={saving} style={{ width: 'auto', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                  {saving ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>
            HR Payroll Administration
          </h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Manage organization salary structures, base compensation, deductions, and downloadable employee paystubs
          </p>
        </div>
      </div>

      {/* Summary Stat Bar */}
      {adminPayroll && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #eee5d8',
          borderRadius: 20,
          padding: 24,
          marginBottom: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20
        }}>
          <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 18, borderRadius: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>TOTAL STAFF</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{adminPayroll.summary?.totalEmployees || 0}</div>
          </div>

          <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 18, borderRadius: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>MONTHLY GROSS PAYOUT</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>₹ {(adminPayroll.summary?.totalMonthlyGross || 0).toLocaleString()}</div>
          </div>

          <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: 18, borderRadius: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>MONTHLY NET DISBURSEMENT</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>₹ {(adminPayroll.summary?.totalNetDisbursement || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Employee Salary Directory */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Employee Salary Directory</h3>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#7a6758' }} />
            <input
              placeholder="Search by name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Monthly Gross</th>
                <th>PF &amp; Tax</th>
                <th>Net Pay</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.employeeId}>
                  <td style={{ fontWeight: 700, color: '#2b1b12' }}>{p.employeeId}</td>
                  <td style={{ fontWeight: 700, color: '#2b1b12' }}>{p.name}</td>
                  <td style={{ fontSize: 13 }}>{p.department || 'General'}</td>
                  <td style={{ fontWeight: 700 }}>₹ {(p.monthlyGross || 0).toLocaleString()}</td>
                  <td style={{ color: '#dc2626' }}>-₹ {(p.deductions?.totalDeductions || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 800, color: '#9c6137' }}>₹ {(p.netPay || 0).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-secondary btn-sm" onClick={() => setSelectedPaystub(p)} style={{ gap: 4, fontSize: 12 }}>
                        <Printer size={13} /> Paystub
                      </button>
                      <button className="btn-secondary btn-sm" onClick={() => handleEditSalary(p)} style={{ gap: 4, fontSize: 12 }}>
                        <Edit3 size={13} /> Edit Structure
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 14 }}>
                    No payroll entries found matching search query.
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
