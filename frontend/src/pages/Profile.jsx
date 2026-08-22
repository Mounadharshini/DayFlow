import { useEffect, useState } from 'react';
import { User, Phone, MapPin, Briefcase, DollarSign, FileText, Upload, Trash2, Edit3, ShieldCheck, Mail, Calendar, Hash } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Profile() {
  const { auth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', profilePicture: '' });
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Contract');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = async () => {
    const p = await api.getMyProfile(auth.token);
    setProfile(p);
    setForm({ phone: p.phone || '', address: p.address || '', profilePicture: p.profilePicture || '' });
  };

  useEffect(() => {
    loadProfile();
  }, [auth.token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.updateMyProfile(auth.token, form);
      setProfile(updated);
      setEditing(false);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!docName) return;
    try {
      await api.addDocument(auth.token, { name: docName, type: docType });
      setDocName('');
      await loadProfile();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await api.deleteDocument(auth.token, docId);
      await loadProfile();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!profile) return <div><Navbar /><div className="container">Loading profile details...</div></div>;

  return (
    <div>
      <Navbar />
      <div className="container">
        {/* Profile Banner */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: 'white', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <img
              src={profile.profilePicture || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'}
              alt={profile.name}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #4f46e5' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>{profile.name}</h2>
                <span style={{ background: '#4f46e5', color: 'white', padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  {profile.role}
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#cbd5e1', marginTop: 4 }}>
                {profile.designation || 'Staff'} • {profile.department || 'General'} ({profile.employeeId})
              </div>
            </div>
            {!editing && (
              <button className="btn-secondary" onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {message && <div style={{ background: '#d1fae5', color: '#047857', padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>{message}</div>}

        {/* Tab Header */}
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <User size={16} /> Overview
          </button>
          <button className={`tab-btn ${activeTab === 'job' ? 'active' : ''}`} onClick={() => setActiveTab('job')}>
            <Briefcase size={16} /> Job Info
          </button>
          <button className={`tab-btn ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => setActiveTab('salary')}>
            <DollarSign size={16} /> Salary Structure
          </button>
          <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
            <FileText size={16} /> Documents ({profile.documents?.length || 0})
          </button>
        </div>

        {editing ? (
          <div className="card" style={{ maxWidth: 500 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Edit Contact Information</h3>
            <form onSubmit={handleSave}>
              <label>Phone Number</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />

              <label>Address</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} placeholder="Street, City, State" />

              <label>Profile Picture Image URL</label>
              <input value={form.profilePicture} onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} placeholder="https://images.unsplash.com/..." />

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="card"><h3><Hash size={14} /> Employee ID</h3><div className="big" style={{ fontSize: 20 }}>{profile.employeeId}</div></div>
                <div className="card"><h3><Mail size={14} /> Email Address</h3><div style={{ fontWeight: 700 }}>{profile.email}</div></div>
                <div className="card"><h3><Phone size={14} /> Phone Number</h3><div style={{ fontWeight: 700 }}>{profile.phone || 'Not specified'}</div></div>
                <div className="card"><h3><MapPin size={14} /> Residence Address</h3><div style={{ fontWeight: 700 }}>{profile.address || 'Not specified'}</div></div>
              </div>
            )}

            {activeTab === 'job' && (
              <div className="grid-cards">
                <div className="card"><h3>Department</h3><div className="big" style={{ fontSize: 20 }}>{profile.department || 'Unassigned'}</div></div>
                <div className="card"><h3>Designation</h3><div className="big" style={{ fontSize: 20 }}>{profile.designation || 'Staff Member'}</div></div>
                <div className="card"><h3>Joining Date</h3><div className="big" style={{ fontSize: 20 }}>{profile.joinDate || 'N/A'}</div></div>
                <div className="card"><h3>Role Permissions</h3><div className="big" style={{ fontSize: 20 }}>{profile.role}</div></div>
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="card">
                <div className="flex-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Annual Compensation Structure</h3>
                    <p className="muted">Managed directly by HR Administration</p>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
                    ₹{(profile.salary || 0).toLocaleString()} / yr
                  </div>
                </div>
                <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10 }}>
                    <div className="muted">Basic Salary (50%)</div>
                    <strong style={{ fontSize: 18 }}>₹{((profile.basicSalary || Math.round(profile.salary * 0.5))).toLocaleString()}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10 }}>
                    <div className="muted">HRA (25%)</div>
                    <strong style={{ fontSize: 18 }}>₹{((profile.hra || Math.round(profile.salary * 0.25))).toLocaleString()}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10 }}>
                    <div className="muted">Special Allowances</div>
                    <strong style={{ fontSize: 18 }}>₹{((profile.allowances || Math.round(profile.salary * 0.25))).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <div className="card" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Upload New Personnel Document</h3>
                  <form onSubmit={handleAddDoc} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <input
                      placeholder="Document Name (e.g., Degree_Certificate.pdf)"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      style={{ flex: 2, minWidth: 200 }}
                      required
                    />
                    <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
                      <option value="Contract">Contract</option>
                      <option value="ID Proof">ID Proof</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Tax Form">Tax Form</option>
                    </select>
                    <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '10px 20px' }}>
                      <Upload size={16} /> Attach
                    </button>
                  </form>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Document Name</th><th>Type</th><th>Upload Date</th><th>File Size</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {(profile.documents || []).map((doc) => (
                        <tr key={doc.id}>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            <FileText size={16} style={{ display: 'inline', marginRight: 8, color: '#4f46e5' }} />
                            {doc.name}
                          </td>
                          <td><span className="badge badge-leave">{doc.type}</span></td>
                          <td>{doc.date}</td>
                          <td>{doc.size}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => handleDeleteDoc(doc.id)} style={{ padding: '4px 8px' }}>
                              <Trash2 size={14} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!profile.documents || profile.documents.length === 0) && (
                        <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>No documents uploaded yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
