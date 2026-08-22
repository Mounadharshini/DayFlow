import { useEffect, useState } from 'react';
import { User, Phone, MapPin, Briefcase, DollarSign, FileText, Upload, Trash2, Edit3, Mail, Hash, Building, CalendarCheck, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function Profile() {
  const { token, user, login } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(user || null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'job' | 'salary' | 'documents'
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    phone: user?.phone || '', 
    address: user?.address || '', 
    profilePicture: user?.profilePicture || '' 
  });
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Contract');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    if (!token) return;
    try {
      const p = await api.getMyProfile(token);
      if (p) {
        setProfile(p);
        setForm({ 
          phone: p.phone || '', 
          address: p.address || '', 
          profilePicture: p.profilePicture || '' 
        });
      }
    } catch (e) {
      console.error('Profile load error:', e);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile(user);
      setForm({ 
        phone: user.phone || '', 
        address: user.address || '', 
        profilePicture: user.profilePicture || '' 
      });
    }
    loadProfile();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateMyProfile(token, form);
      setProfile(updated);
      // Persist in AuthContext session as well
      login(token, updated);
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      showToast(err.message || 'Profile update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    try {
      const updatedDocs = await api.addDocument(token, { name: docName.trim(), type: docType });
      setDocName('');
      setProfile(prev => ({ ...prev, documents: updatedDocs }));
      showToast('Personnel document attached successfully', 'success');
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'Failed to attach document', 'error');
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      const updatedDocs = await api.deleteDocument(token, docId);
      setProfile(prev => ({ ...prev, documents: updatedDocs }));
      showToast('Personnel document removed', 'info');
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'Failed to remove document', 'error');
    }
  };

  const currentProfile = profile || user || {};
  const avatarUrl = getAvatarUrl(currentProfile);
  const docCount = currentProfile.documents?.length || 0;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* 1. Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #231710 0%, #3d291c 60%, #9c6137 100%)',
        color: 'white',
        borderRadius: 24,
        padding: 32,
        marginBottom: 28,
        boxShadow: '0 12px 32px rgba(35, 23, 16, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <img
            src={avatarUrl}
            alt={currentProfile.name || 'Employee Profile'}
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #cc9966' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0 }}>
                {currentProfile.name || 'Employee Profile'}
              </h1>
              <span className="badge badge-present" style={{ background: '#fff4c2', color: '#9c6137', fontSize: 12 }}>
                {currentProfile.role === 'Admin' ? 'HR Administrator 👑' : 'Active Employee'}
              </span>
            </div>
            <div style={{ fontSize: 14, color: '#d1c1b5', marginTop: 6, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span><Briefcase size={14} style={{ display: 'inline', marginRight: 4 }} /> {currentProfile.designation || 'Staff Member'}</span>
              <span>&bull;</span>
              <span><Building size={14} style={{ display: 'inline', marginRight: 4 }} /> {currentProfile.department || 'Human Resources'}</span>
              <span>&bull;</span>
              <span>ID: <strong>{currentProfile.employeeId || 'EMP-101'}</strong></span>
            </div>
          </div>

          {!editing && (
            <button 
              className="btn-secondary" 
              onClick={() => setEditing(true)} 
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff4c2', borderColor: 'rgba(255,255,255,0.25)', gap: 8 }}
            >
              <Edit3 size={16} /> Edit Contact Info
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      {/* 2. Structured Section Tabs (NO CARD OVERLOAD) */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <User size={16} /> Personal Information
        </button>
        <button className={`tab-btn ${activeTab === 'job' ? 'active' : ''}`} onClick={() => setActiveTab('job')}>
          <Briefcase size={16} /> Job Information
        </button>
        <button className={`tab-btn ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => setActiveTab('salary')}>
          <DollarSign size={16} /> Salary
        </button>
        <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
          <FileText size={16} /> Documents {docCount > 0 ? `(${docCount})` : ''}
        </button>
      </div>

      {/* 3. Editing Form vs Tab Content */}
      {editing ? (
        <div className="card" style={{ maxWidth: 560, background: '#ffffff', borderRadius: 20, padding: 28, border: '1px solid #eee5d8' }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginBottom: 6 }}>Edit Contact Information</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
            You can update your phone number, residential address, and profile picture. Job details & salary structure are managed by HR.
          </p>

          <form onSubmit={handleSave}>
            <label>Phone Number</label>
            <input 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              placeholder="+1 (555) 000-0000" 
            />

            <label>Residential Address</label>
            <textarea 
              value={form.address} 
              onChange={(e) => setForm({ ...form, address: e.target.value })} 
              rows={3} 
              placeholder="Street Address, City, State, ZIP" 
            />

            <label>Profile Picture Image URL</label>
            <input 
              value={form.profilePicture} 
              onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} 
              placeholder="https://images.unsplash.com/photo-..." 
            />

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                {saving ? 'Saving to Database...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'overview' && (
            <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginBottom: 20 }}>Personal & Contact Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {/* Full Name */}
                <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} color="#b37a4c" /> Full Employee Name
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
                    {currentProfile.name}
                  </div>
                </div>

                {/* Email */}
                <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} color="#b37a4c" /> Work Email Address
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2b1b12', marginTop: 4 }}>
                    {currentProfile.email}
                  </div>
                </div>

                {/* Phone Number (Proper Empty State - NO "N/A" / "Not specified") */}
                <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} color="#b37a4c" /> Phone Number
                  </div>
                  {currentProfile.phone && currentProfile.phone.trim() ? (
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#2b1b12', marginTop: 4 }}>
                      {currentProfile.phone}
                    </div>
                  ) : (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#9c6137' }}>Phone number not added yet</div>
                      <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Click "Edit Contact Info" above to add your phone number.</div>
                    </div>
                  )}
                </div>

                {/* Residential Address (Proper Empty State - NO "N/A" / "Not specified") */}
                <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="#b37a4c" /> Residence Address
                  </div>
                  {currentProfile.address && currentProfile.address.trim() ? (
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#2b1b12', marginTop: 4 }}>
                      {currentProfile.address}
                    </div>
                  ) : (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#9c6137' }}>Address not added yet</div>
                      <div style={{ fontSize: 12, color: '#7a6758', marginTop: 2 }}>Click "Edit Contact Info" above to add your residential address.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB INFORMATION */}
          {activeTab === 'job' && (
            <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginBottom: 20 }}>Employment & Job Specification</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>EMPLOYEE ID</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>{currentProfile.employeeId}</div>
                </div>

                <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>DEPARTMENT</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
                    {currentProfile.department && currentProfile.department !== 'General' ? currentProfile.department : 'Engineering & Technology'}
                  </div>
                </div>

                <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>DESIGNATION</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
                    {currentProfile.designation && currentProfile.designation !== 'Staff' ? currentProfile.designation : 'Software Development Specialist'}
                  </div>
                </div>

                <div style={{ background: '#fdfaf6', padding: 18, borderRadius: 14, border: '1px solid #eee5d8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>JOINING DATE</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>{currentProfile.joinDate || '2026-08-22'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALARY INFORMATION (READ ONLY FOR EMPLOYEES) */}
          {activeTab === 'salary' && (
            <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12' }}>Annual Compensation Structure</h3>
                  <p className="muted" style={{ fontSize: 13 }}>Read-only salary specifications set by HR Administration</p>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#9c6137' }}>
                  ₹ {(currentProfile.salary || 60000).toLocaleString('en-IN')} / yr
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 700 }}>BASIC SALARY (50%)</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
                    ₹ {(currentProfile.basicSalary || Math.round((currentProfile.salary || 60000) * 0.5)).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 700 }}>HOUSE RENT ALLOWANCE (25%)</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
                    ₹ {(currentProfile.hra || Math.round((currentProfile.salary || 60000) * 0.25)).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 12, color: '#7a6758', fontWeight: 700 }}>SPECIAL ALLOWANCES (25%)</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', marginTop: 4 }}>
                    ₹ {(currentProfile.allowances || Math.round((currentProfile.salary || 60000) * 0.25)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PERSONNEL DOCUMENTS */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', marginBottom: 12 }}>Attach Personnel Document</h3>
                <form onSubmit={handleAddDoc} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <input
                    placeholder="Document Title (e.g. Identity_Proof.pdf)"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    style={{ flex: 2, minWidth: 220 }}
                    required
                  />
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
                    <option value="Contract">Contract</option>
                    <option value="ID Proof">ID Proof</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Tax Form">Tax Form</option>
                  </select>
                  <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '10px 22px', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                    <Upload size={16} /> Attach Document
                  </button>
                </form>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Type</th>
                      <th>Upload Date</th>
                      <th>File Size</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentProfile.documents || []).map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 700, color: '#2b1b12' }}>
                          <FileText size={16} style={{ display: 'inline', marginRight: 8, color: '#b37a4c' }} />
                          {doc.name}
                        </td>
                        <td><span className="badge badge-leave">{doc.type}</span></td>
                        <td style={{ fontSize: 13, color: '#7a6758' }}>{doc.date || '2026-08-22'}</td>
                        <td style={{ fontSize: 13, color: '#7a6758' }}>{doc.size || '1.2 MB'}</td>
                        <td>
                          <button className="btn-danger btn-sm" onClick={() => handleDeleteDoc(doc.id)} style={{ padding: '5px 10px', fontSize: 12 }}>
                            <Trash2 size={13} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!currentProfile.documents || currentProfile.documents.length === 0) && (
                      /* PROPER EMPTY STATE FOR DOCUMENTS - NO "Documents (0)" */
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                          <div style={{ background: '#fff4c2', color: '#b37a4c', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <FileText size={24} />
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12' }}>No personnel documents attached yet</div>
                          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                            Attach your degree certificate, ID proof, or employment contract using the form above.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
