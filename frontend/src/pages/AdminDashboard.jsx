import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Edit3, ShieldCheck, CreditCard, Eye, UserPlus, X, CheckCircle2, 
  Calendar, FileCheck, Check, Clock, RefreshCw, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import EmployeeSwitcherModal from '../components/EmployeeSwitcherModal';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function AdminDashboard() {
  const { auth, token } = useAuth();
  const activeToken = token || auth?.token;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adminComments, setAdminComments] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Double Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    leaveId: null,
    status: null,
    employeeName: '',
    leaveType: '',
    dates: '',
    comment: ''
  });

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Engineering & Technology',
    designation: 'Software Specialist',
    salary: 600000
  });

  const loadData = async () => {
    if (!activeToken) return;
    try {
      const [empList, attList, leaveList] = await Promise.all([
        api.getAllEmployees(activeToken).catch(() => []),
        api.getAllAttendance(activeToken).catch(() => []),
        api.getAllLeaves(activeToken).catch(() => [])
      ]);
      setEmployees(empList || []);
      setAttendanceRecords(attList || []);
      setLeaveRequests(leaveList || []);
    } catch (e) {
      console.error('Admin dashboard data load error:', e);
    }
  };

  // Real-Time Live Sync Polling Every 3 Seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
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
        salary: 600000
      });
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to create employee', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Step 1: Open Double Confirmation Modal
  const requestDecisionConfirmation = (leaveItem, status) => {
    setConfirmModal({
      open: true,
      leaveId: leaveItem.id,
      status: status,
      employeeName: leaveItem.name || `Employee #${leaveItem.userId}`,
      leaveType: leaveItem.type || 'Leave',
      dates: `${leaveItem.startDate} to ${leaveItem.endDate}`,
      comment: adminComments[leaveItem.id] || ''
    });
  };

  // Step 2: Execute Decision on Confirm
  const executeAdminLeaveAction = async () => {
    const { leaveId, status, comment } = confirmModal;
    if (!leaveId || !status) return;

    setConfirmModal({ open: false, leaveId: null, status: null, employeeName: '', leaveType: '', dates: '', comment: '' });
    setActionLoadingId(leaveId);

    try {
      await api.updateLeave(activeToken, leaveId, { status, adminComment: comment });
      showToast(`Leave request ${status.toLowerCase()} successfully! Employee notified.`, status === 'Approved' ? 'success' : 'info');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Leave decision update failed', 'error');
    } finally {
      setActionLoadingId(null);
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
      role: emp.role
    });
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await api.updateEmployee(activeToken, id, form);
      setEditingId(null);
      showToast('Employee profile and role permissions updated!', 'success');
      await loadData();
    } catch (e) {
      showToast(e.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {showInspector && <EmployeeSwitcherModal onClose={() => setShowInspector(false)} />}

      {/* DOUBLE CONFIRMATION MODAL FOR APPROVAL / REJECTION */}
      {confirmModal.open && (
        <div className="modal-backdrop" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, borderRadius: 20, textAlign: 'center' }}>
            <div style={{
              background: confirmModal.status === 'Approved' ? '#fff4c2' : '#fee2e2',
              color: confirmModal.status === 'Approved' ? '#9c6137' : '#dc2626',
              width: 54,
              height: 54,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              {confirmModal.status === 'Approved' ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
            </div>

            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#2b1b12', margin: 0 }}>
              Confirm Leave {confirmModal.status}?
            </h3>

            <p className="muted" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              Are you sure you want to <strong>{confirmModal.status?.toUpperCase()}</strong> the {confirmModal.leaveType} Leave request for <strong>{confirmModal.employeeName}</strong> ({confirmModal.dates})?
            </p>

            {confirmModal.comment && (
              <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 10, borderRadius: 10, fontSize: 12, color: '#7a6758', marginTop: 12, textAlign: 'left' }}>
                <strong>HR Comment:</strong> {confirmModal.comment}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22 }}>
              <button 
                className="btn-secondary" 
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={executeAdminLeaveAction}
                style={{ 
                  flex: 1, 
                  background: confirmModal.status === 'Approved' ? 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' : '#dc2626' 
                }}
              >
                Confirm {confirmModal.status}
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
                <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Create a new employee account directly in ElyVia database</p>
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
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2b1b12', letterSpacing: '-0.5px' }}>ElyVia HR Control Center</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            Real-time workforce management, attendance tracking, and leave approvals engine
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
            <Eye size={15} /> 360° Switcher
          </button>
        </div>
      </div>

      {/* HR Executive Metrics Grid */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eee5d8',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16
      }}>
        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 18, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={15} color="#b37a4c" /> TOTAL WORKFORCE
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>{employees.length}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Active employee accounts</div>
        </div>

        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 18, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={15} color="#9c6137" /> PRESENT TODAY
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>
            {attendanceRecords.filter(a => a.status === 'Present').length || 1}
          </div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Logged workday entries</div>
        </div>

        <div style={{ background: '#f4ece4', border: '1px solid #d8c3b2', padding: 18, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9c6137', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileCheck size={15} color="#9c6137" /> PENDING LEAVES
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#9c6137', marginTop: 4 }}>{pendingLeavesCount}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Awaiting HR review</div>
        </div>

        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 18, borderRadius: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={15} color="#b37a4c" /> ANNUAL PAYROLL BUDGET
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>₹ {totalPayroll.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Organization annual CTC</div>
        </div>
      </div>

      {/* 1. EMPLOYEE ROSTER & MANAGEMENT TABLE */}
      <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Employee Roster ({filteredEmployees.length})</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Search, view, or manage organization workforce records</p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#7a6758' }} />
              <input
                placeholder="Search name, ID, dept..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 34, fontSize: 13 }}
              />
            </div>
            <button className="btn-secondary btn-sm" onClick={() => navigate('/admin/employees')} style={{ gap: 4, fontSize: 12 }}>
              View All Employees <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name &amp; Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Annual Salary</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.slice(0, 6).map((emp) => {
                const avatar = getAvatarUrl(emp);
                return (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 800, color: '#2b1b12' }}>{emp.employeeId}</td>
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
                    <td style={{ fontWeight: 800, color: '#9c6137' }}>₹ {(emp.salary || 0).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-secondary btn-sm" 
                        onClick={() => navigate('/admin/employees')} 
                        style={{ gap: 4, fontSize: 12, padding: '5px 10px' }}
                      >
                        <Eye size={13} /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-COLUMN SPLIT GRID: TODAY'S ATTENDANCE LOGS & LEAVE APPROVALS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* ATTENDANCE RECORDS SECTION */}
        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Workforce Attendance Records</h3>
            <button className="btn-secondary btn-sm" onClick={() => navigate('/admin/attendance')} style={{ gap: 4, fontSize: 12 }}>
              Full Log <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container" style={{ marginTop: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.slice(0, 5).map((att) => (
                  <tr key={att.id}>
                    <td style={{ fontWeight: 700, fontSize: 13, color: '#2b1b12' }}>{att.name || `User #${att.userId}`}</td>
                    <td style={{ fontSize: 12, color: '#7a6758' }}>{att.date}</td>
                    <td style={{ fontSize: 12, color: '#9c6137', fontWeight: 600 }}>{att.checkIn || '—'}</td>
                    <td style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{att.checkOut || '—'}</td>
                    <td>
                      <span className={`badge ${att.status === 'Present' ? 'badge-present' : att.status === 'Half-day' ? 'badge-pending' : 'badge-rejected'}`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendanceRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#7a6758', fontSize: 13 }}>
                      No attendance logs recorded for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LEAVE APPROVALS QUEUE SECTION WITH COMPACT APPROVE BUTTON & DOUBLE CONFIRMATION */}
        <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Leave Approvals Queue</h3>
            <button className="btn-secondary btn-sm" onClick={() => navigate('/admin/leaves')} style={{ gap: 4, fontSize: 12 }}>
              Full Queue <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leaveRequests.filter(l => l.status === 'Pending').slice(0, 4).map((l) => (
              <div key={l.id} style={{ background: '#fdfaf6', border: '1px solid #eee5d8', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#2b1b12' }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>
                      {l.type} Leave &bull; {l.startDate} to {l.endDate} ({l.daysCount} days)
                    </div>
                  </div>
                  <span className="badge badge-pending" style={{ fontSize: 10 }}>Pending</span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                  <input
                    placeholder="Add comment..."
                    value={adminComments[l.id] || ''}
                    onChange={(e) => setAdminComments({ ...adminComments, [l.id]: e.target.value })}
                    style={{ flex: 1, padding: '5px 10px', fontSize: 12, borderRadius: 6 }}
                  />
                  {/* SLEEK COMPACT APPROVE BUTTON */}
                  <button 
                    className="btn-primary btn-sm" 
                    onClick={() => requestDecisionConfirmation(l, 'Approved')}
                    disabled={actionLoadingId === l.id}
                    style={{ padding: '4px 10px', fontSize: 11, background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', borderRadius: 6, gap: 4, width: 'auto', whiteSpace: 'nowrap' }}
                  >
                    <Check size={12} /> Approve
                  </button>
                  <button 
                    className="btn-secondary btn-sm" 
                    onClick={() => requestDecisionConfirmation(l, 'Rejected')}
                    disabled={actionLoadingId === l.id}
                    style={{ padding: '4px 10px', fontSize: 11, color: '#dc2626', borderColor: '#fca5a5', borderRadius: 6, gap: 4, width: 'auto', whiteSpace: 'nowrap' }}
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}

            {leaveRequests.filter(l => l.status === 'Pending').length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 18px', background: '#fdfaf6', borderRadius: 14, border: '1px solid #eee5d8', color: '#7a6758', fontSize: 13 }}>
                <CheckCircle2 size={24} color="#b37a4c" style={{ margin: '0 auto 6px', display: 'block' }} />
                No pending leave requests awaiting approval!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
