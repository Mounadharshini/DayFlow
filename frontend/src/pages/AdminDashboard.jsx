import { useEffect, useState } from 'react';
import { Users, Search, Edit3, ShieldCheck, CreditCard, Eye, UserPlus, X, CheckCircle2 } from 'lucide-react';
import EmployeeSwitcherModal from '../components/EmployeeSwitcherModal';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function AdminDashboard() {
  const { auth, token } = useAuth();
  const activeToken = token || auth?.token;
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Engineering & Technology',
    designation: 'Software Specialist',
    salary: 60000
  });

  const load = async () => {
    if (!activeToken) return;
    try {
      const data = await api.getAllEmployees(activeToken);
      setEmployees(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Real-Time Live Sync Polling Every 3 Seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [activeToken]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.signup({
        employeeId: newEmp.employeeId,
        email: newEmp.email,
        password: newEmp.password || 'Emp@123456',
        name: newEmp.name,
        role: newEmp.role,
        department: newEmp.department,
        designation: newEmp.designation,
        salary: Number(newEmp.salary)
      });
      showToast(`New employee account created for ${newEmp.name}`, 'success');
      setShowAddModal(false);
      setNewEmp({
        employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        department: 'Engineering & Technology',
        designation: 'Software Specialist',
        salary: 60000
      });
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to create employee', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name,
      phone: emp.phone,
      address: emp.address,
      department: emp.department,
      designation: emp.designation,
      salary: emp.salary,
      basicSalary: emp.basicSalary || Math.round(emp.salary * 0.5),
      hra: emp.hra || Math.round(emp.salary * 0.25),
      allowances: emp.allowances || Math.round(emp.salary * 0.25),
      pf: emp.pf || Math.round(emp.salary * 0.06),
      tax: emp.tax || Math.round(emp.salary * 0.10),
      role: emp.role
    });
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await api.updateEmployee(activeToken, id, form);
      setEditingId(null);
      showToast('Employee profile and role permissions updated!', 'success');
      await load();
    } catch (e) {
      showToast(e.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  const adminCount = employees.filter(e => e.role === 'Admin').length;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {showInspector && <EmployeeSwitcherModal onClose={() => setShowInspector(false)} />}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>Add New Employee</h3>
                <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Create a new employee account directly in MySQL database</p>
              </div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label>Employee ID</label>
                  <input value={newEmp.employeeId} onChange={(e) => setNewEmp({ ...newEmp, employeeId: e.target.value })} required />
                </div>
                <div>
                  <label>Role</label>
                  <select value={newEmp.role} onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}>
                    <option value="Employee">Employee</option>
                    <option value="Admin">HR Admin 👑</option>
                  </select>
                </div>
              </div>

              <label>Full Employee Name</label>
              <input value={newEmp.name} onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })} placeholder="John Doe" required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label>Work Email</label>
                  <input type="email" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} placeholder="john@company.com" required />
                </div>
                <div>
                  <label>Initial Password</label>
                  <input type="password" value={newEmp.password} onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })} placeholder="Emp@123456" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label>Department</label>
                  <input value={newEmp.department} onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })} />
                </div>
                <div>
                  <label>Designation</label>
                  <input value={newEmp.designation} onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })} />
                </div>
              </div>

              <label>Annual Salary (₹)</label>
              <input type="number" value={newEmp.salary} onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })} required />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" type="submit" disabled={saving} style={{ width: 'auto', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                  {saving ? 'Creating...' : 'Create Employee Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>HR Control Center</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Manage employee records, promote staff to HR Admin, and inspect organization salary structures
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn-primary btn-sm" 
            onClick={() => setShowAddModal(true)} 
            style={{ gap: 6, padding: '7px 16px', fontSize: 13, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}
          >
            <UserPlus size={15} /> Add Employee
          </button>
          <button 
            className="btn-secondary btn-sm" 
            onClick={() => setShowInspector(true)} 
            style={{ gap: 6, padding: '7px 14px', fontSize: 13 }}
          >
            <Eye size={15} /> 360° Inspector
          </button>
        </div>
      </div>

      {/* HR Key Metrics Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20
      }}>
        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} color="#b37a4c" /> TOTAL WORKFORCE
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>{employees.length}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Active employee accounts</div>
        </div>

        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color="#9c6137" /> ACTIVE HR ADMINS
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>{adminCount}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Administrative permissions</div>
        </div>

        <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={16} color="#b37a4c" /> ANNUAL PAYROLL BUDGET
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#b37a4c', marginTop: 4 }}>₹ {totalPayroll.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Organization annual expenditure</div>
        </div>
      </div>

      {/* Employee Directory & Promotion Table */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Employee Roster & Role Management</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Edit employee details or promote staff to HR Admin</p>
          </div>

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
                <th>Employee Name & Email</th>
                <th>Role & Permissions</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Annual Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const avatar = getAvatarUrl(emp);
                return (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 700, color: '#2b1b12' }}>{emp.employeeId}</td>
                    {editingId === emp.id ? (
                      <>
                        <td><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: 140 }} /></td>
                        <td>
                          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: 130, fontWeight: 700, borderColor: '#b37a4c' }}>
                            <option value="Employee">Employee</option>
                            <option value="Admin">HR Admin 👑</option>
                          </select>
                        </td>
                        <td><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ width: 120 }} /></td>
                        <td><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} style={{ width: 130 }} /></td>
                        <td><input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} style={{ width: 100 }} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-primary btn-sm" disabled={saving} onClick={() => handleSave(emp.id)} style={{ background: '#b37a4c' }}>Save</button>
                            <button className="btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={avatar}
                              alt={emp.name}
                              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#2b1b12' }}>{emp.name}</div>
                              <div style={{ fontSize: 12, color: '#7a6758' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${emp.role === 'Admin' ? 'badge-present' : 'badge-pending'}`} style={{ fontSize: 12 }}>
                            {emp.role === 'Admin' ? 'HR Admin 👑' : 'Employee'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{emp.department || 'General'}</td>
                        <td style={{ fontSize: 13 }}>{emp.designation || 'Staff'}</td>
                        <td style={{ fontWeight: 800, color: '#9c6137' }}>₹ {(emp.salary || 0).toLocaleString()}</td>
                        <td>
                          <button className="btn-secondary btn-sm" onClick={() => startEdit(emp)} style={{ gap: 6, fontSize: 12 }}>
                            <Edit3 size={13} /> Edit / Promote
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 14 }}>
                    No employee records match your search query.
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
