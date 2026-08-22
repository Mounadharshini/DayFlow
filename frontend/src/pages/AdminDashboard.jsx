import { useEffect, useState } from 'react';
import { Users, Search, Edit3, UserCheck, CreditCard, ShieldCheck, Eye, UserPlus, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import EmployeeSwitcherModal from '../components/EmployeeSwitcherModal';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function AdminDashboard() {
  const { auth } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

  const load = () => api.getAllEmployees(auth.token).then(setEmployees);
  useEffect(() => { load(); }, [auth.token]);

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
      await api.updateEmployee(auth.token, id, form);
      setEditingId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  const adminCount = employees.filter(e => e.role === 'Admin').length;

  return (
    <div>
      <Navbar />
      <div className="container">
        {showInspector && <EmployeeSwitcherModal onClose={() => setShowInspector(false)} />}

        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>HR Control Center</h2>
            <p className="muted">Manage employee records, promote staff to HR Admin, and inspect payroll structures.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowInspector(true)} style={{ width: 'auto' }}>
            <Eye size={18} /> Open 360° Employee Inspector
          </button>
        </div>

        {/* HR Key Metrics */}
        <div className="grid-cards">
          <div className="card">
            <div className="card-header-icon">
              <h3>Total Workforce</h3>
              <div className="icon-wrapper icon-primary"><Users size={20} /></div>
            </div>
            <div className="big">{employees.length}</div>
            <p className="muted">Registered employee records</p>
          </div>

          <div className="card">
            <div className="card-header-icon">
              <h3>Active HR Admins</h3>
              <div className="icon-wrapper icon-warning"><ShieldCheck size={20} /></div>
            </div>
            <div className="big" style={{ color: '#4f46e5' }}>{adminCount}</div>
            <p className="muted">Administrative privileges</p>
          </div>

          <div className="card">
            <div className="card-header-icon">
              <h3>Annual Gross Payroll</h3>
              <div className="icon-wrapper icon-success"><CreditCard size={20} /></div>
            </div>
            <div className="big">₹{totalPayroll.toLocaleString()}</div>
            <p className="muted">Organization annual budget</p>
          </div>
        </div>

        {/* Employee Directory & Promotion Table */}
        <div className="flex-between" style={{ marginTop: 32 }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>Employee Roster & Role Management</h3>
            <p className="muted" style={{ fontSize: 13 }}>Click "Edit" on any employee row to adjust salary or promote them to HR Admin</p>
          </div>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              placeholder="Search by name, ID, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Role & Permissions</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Annual Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 700 }}>{emp.employeeId}</td>
                  {editingId === emp.id ? (
                    <>
                      <td><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: 140 }} /></td>
                      <td>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: 130, fontWeight: 700, borderColor: '#4f46e5' }}>
                          <option value="Employee">Employee</option>
                          <option value="Admin">HR Admin 👑</option>
                        </select>
                      </td>
                      <td><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ width: 120 }} /></td>
                      <td><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} style={{ width: 130 }} /></td>
                      <td><input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} style={{ width: 100 }} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-success btn-sm" disabled={saving} onClick={() => handleSave(emp.id)}>Save</button>
                          <button className="btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={emp.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                            alt={emp.name}
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 700, background: emp.role === 'Admin' ? '#eef2ff' : '#f1f5f9', color: emp.role === 'Admin' ? '#4f46e5' : '#475569', padding: '4px 10px', borderRadius: 6, border: `1px solid ${emp.role === 'Admin' ? '#c7d2fe' : '#e2e8f0'}` }}>
                          {emp.role === 'Admin' ? 'HR Admin 👑' : 'Employee'}
                        </span>
                      </td>
                      <td>{emp.department || '—'}</td>
                      <td>{emp.designation || '—'}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>₹{(emp.salary || 0).toLocaleString()}</td>
                      <td>
                        <button className="btn-secondary btn-sm" onClick={() => startEdit(emp)}>
                          <Edit3 size={14} /> Edit / Promote
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 24 }}>No employee records match your search query.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
