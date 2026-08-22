import { useState, useEffect } from 'react';
import { X, Search, UserCheck, Calendar, FileText, CreditCard, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Badge from './Badge';

export default function EmployeeSwitcherModal({ onClose }) {
  const { auth } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getAllEmployees(auth.token).then(setEmployees);
  }, [auth.token]);

  const selectEmployee = async (emp) => {
    setSelectedEmp(emp);
    setLoading(true);
    try {
      const att = await api.getAllAttendance(auth.token, `?userId=${emp.id}`);
      const lvs = await api.getAllLeaves(auth.token);
      setAttendance(att);
      setLeaves(lvs.filter((l) => l.userId === emp.id));
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 900, height: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>Employee Inspector 360°</h3>
            <p className="muted">Switch between employee records to inspect profile, attendance, and leaves</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, flex: 1, overflow: 'hidden' }}>
          {/* Left Panel: Employee Search List */}
          <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: 16, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                placeholder="Search name, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36, fontSize: 13 }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => selectEmployee(emp)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    marginBottom: 6,
                    cursor: 'pointer',
                    background: selectedEmp?.id === emp.id ? '#eef2ff' : 'white',
                    border: `1px solid ${selectedEmp?.id === emp.id ? '#818cf8' : '#f1f5f9'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span>{emp.employeeId}</span>
                    <span>{emp.department || 'General'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Employee Details View */}
          <div style={{ overflowY: 'auto', paddingLeft: 8 }}>
            {!selectedEmp ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
                Select an employee from the list to view full profile & records.
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                  <img
                    src={selectedEmp.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt={selectedEmp.name}
                    style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #4f46e5' }}
                  />
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{selectedEmp.name}</h4>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {selectedEmp.designation || 'Employee'} • {selectedEmp.department || 'Department'} ({selectedEmp.employeeId})
                    </div>
                  </div>
                </div>

                <div className="tabs-header">
                  <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                    <UserCheck size={16} /> Profile
                  </button>
                  <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
                    <Calendar size={16} /> Attendance
                  </button>
                  <button className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
                    <FileText size={16} /> Leaves
                  </button>
                </div>

                {loading ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading record data...</div>
                ) : (
                  <>
                    {activeTab === 'profile' && (
                      <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="card"><h3>Email</h3><div><Mail size={14} /> {selectedEmp.email}</div></div>
                        <div className="card"><h3>Phone</h3><div><Phone size={14} /> {selectedEmp.phone || 'N/A'}</div></div>
                        <div className="card"><h3>Address</h3><div><MapPin size={14} /> {selectedEmp.address || 'N/A'}</div></div>
                        <div className="card"><h3>Join Date</h3><div>{selectedEmp.joinDate || 'N/A'}</div></div>
                        <div className="card" style={{ gridColumn: 'span 2' }}>
                          <h3>Annual Salary (Admin Read/Edit)</h3>
                          <div className="big" style={{ color: '#10b981' }}>₹{(selectedEmp.salary || 0).toLocaleString()} / yr</div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'attendance' && (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Hours</th></tr>
                          </thead>
                          <tbody>
                            {attendance.map((r) => (
                              <tr key={r.id}>
                                <td>{r.date}</td>
                                <td><Badge status={r.status} /></td>
                                <td>{r.checkIn || '—'}</td>
                                <td>{r.checkOut || '—'}</td>
                                <td>{r.workHours || 8} hrs</td>
                              </tr>
                            ))}
                            {attendance.length === 0 && <tr><td colSpan={5} className="muted">No attendance history.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'leaves' && (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr><th>Type</th><th>Dates</th><th>Status</th><th>Comment</th></tr>
                          </thead>
                          <tbody>
                            {leaves.map((l) => (
                              <tr key={l.id}>
                                <td>{l.type}</td>
                                <td>{l.startDate} → {l.endDate}</td>
                                <td><Badge status={l.status} /></td>
                                <td>{l.adminComment || '—'}</td>
                              </tr>
                            ))}
                            {leaves.length === 0 && <tr><td colSpan={4} className="muted">No leave requests found.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
