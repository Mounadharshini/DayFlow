import { useState, useEffect } from 'react';
import { X, Search, UserCheck, Calendar, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { getAvatarUrl } from '../utils/avatar';

export default function EmployeeSwitcherModal({ onClose }) {
  const { auth, token } = useAuth();
  const activeToken = token || auth?.token;

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeToken) return;
    api.getAllEmployees(activeToken).then(data => setEmployees(data || [])).catch(() => {});
  }, [activeToken]);

  const selectEmployee = async (emp) => {
    setSelectedEmp(emp);
    setLoading(true);
    try {
      const att = await api.getAllAttendance(activeToken, `?userId=${emp.id}`);
      const lvs = await api.getAllLeaves(activeToken);
      setAttendance(att || []);
      setLeaves((lvs || []).filter((l) => l.userId === emp.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 880, height: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>360° Employee Inspector</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Inspect individual employee records, attendance logs, and time-off requests</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, flex: 1, overflow: 'hidden' }}>
          {/* Left Panel: Employee Search List */}
          <div style={{ borderRight: '1px solid #eee5d8', paddingRight: 16, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#7a6758' }} />
              <input
                placeholder="Search name, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 34, fontSize: 13 }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map((emp) => {
                const isSelected = selectedEmp?.id === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => selectEmployee(emp)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      marginBottom: 6,
                      cursor: 'pointer',
                      background: isSelected ? '#fff4c2' : '#ffffff',
                      border: `1px solid ${isSelected ? '#b37a4c' : '#eee5d8'}`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#2b1b12' }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: '#7a6758', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <span>{emp.employeeId}</span>
                      <span>{emp.department || 'General'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Employee Details View */}
          <div style={{ overflowY: 'auto', paddingLeft: 8 }}>
            {!selectedEmp ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a6758', fontSize: 14, textAlign: 'center', padding: 20 }}>
                Select an employee from the left directory list to inspect full profile & records.
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, background: '#fdfaf6', padding: 18, borderRadius: 16, border: '1px solid #eee5d8' }}>
                  <img
                    src={getAvatarUrl(selectedEmp)}
                    alt={selectedEmp.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #cc9966' }}
                  />
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12' }}>{selectedEmp.name}</h4>
                    <div style={{ fontSize: 13, color: '#7a6758', marginTop: 2 }}>
                      {selectedEmp.designation || 'Staff'} &bull; {selectedEmp.department || 'General'} (ID: <strong>{selectedEmp.employeeId}</strong>)
                    </div>
                  </div>
                </div>

                <div className="tabs-header">
                  <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                    <UserCheck size={16} /> Profile Information
                  </button>
                  <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
                    <Calendar size={16} /> Attendance Log
                  </button>
                  <button className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
                    <FileText size={16} /> Leave History
                  </button>
                </div>

                {loading ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#7a6758' }}>Loading record data...</div>
                ) : (
                  <>
                    {activeTab === 'profile' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 16, borderRadius: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>EMAIL</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#2b1b12', marginTop: 4 }}>{selectedEmp.email}</div>
                        </div>

                        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 16, borderRadius: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>PHONE</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#2b1b12', marginTop: 4 }}>{selectedEmp.phone || 'Not provided'}</div>
                        </div>

                        <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 16, borderRadius: 14, gridColumn: 'span 2' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>ADDRESS</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#2b1b12', marginTop: 4 }}>{selectedEmp.address || 'Not provided'}</div>
                        </div>

                        <div style={{ background: '#fff4c2', border: '1px solid #eee5d8', padding: 16, borderRadius: 14, gridColumn: 'span 2' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>ANNUAL COMPENSATION PACKAGE</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>
                            ₹ {(selectedEmp.salary || 0).toLocaleString()} / yr
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'attendance' && (
                      <div className="table-container" style={{ marginTop: 0 }}>
                        <table>
                          <thead>
                            <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr>
                          </thead>
                          <tbody>
                            {attendance.map((r) => (
                              <tr key={r.id}>
                                <td style={{ fontWeight: 700 }}>{r.date}</td>
                                <td>{r.checkIn || '—'}</td>
                                <td>{r.checkOut || '—'}</td>
                                <td>{r.workHours || 8} hrs</td>
                                <td>
                                  <span className={`badge ${r.status === 'Present' ? 'badge-present' : 'badge-pending'}`}>
                                    {r.status || 'Present'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {attendance.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#7a6758' }}>No attendance history logged.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'leaves' && (
                      <div className="table-container" style={{ marginTop: 0 }}>
                        <table>
                          <thead>
                            <tr><th>Type</th><th>Dates</th><th>Remarks</th><th>Status</th></tr>
                          </thead>
                          <tbody>
                            {leaves.map((l) => (
                              <tr key={l.id}>
                                <td style={{ fontWeight: 700 }}>{l.type}</td>
                                <td style={{ fontSize: 13 }}>{l.startDate} &rarr; {l.endDate}</td>
                                <td style={{ fontSize: 13, color: '#7a6758' }}>{l.remarks || '—'}</td>
                                <td>
                                  <span className={`badge ${l.status === 'Approved' ? 'badge-approved' : l.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                                    {l.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {leaves.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#7a6758' }}>No leave requests submitted.</td></tr>}
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
