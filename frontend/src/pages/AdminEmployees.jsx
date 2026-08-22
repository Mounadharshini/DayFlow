import { useEffect, useState } from 'react';
import { 
  Users, Search, Edit3, ShieldCheck, CreditCard, Eye, UserPlus, X, CheckCircle2, 
  Trash2, Power, AlertTriangle, ArrowUpRight, Lock, Check
} from 'lucide-react';
import EmployeeSwitcherModal from '../components/EmployeeSwitcherModal';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function AdminEmployees() {
  const { auth, token } = useAuth();
  const activeToken = token || auth?.token;
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Modals State
  const [showInspector, setShowInspector] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetEmp, setDeleteTargetEmp] = useState(null);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Engineering & Technology',
    designation: 'Software Specialist',
    salary: 600000,
    phone: '',
    address: ''
  });

  const loadEmployees = async () => {
    if (!activeToken) return;
    try {
      const data = await api.getAllEmployees(activeToken);
      setEmployees(data || []);
    } catch (e) {
      console.error('Failed loading employees:', e);
    }
  };

  useEffect(() => {
    loadEmployees();
    const interval = setInterval(loadEmployees, 3000);
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
        salary: Number(newEmp.salary),
        phone: newEmp.phone,
        address: newEmp.address
      });
      showToast(`Employee record created for ${newEmp.name}`, 'success');
      setShowAddModal(false);
      setNewEmp({
        employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        department: 'Engineering & Technology',
        designation: 'Software Specialist',
        salary: 600000,
        phone: '',
        address: ''
      });
      await loadEmployees();
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
      phone: emp.phone || '',
      address: emp.address || '',
      department: emp.department || 'General',
      designation: emp.designation || 'Staff',
      salary: emp.salary || 600000,
      role: emp.role || 'Employee'
    });
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      await api.updateEmployee(activeToken, id, form);
      setEditingId(null);
      showToast('Employee details updated in MySQL database', 'success');
      await loadEmployees();
    } catch (e) {
      showToast(e.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteTargetEmp) return;
    const empId = deleteTargetEmp.id;
    setDeleteTargetEmp(null);
    try {
      await api.deactivateMyProfile(activeToken); // soft deactivation API
      showToast(`Employee account deactivated`, 'info');
      await loadEmployees();
    } catch (e) {
      showToast(e.message || 'Deactivation failed', 'error');
    }
  };

  const filtered = employees.filter(e => {
    const matchesSearch = (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.department || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' ? true : e.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {showInspector && <EmployeeSwitcherModal onClose={() => setShowInspector(false)} />}

      {/* Delete / Deactivate Confirmation Modal */}
      {deleteTargetEmp && (
        <div className="modal-backdrop" onClick={() => setDeleteTargetEmp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ background: '#fee2e2', color: '#dc2626', width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={26} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#2b1b12' }}>Deactivate Employee?</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              Are you sure you want to deactivate account for <strong>{deleteTargetEmp.name}</strong> ({deleteTargetEmp.employeeId})? Historical attendance and payroll records will be preserved.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22 }}>
              <button className="btn-secondary" onClick={() => setDeleteTargetEmp(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDeleteEmployee} style={{ flex: 1, background: '#dc2626' }}>
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>Add New Employee</h3>
                <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Register a new employee record into ElyVia database</p>
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
                  <label>User Role</label>
                  <select value={newEmp.role} onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}>
                    <option value="Employee">Employee</option>
                    <option value="Admin">HR Admin 👑</option>
                  </select>
                </div>
              </div>

              <label>Full Name</label>
              <input value={newEmp.name} onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })} placeholder="Jane Doe" required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label>Work Email</label>
                  <input type="email" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} placeholder="jane@company.com" required />
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label>Phone Number</label>
                  <input value={newEmp.phone} onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label>Annual Salary (₹)</label>
                  <input type="number" value={newEmp.salary} onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })} required />
                </div>
              </div>

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

      {/* Page Title Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>
            Employee Management Hub 👥
          </h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Manage organizational workforce records, employee profiles, department assignments, and permissions
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn-primary btn-sm" 
            onClick={() => setShowAddModal(true)} 
            style={{ gap: 6, padding: '8px 16px', fontSize: 13, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}
          >
            <UserPlus size={15} /> Add Employee
          </button>
          <button 
            className="btn-secondary btn-sm" 
            onClick={() => setShowInspector(true)} 
            style={{ gap: 6, padding: '8px 16px', fontSize: 13 }}
          >
            <Eye size={15} /> 360° Switcher
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 18, padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#7a6758' }} />
          <input
            placeholder="Search by name, ID, email, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#7a6758' }}>Role Filter:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '6px 12px', fontSize: 13, borderRadius: 8 }}>
            <option value="All">All Roles ({employees.length})</option>
            <option value="Employee">Staff Employees</option>
            <option value="Admin">HR Administrators 👑</option>
          </select>
        </div>
      </div>

      {/* Main Employee Directory Table */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name &amp; Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Phone / Contact</th>
                <th>Annual Salary</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const avatar = getAvatarUrl(emp);
                return (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 800, color: '#2b1b12' }}>{emp.employeeId}</td>
                    {editingId === emp.id ? (
                      <>
                        <td><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: 140 }} /></td>
                        <td>
                          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: 120 }}>
                            <option value="Employee">Employee</option>
                            <option value="Admin">HR Admin 👑</option>
                          </select>
                        </td>
                        <td><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ width: 110 }} /></td>
                        <td><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} style={{ width: 120 }} /></td>
                        <td><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: 110 }} /></td>
                        <td><input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} style={{ width: 100 }} /></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="btn-primary btn-sm" disabled={saving} onClick={() => handleSaveEdit(emp.id)} style={{ background: '#b37a4c' }}>
                              Save
                            </button>
                            <button className="btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {emp.role === 'Admin' ? (
                              <div style={{ background: '#fff4c2', color: '#9c6137', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #cc9966', flexShrink: 0 }}>
                                <ShieldCheck size={18} />
                              </div>
                            ) : (
                              <img
                                src={avatar}
                                alt={emp.name}
                                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: 800, color: '#2b1b12' }}>{emp.name}</div>
                              <div style={{ fontSize: 11, color: '#7a6758' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${emp.role === 'Admin' ? 'badge-present' : 'badge-pending'}`} style={{ fontSize: 11 }}>
                            {emp.role === 'Admin' ? 'HR Admin 👑' : 'Employee'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{emp.department || 'General'}</td>
                        <td style={{ fontSize: 13 }}>{emp.designation || 'Staff'}</td>
                        <td style={{ fontSize: 12, color: '#7a6758' }}>{emp.phone || '—'}</td>
                        <td style={{ fontWeight: 800, color: '#9c6137' }}>₹ {(emp.salary || 0).toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="btn-secondary btn-sm" onClick={() => startEdit(emp)} style={{ gap: 4, fontSize: 11, padding: '4px 8px' }}>
                              <Edit3 size={12} /> Edit
                            </button>
                            <button className="btn-secondary btn-sm" onClick={() => setDeleteTargetEmp(emp)} style={{ gap: 4, fontSize: 11, padding: '4px 8px', color: '#dc2626' }}>
                              <Power size={12} /> Deactivate
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#7a6758', fontSize: 14 }}>
                    No employee records found matching your search.
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
