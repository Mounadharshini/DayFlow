import { useEffect, useState } from 'react';
import { 
  Users, Search, Edit3, ShieldCheck, CreditCard, Eye, Plus, X, CheckCircle2, 
  RefreshCw, DollarSign, FileText, Check, AlertCircle, Printer, Filter 
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function AdminPayroll() {
  const { auth, token } = useAuth();
  const activeToken = token || auth?.token;
  const { showToast } = useToast();

  const [payrollData, setPayrollData] = useState({ summary: {}, payrollStructures: [], historyRecords: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals State
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [salaryForm, setSalaryForm] = useState({});
  const [savingSalary, setSavingSalary] = useState(false);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    userId: '',
    payPeriod: 'August 2026',
    paymentStatus: 'Paid',
    paymentDate: new Date().toISOString().slice(0, 10)
  });
  const [issuing, setIssuing] = useState(false);

  const [viewingSlip, setViewingSlip] = useState(null);

  const loadData = async () => {
    if (!activeToken) return;
    try {
      const data = await api.getAllPayrolls(activeToken);
      setPayrollData(data || { summary: {}, payrollStructures: [], historyRecords: [] });
    } catch (e) {
      console.error('Failed loading admin payrolls:', e);
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

  const structures = payrollData?.payrollStructures || [];
  const summary = payrollData?.summary || {};

  // Start Edit Salary Structure
  const startEditStructure = (emp) => {
    setEditingEmployee(emp);
    setSalaryForm({
      salary: emp.annualSalary || 600000,
      basicSalary: emp.basicSalary * 12 || 300000,
      hra: emp.hra * 12 || 150000,
      allowances: emp.allowances * 12 || 150000,
      pf: emp.pf * 12 || 36000,
      tax: emp.tax * 12 || 60000
    });
  };

  // Live Formula Calculation for Salary Form
  const calcFormMonthlyGross = Math.round((Number(salaryForm.salary) || 0) / 12);
  const calcFormMonthlyBasic = Math.round((Number(salaryForm.basicSalary) || 0) / 12);
  const calcFormMonthlyHra = Math.round((Number(salaryForm.hra) || 0) / 12);
  const calcFormMonthlyAllowances = Math.round((Number(salaryForm.allowances) || 0) / 12);
  const calcFormMonthlyPf = Math.round((Number(salaryForm.pf) || 0) / 12);
  const calcFormMonthlyTax = Math.round((Number(salaryForm.tax) || 0) / 12);

  const calcFormGross = calcFormMonthlyBasic + calcFormMonthlyHra + calcFormMonthlyAllowances;
  const calcFormDeductions = calcFormMonthlyPf + calcFormMonthlyTax;
  const calcFormNet = Math.max(0, calcFormGross - calcFormDeductions);

  const handleSaveSalaryStructure = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setSavingSalary(true);
    try {
      await api.updateSalaryStructure(activeToken, editingEmployee.userId, salaryForm);
      showToast(`Salary structure updated for ${editingEmployee.name}! Real-time notification sent.`, 'success');
      setEditingEmployee(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update salary structure', 'error');
    } finally {
      setSavingSalary(false);
    }
  };

  const handleIssuePaystub = async (e) => {
    e.preventDefault();
    if (!issueForm.userId) {
      showToast('Please select an employee to issue paystub', 'error');
      return;
    }
    setIssuing(true);
    try {
      await api.issuePaystub(activeToken, issueForm);
      showToast('New salary slip issued! Real-time notification sent to employee.', 'success');
      setShowIssueModal(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to issue paystub', 'error');
    } finally {
      setIssuing(false);
    }
  };

  const filtered = structures.filter(e => {
    const matchesSearch = 
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* View Payslip Modal */}
      {viewingSlip && (
        <div className="modal-backdrop" onClick={() => setViewingSlip(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, borderRadius: 20, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '2px solid #eee5d8', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/elyvia-logo.jpg" alt="ElyVia Logo" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #cc9966' }} />
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>ElyVia Official Payslip</h3>
                  <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 600 }}>Employee: {viewingSlip.name} ({viewingSlip.employeeId})</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary btn-sm" onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6 }}>
                  <Printer size={15} /> Print PDF
                </button>
                <button className="close-btn" onClick={() => setViewingSlip(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', borderRadius: 14, padding: 18, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>EMPLOYEE DETAILS</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{viewingSlip.name}</div>
                <div style={{ fontSize: 12, color: '#7a6758' }}>ID: {viewingSlip.employeeId} &bull; {viewingSlip.department}</div>
                <div style={{ fontSize: 12, color: '#7a6758' }}>{viewingSlip.designation}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>PAYMENT METRICS</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9c6137', marginTop: 2 }}>Monthly Gross: ₹ {viewingSlip.grossSalary.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#9c6137' }}>Net Disbursed: ₹ {viewingSlip.netSalary.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 12, color: '#7a6758' }}>Bank: {viewingSlip.bankName}</div>
              </div>
            </div>

            <div className="table-container" style={{ marginTop: 0, marginBottom: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th>Earnings Component</th>
                    <th>Monthly (₹)</th>
                    <th>Deduction Component</th>
                    <th>Monthly (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Basic Salary</td>
                    <td style={{ fontWeight: 700 }}>₹ {viewingSlip.basicSalary.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>Provident Fund (PF)</td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>₹ {viewingSlip.pf.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>House Rent Allowance (HRA)</td>
                    <td style={{ fontWeight: 700 }}>₹ {viewingSlip.hra.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>Professional Tax</td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>₹ {viewingSlip.tax.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Special Allowances</td>
                    <td style={{ fontWeight: 700 }}>₹ {viewingSlip.allowances.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, background: '#fdfaf6' }}>Total Deductions</td>
                    <td style={{ fontWeight: 800, color: '#dc2626', background: '#fdfaf6' }}>
                      ₹ {viewingSlip.totalDeductions.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr style={{ background: '#fff4c2' }}>
                    <td style={{ fontWeight: 800, color: '#2b1b12' }}>Gross Salary</td>
                    <td style={{ fontWeight: 800, color: '#2b1b12' }}>₹ {viewingSlip.grossSalary.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 800, color: '#9c6137' }}>NET PAYABLE</td>
                    <td style={{ fontWeight: 900, fontSize: 16, color: '#9c6137' }}>
                      ₹ {viewingSlip.netSalary.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#7a6758', background: '#fdfaf6', padding: 12, borderRadius: 10, border: '1px solid #eee5d8' }}>
              ⚡ Computer-generated payroll record from <strong>ElyVia HR Admin Engine</strong>. Verified accuracy.
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Structure Modal */}
      {editingEmployee && (
        <div className="modal-backdrop" onClick={() => setEditingEmployee(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, borderRadius: 20 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>Configure Salary Structure</h3>
                <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{editingEmployee.name} ({editingEmployee.employeeId})</p>
              </div>
              <button className="close-btn" onClick={() => setEditingEmployee(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSalaryStructure}>
              <label>Annual CTC (₹)</label>
              <input 
                type="number" 
                value={salaryForm.salary} 
                onChange={(e) => setSalaryForm({ ...salaryForm, salary: e.target.value })} 
                required 
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label>Annual Basic Salary (₹)</label>
                  <input 
                    type="number" 
                    value={salaryForm.basicSalary} 
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label>Annual HRA (₹)</label>
                  <input 
                    type="number" 
                    value={salaryForm.hra} 
                    onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label>Annual Allowances (₹)</label>
                  <input 
                    type="number" 
                    value={salaryForm.allowances} 
                    onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label>Annual PF Deduction (₹)</label>
                  <input 
                    type="number" 
                    value={salaryForm.pf} 
                    onChange={(e) => setSalaryForm({ ...salaryForm, pf: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <label style={{ marginTop: 4 }}>Annual Professional Tax (₹)</label>
              <input 
                type="number" 
                value={salaryForm.tax} 
                onChange={(e) => setSalaryForm({ ...salaryForm, tax: e.target.value })} 
                required 
              />

              {/* Automatic Calculation Preview Box */}
              <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', borderRadius: 14, padding: 16, marginTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#9c6137', textTransform: 'uppercase' }}>
                  AUTOMATIC FORMULA VALIDATION PREVIEW
                </div>
                <div style={{ fontSize: 13, color: '#2b1b12', marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>Gross: <strong>₹ {calcFormGross.toLocaleString('en-IN')} / mo</strong></div>
                  <div>Deductions: <strong>₹ {calcFormDeductions.toLocaleString('en-IN')} / mo</strong></div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#9c6137', marginTop: 8 }}>
                  NET PAYABLE: ₹ {calcFormNet.toLocaleString('en-IN')} / month
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingEmployee(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingSalary} style={{ width: 'auto', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                  {savingSalary ? 'Saving & Notifying...' : 'Save & Dispatch Real-Time Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Paystub Modal */}
      {showIssueModal && (
        <div className="modal-backdrop" onClick={() => setShowIssueModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, borderRadius: 20 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>Issue Monthly Salary Slip</h3>
                <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Generate and dispatch paystub record directly to database</p>
              </div>
              <button className="close-btn" onClick={() => setShowIssueModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssuePaystub}>
              <label>Select Target Employee</label>
              <select 
                value={issueForm.userId} 
                onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })}
                required
              >
                <option value="">-- Choose Employee --</option>
                {structures.map(emp => (
                  <option key={emp.userId} value={emp.userId}>
                    {emp.name} ({emp.employeeId}) - Net: ₹ {emp.netSalary.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label>Pay Period</label>
                  <input 
                    value={issueForm.payPeriod} 
                    onChange={(e) => setIssueForm({ ...issueForm, payPeriod: e.target.value })} 
                    placeholder="August 2026" 
                    required 
                  />
                </div>
                <div>
                  <label>Payment Status</label>
                  <select 
                    value={issueForm.paymentStatus} 
                    onChange={(e) => setIssueForm({ ...issueForm, paymentStatus: e.target.value })}
                  >
                    <option value="Paid">Paid ✅</option>
                    <option value="Processing">Processing ⏳</option>
                    <option value="Pending">Pending ⚠️</option>
                  </select>
                </div>
              </div>

              <label style={{ marginTop: 4 }}>Payment Date</label>
              <input 
                type="date" 
                value={issueForm.paymentDate} 
                onChange={(e) => setIssueForm({ ...issueForm, paymentDate: e.target.value })} 
                required 
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowIssueModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={issuing} style={{ width: 'auto', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                  {issuing ? 'Generating...' : 'Generate & Issue Salary Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>Payroll Administration</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Configure organization salary structures, verify net pay formulas, and issue database paystubs
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'nowrap' }}>
          <button 
            className="btn-primary btn-sm" 
            onClick={() => setShowIssueModal(true)}
            style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6, padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap', width: 'auto' }}
          >
            <Plus size={14} /> Issue Salary Slip
          </button>
          <button 
            className="btn-secondary btn-sm" 
            onClick={loadData} 
            disabled={loading} 
            style={{ gap: 6, padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap', width: 'auto' }}
          >
            <RefreshCw size={14} /> Refresh Sync
          </button>
        </div>
      </div>

      {/* Key Organization Metrics */}
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
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>ORGANIZATION ANNUAL BUDGET</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>₹ {(summary.totalAnnualBudget || 0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Total Annual Payroll CTC</div>
        </div>

        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>MONTHLY GROSS DISBURSEMENT</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>₹ {(summary.totalMonthlyGross || 0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Monthly Gross Expenditure</div>
        </div>

        <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase' }}>MONTHLY NET DISBURSEMENT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#9c6137', marginTop: 4 }}>₹ {(summary.totalNetDisbursement || 0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Net Transferred to Employees</div>
        </div>

        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>TOTAL MONTHLY DEDUCTIONS</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>₹ {(summary.totalDeductions || 0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2 }}>PF + Professional Tax</div>
        </div>
      </div>

      {/* All Employee Payroll Matrix Table */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Employee Salary Matrix &amp; Structures ({filtered.length})</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Update salary components, verify accuracy, and inspect monthly net pay</p>
          </div>

          <div style={{ position: 'relative', width: 260 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#7a6758' }} />
            <input
              placeholder="Search employee, ID..."
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
                <th>Employee</th>
                <th>Annual CTC</th>
                <th>Monthly Basic</th>
                <th>HRA &amp; Allowances</th>
                <th>Deductions</th>
                <th>Monthly Net Pay</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const avatar = getAvatarUrl(emp);
                return (
                  <tr key={emp.userId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img 
                          src={avatar} 
                          alt={emp.name} 
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: '#2b1b12' }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: '#7a6758' }}>{emp.employeeId} &bull; {emp.department}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹ {(emp.annualSalary || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: 13 }}>₹ {(emp.basicSalary || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: 13 }}>₹ {((emp.hra || 0) + (emp.allowances || 0)).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#dc2626', fontWeight: 600, fontSize: 13 }}>₹ {(emp.totalDeductions || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 900, color: '#9c6137', fontSize: 15 }}>₹ {(emp.netSalary || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          className="btn-primary btn-sm" 
                          onClick={() => startEditStructure(emp)}
                          style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 4, fontSize: 12, padding: '5px 10px' }}
                        >
                          <Edit3 size={13} /> Config Salary
                        </button>
                        <button 
                          className="btn-secondary btn-sm" 
                          onClick={() => setViewingSlip(emp)}
                          style={{ gap: 4, fontSize: 12, padding: '5px 10px' }}
                        >
                          <Eye size={13} /> View Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 14 }}>
                    No employee payroll records match search query.
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
