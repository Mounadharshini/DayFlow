import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, MapPin, Briefcase, DollarSign, FileText, Upload, Trash2, Edit3, 
  Mail, Building, Calendar, ShieldCheck, Camera, X, AlertTriangle, Power, Image, Check, Users, Lock, Eye, RefreshCw
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { getAvatarUrl } from '../utils/avatar';

export default function Profile() {
  const { auth, token, user, login, logout } = useAuth();
  const activeToken = token || auth?.token;
  const activeUser = user || auth?.user;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(activeUser || null);
  
  // Admin Employee Management State
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Modals & Editing State
  const [editing, setEditing] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showViewPhotoModal, setShowViewPhotoModal] = useState(false);

  // Camera Capture State
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const isAdmin = activeUser?.role === 'Admin';

  const [form, setForm] = useState({ 
    name: activeUser?.name || '',
    phone: activeUser?.phone || '', 
    address: activeUser?.address || '', 
    department: activeUser?.department || 'General',
    designation: activeUser?.designation || 'Staff',
    joinDate: activeUser?.joinDate || '',
    salary: activeUser?.salary || 600000,
    role: activeUser?.role || 'Employee',
    profilePicture: activeUser?.profilePicture || '' 
  });

  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Contract');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load Logged-in User Profile
  const loadProfile = async () => {
    if (!activeToken) return;
    try {
      const p = await api.getMyProfile(activeToken);
      if (p && p.name) {
        setProfile(p);
        updateFormState(p);
      }
    } catch (e) {
      console.error('Profile load error:', e);
    }
  };

  // Load Employee Roster if Admin
  const loadEmployeeRoster = async () => {
    if (!activeToken || !isAdmin) return;
    try {
      const list = await api.getAllEmployees(activeToken);
      setEmployeeList(list || []);
    } catch (e) {
      console.error('Failed loading roster:', e);
    }
  };

  useEffect(() => {
    if (activeUser?.role === 'Admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (activeUser) {
      setProfile(activeUser);
      updateFormState(activeUser);
    }
    loadProfile();
  }, [activeToken, activeUser]);

  const updateFormState = (u) => {
    setForm({
      name: u.name || '',
      phone: u.phone || '',
      address: u.address || '',
      department: u.department || 'General',
      designation: u.designation || 'Staff',
      joinDate: u.joinDate || '',
      salary: u.salary || 600000,
      role: u.role || 'Employee',
      profilePicture: u.profilePicture || ''
    });
  };

  // Switch Target Employee (Admin View/Management)
  const handleSelectEmployee = async (eId) => {
    setSelectedEmpId(eId);
    if (!eId) {
      loadProfile();
      return;
    }
    try {
      const emp = await api.getEmployee(activeToken, eId);
      if (emp) {
        setProfile(emp);
        updateFormState(emp);
      }
    } catch (err) {
      showToast('Failed to load selected employee profile', 'error');
    }
  };

  // Save General Profile Details
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let updated;
      const targetIsSelf = !selectedEmpId || String(profile.id) === String(activeUser.id);

      if (isAdmin && !targetIsSelf) {
        updated = await api.updateEmployee(activeToken, profile.id, form);
        showToast(`Employee profile for ${updated.name} updated successfully!`, 'success');
        loadEmployeeRoster();
      } else {
        updated = await api.updateMyProfile(activeToken, {
          phone: form.phone,
          address: form.address,
          profilePicture: form.profilePicture
        });
        login(activeToken, updated);
        showToast('Profile details saved successfully to database!', 'success');
      }

      setProfile(updated);
      setEditing(false);
      setShowPhotoModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      showToast(err.message || 'Profile update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Direct Photo Save Helper (for File Picker and Camera Capture)
  const savePhotoData = async (base64Photo) => {
    setSaving(true);
    try {
      const targetIsSelf = !selectedEmpId || String(profile.id) === String(activeUser.id);
      const updatedForm = { ...form, profilePicture: base64Photo };

      let updated;
      if (isAdmin && !targetIsSelf) {
        updated = await api.updateEmployee(activeToken, profile.id, updatedForm);
      } else {
        updated = await api.updateMyProfile(activeToken, { profilePicture: base64Photo });
        login(activeToken, updated);
      }

      setProfile(updated);
      setForm(updatedForm);
      setShowPhotoModal(false);
      stopCamera();
      showToast(base64Photo ? 'Profile photo updated successfully!' : 'Profile photo deleted. Default avatar restored.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile photo', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 1. Device Photo Upload (Library / Files)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      savePhotoData(base64);
    };
    reader.readAsDataURL(file);
  };

  // 2. Camera Live Capture Controls
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 400, height: 400 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setCameraActive(false);
      showToast('Unable to access camera. Please allow camera permissions or upload from library.', 'error');
    }
  };

  const captureCameraPhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 360;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);

    savePhotoData(base64);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleDeactivate = async () => {
    setShowDeactivateModal(false);
    try {
      await api.deactivateMyProfile(activeToken);
      showToast('Your account profile has been deactivated.', 'info');
      logout();
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Deactivation failed', 'error');
    }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    try {
      const updatedDocs = await api.addDocument(activeToken, { name: docName.trim(), type: docType });
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
      const updatedDocs = await api.deleteDocument(activeToken, docId);
      setProfile(prev => ({ ...prev, documents: updatedDocs }));
      showToast('Personnel document removed', 'info');
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'Failed to remove document', 'error');
    }
  };

  const currentProfile = profile || activeUser || {};
  const avatarUrl = getAvatarUrl(currentProfile);
  const docCount = currentProfile.documents?.length || 0;
  const isViewingSelf = !selectedEmpId || String(currentProfile.id) === String(activeUser.id);
  const profileRoleIsAdmin = currentProfile.role === 'Admin';

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Hidden File Input for Device Photo Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* Hidden Canvas for Camera Snapping */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ADMIN EMPLOYEE MANAGEMENT ROSTER SELECTOR */}
      {isAdmin && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #eee5d8',
          borderRadius: 18,
          padding: '16px 22px',
          marginBottom: 24,
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: '0 2px 6px rgba(35, 23, 16, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={18} color="#b37a4c" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#2b1b12' }}>HR Admin Employee Management Hub</div>
              <div style={{ fontSize: 12, color: '#7a6758' }}>Select an employee from the roster to view or edit their profile</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#7a6758' }}>View Employee:</label>
            <select
              value={selectedEmpId}
              onChange={(e) => handleSelectEmployee(e.target.value)}
              style={{ padding: '7px 14px', fontSize: 13, minWidth: 240, borderRadius: 10 }}
            >
              <option value="">My Admin Profile (ElyVia HR Admin)</option>
              {employeeList.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId}) — {emp.department}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && <div className="error-msg" style={{ marginBottom: 18, fontSize: 13 }}>{error}</div>}

      {/* MODERN 2-COLUMN SIDEBAR + DETAIL LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT COLUMN: POLISHED PROFILE IDENTITY CARD */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #eee5d8',
          borderRadius: 22,
          padding: 28,
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(35, 23, 16, 0.04)',
          position: 'sticky',
          top: 24
        }}>
          {/* Avatar Ring with Camera & View Triggers */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <img
              src={avatarUrl}
              alt={currentProfile.name || 'Profile'}
              onClick={() => setShowViewPhotoModal(true)}
              style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: '4px solid #b37a4c', boxShadow: '0 6px 18px rgba(35, 23, 16, 0.12)', cursor: 'pointer' }}
              title="Click to View Full Photo"
            />
            <button
              onClick={() => setShowPhotoModal(true)}
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                background: '#231710',
                color: '#fff4c2',
                border: '2px solid #ffffff',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              title="Add, Take, or Delete Photo"
            >
              <Camera size={15} />
            </button>
          </div>

          {/* Name & Role Pill */}
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12', margin: 0 }}>
            {currentProfile.name || 'User Profile'}
          </h2>

          <div style={{ marginTop: 8 }}>
            <span style={{ 
              background: profileRoleIsAdmin ? '#fff4c2' : '#fdfaf6', 
              color: profileRoleIsAdmin ? '#9c6137' : '#2b1b12', 
              fontSize: 11, 
              fontWeight: 800, 
              padding: '4px 12px', 
              borderRadius: 999,
              border: `1px solid ${profileRoleIsAdmin ? '#cc9966' : '#eee5d8'}` 
            }}>
              {profileRoleIsAdmin ? 'HR Administrator 👑' : 'Active Employee'}
            </span>
          </div>

          {/* Photo Actions Bar */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
            <button 
              className="btn-secondary btn-sm" 
              onClick={() => setShowViewPhotoModal(true)} 
              style={{ padding: '5px 10px', fontSize: 11, gap: 4 }}
            >
              <Eye size={12} /> View Photo
            </button>
            <button 
              className="btn-secondary btn-sm" 
              onClick={() => fileInputRef.current?.click()} 
              style={{ padding: '5px 10px', fontSize: 11, gap: 4 }}
            >
              <Upload size={12} /> Add/Change
            </button>
          </div>

          <div style={{ borderTop: '1px solid #eee5d8', margin: '18px 0 16px', paddingTop: 16, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#2b1b12' }}>
              <Briefcase size={15} color="#b37a4c" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>DESIGNATION</div>
                <div style={{ fontWeight: 700 }}>{currentProfile.designation || 'Staff Member'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#2b1b12' }}>
              <Building size={15} color="#b37a4c" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>DEPARTMENT</div>
                <div style={{ fontWeight: 700 }}>{currentProfile.department || 'General'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#2b1b12' }}>
              <ShieldCheck size={15} color="#b37a4c" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>EMPLOYEE ID</div>
                <div style={{ fontWeight: 800 }}>{currentProfile.employeeId || 'EMP-101'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#2b1b12' }}>
              <Calendar size={15} color="#b37a4c" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>JOINING DATE</div>
                <div style={{ fontWeight: 700 }}>{currentProfile.joinDate || '2026-08-22'}</div>
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <button 
              className="btn-primary btn-sm" 
              onClick={() => setEditing(true)} 
              style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', width: '100%', padding: '9px 14px', fontSize: 12, gap: 6 }}
            >
              <Edit3 size={14} /> {isAdmin && !isViewingSelf ? 'Edit Employee Details' : 'Edit Permitted Details'}
            </button>
            {isViewingSelf && (
              <button 
                className="btn-secondary btn-sm" 
                onClick={() => setShowDeactivateModal(true)} 
                style={{ color: '#dc2626', borderColor: '#fca5a5', width: '100%', padding: '9px 14px', fontSize: 12, gap: 6 }}
              >
                <Power size={14} /> Deactivate Account
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CLEAN SECTIONS STREAM (Personal, Job, Salary, Documents) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 26, boxShadow: '0 2px 6px rgba(35,23,16,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} color="#b37a4c" /> Personal &amp; Contact Details
              </h3>
              <button className="btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ padding: '4px 10px', fontSize: 11, gap: 4 }}>
                <Edit3 size={12} /> Edit Contact
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ background: '#fdfaf6', padding: 14, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>FULL NAME</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{currentProfile.name || '—'}</div>
              </div>

              <div style={{ background: '#fdfaf6', padding: 14, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>WORK EMAIL</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2b1b12', marginTop: 2 }}>{currentProfile.email || '—'}</div>
              </div>

              <div style={{ background: '#fdfaf6', padding: 14, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>PHONE NUMBER (EDITABLE)</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: currentProfile.phone ? '#2b1b12' : '#9c6137', marginTop: 2 }}>
                  {currentProfile.phone && currentProfile.phone.trim() ? currentProfile.phone : 'Not specified yet'}
                </div>
              </div>

              <div style={{ background: '#fdfaf6', padding: 14, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>RESIDENTIAL ADDRESS (EDITABLE)</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: currentProfile.address ? '#2b1b12' : '#9c6137', marginTop: 2 }}>
                  {currentProfile.address && currentProfile.address.trim() ? currentProfile.address : 'Not specified yet'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: JOB DETAILS */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 26, boxShadow: '0 2px 6px rgba(35,23,16,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={16} color="#b37a4c" /> Employment &amp; Job Specification
              </h3>
              {!isAdmin && (
                <span style={{ fontSize: 11, color: '#7a6758', background: '#fdfaf6', padding: '3px 8px', borderRadius: 6, border: '1px solid #eee5d8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={12} /> Managed by HR Admin
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div style={{ background: '#fdfaf6', padding: 14, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>EMPLOYEE ID</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{currentProfile.employeeId || 'EMP-101'}</div>
              </div>

              <div style={{ background: '#fdfaf6', padding: 14, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>DEPARTMENT</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{currentProfile.department || 'General'}</div>
              </div>

              <div style={{ background: '#fdfaf6', padding: 14, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>DESIGNATION</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>{currentProfile.designation || 'Staff Member'}</div>
              </div>

              <div style={{ background: '#fdfaf6', padding: 16, borderRadius: 12, border: '1px solid #eee5d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6758', textTransform: 'uppercase' }}>STATUS</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#9c6137', marginTop: 2 }}>Permanent Staff</div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SALARY STRUCTURE */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 26, boxShadow: '0 2px 6px rgba(35,23,16,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={16} color="#b37a4c" /> Annual Salary Structure
              </h3>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#9c6137' }}>
                ₹ {(currentProfile.salary || 600000).toLocaleString('en-IN')} / yr
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 14, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>BASIC SALARY</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>
                  ₹ {(currentProfile.basicSalary || Math.round((currentProfile.salary || 600000) * 0.5)).toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 14, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>HRA</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>
                  ₹ {(currentProfile.hra || Math.round((currentProfile.salary || 600000) * 0.25)).toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: 14, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: '#7a6758', fontWeight: 700 }}>ALLOWANCES</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', marginTop: 2 }}>
                  ₹ {(currentProfile.allowances || Math.round((currentProfile.salary || 600000) * 0.25)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: PERSONNEL DOCUMENTS */}
          <div style={{ background: '#ffffff', border: '1px solid #eee5d8', borderRadius: 20, padding: 26, boxShadow: '0 2px 6px rgba(35,23,16,0.03)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2b1b12', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} color="#b37a4c" /> Personnel Documents ({docCount})
            </h3>

            <form onSubmit={handleAddDoc} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
              <input
                placeholder="Document Title (e.g. Identity_Proof.pdf)"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                style={{ flex: 2, minWidth: 180, fontSize: 13 }}
                required
              />
              <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ flex: 1, minWidth: 120, fontSize: 13 }}>
                <option value="Contract">Contract</option>
                <option value="ID Proof">ID Proof</option>
                <option value="Certificate">Certificate</option>
                <option value="Tax Form">Tax Form</option>
              </select>
              <button className="btn-primary btn-sm" type="submit" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6 }}>
                <Upload size={14} /> Attach Doc
              </button>
            </form>

            <div className="table-container" style={{ marginTop: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Type</th>
                    <th>Upload Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentProfile.documents || []).map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: 700, color: '#2b1b12' }}>
                        <FileText size={14} style={{ display: 'inline', marginRight: 6, color: '#b37a4c' }} />
                        {doc.name}
                      </td>
                      <td><span className="badge badge-leave">{doc.type}</span></td>
                      <td style={{ fontSize: 12, color: '#7a6758' }}>{doc.date || '2026-08-22'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-danger btn-sm" onClick={() => handleDeleteDoc(doc.id)} style={{ padding: '3px 8px', fontSize: 11 }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!currentProfile.documents || currentProfile.documents.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#7a6758', fontSize: 13 }}>
                        No personnel documents attached yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* VIEW FULL-SCREEN PHOTO LIGHTBOX MODAL */}
      {showViewPhotoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(25, 16, 11, 0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: 20
        }} onClick={() => setShowViewPhotoModal(false)}>
          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 460, width: '100%' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowViewPhotoModal(false)}
              style={{
                position: 'absolute',
                right: -12,
                top: -12,
                background: '#ffffff',
                color: '#2b1b12',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <X size={20} />
            </button>

            <img 
              src={avatarUrl} 
              alt={currentProfile.name} 
              style={{ width: 280, height: 280, borderRadius: '50%', objectFit: 'cover', border: '5px solid #cc9966', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', margin: '0 auto' }}
            />

            <div style={{ color: 'white', marginTop: 18, fontSize: 18, fontWeight: 800 }}>
              {currentProfile.name}
            </div>
            <div style={{ color: '#d1c1b5', fontSize: 13, marginTop: 4 }}>
              {currentProfile.designation || 'Staff Member'} &bull; {currentProfile.employeeId}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
              <button 
                className="btn-primary btn-sm" 
                onClick={() => { setShowViewPhotoModal(false); fileInputRef.current?.click(); }}
                style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6 }}
              >
                <Upload size={14} /> Change Photo
              </button>
              <button 
                className="btn-danger btn-sm" 
                onClick={() => { setShowViewPhotoModal(false); savePhotoData(''); }}
                style={{ background: '#dc2626', gap: 6 }}
              >
                <Trash2 size={14} /> Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE PHOTO OPTIONS MODAL (LIBRARY / CAMERA / DELETE) */}
      {showPhotoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(35, 23, 16, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 460,
            padding: 26,
            border: '1px solid #eee5d8',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Profile Photo Options</h3>
              <button onClick={() => { stopCamera(); setShowPhotoModal(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6758' }}>
                <X size={18} />
              </button>
            </div>

            {/* Live Camera Feed View */}
            {cameraActive ? (
              <div style={{ marginBottom: 16 }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  style={{ width: 280, height: 280, objectFit: 'cover', borderRadius: '50%', border: '4px solid #b37a4c', margin: '0 auto 14px', display: 'block' }} 
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn-primary btn-sm" onClick={captureCameraPhoto} disabled={saving} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 6 }}>
                    <Camera size={14} /> Snap &amp; Save Photo
                  </button>
                  <button className="btn-secondary btn-sm" onClick={stopCamera}>
                    Cancel Camera
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #cc9966', margin: '10px auto 18px', display: 'block' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                  <button 
                    className="btn-primary btn-sm" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={saving} 
                    style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', width: '100%', gap: 8, padding: '10px 16px' }}
                  >
                    <Upload size={16} /> Choose Photo from Device Library
                  </button>

                  <button 
                    className="btn-secondary btn-sm" 
                    onClick={startCamera} 
                    disabled={saving} 
                    style={{ width: '100%', gap: 8, padding: '10px 16px' }}
                  >
                    <Camera size={16} color="#b37a4c" /> Take Live Photo with Camera
                  </button>

                  {currentProfile.profilePicture && (
                    <button 
                      className="btn-danger btn-sm" 
                      onClick={() => savePhotoData('')} 
                      disabled={saving} 
                      style={{ background: '#dc2626', width: '100%', gap: 8, padding: '10px 16px' }}
                    >
                      <Trash2 size={16} /> Delete Current Photo
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* EDIT PERMITTED DETAILS MODAL */}
      {editing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(35, 23, 16, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 520,
            padding: 26,
            border: '1px solid #eee5d8',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2b1b12', margin: 0 }}>
                  {isAdmin && !isViewingSelf ? `Edit ${currentProfile.name}'s Profile` : 'Edit Permitted Profile Details'}
                </h3>
                <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {!isAdmin ? 'Employees can edit Phone and Address.' : 'Admin can manage all employee fields.'}
                </p>
              </div>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6758' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {isAdmin && !isViewingSelf ? (
                <>
                  <div>
                    <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Employee Name</label>
                    <input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      required
                      style={{ fontSize: 13 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Department</label>
                      <input 
                        value={form.department} 
                        onChange={(e) => setForm({ ...form, department: e.target.value })} 
                        required
                        style={{ fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Designation</label>
                      <input 
                        value={form.designation} 
                        onChange={(e) => setForm({ ...form, designation: e.target.value })} 
                        required
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Annual CTC (₹)</label>
                      <input 
                        type="number"
                        value={form.salary} 
                        onChange={(e) => setForm({ ...form, salary: e.target.value })} 
                        required
                        style={{ fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>User Role</label>
                      <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ fontSize: 13 }}>
                        <option value="Employee">Employee</option>
                        <option value="Admin">Admin 👑</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ background: '#fdfaf6', border: '1px solid #eee5d8', padding: '10px 14px', borderRadius: 10, fontSize: 12, color: '#7a6758', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={14} color="#b37a4c" /> Job title, department, and salary are managed by HR Admin.
                </div>
              )}

              <div>
                <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Phone Number (Editable)</label>
                <input 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  placeholder="+1 (555) 000-0000"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div>
                <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>Residential Address (Editable)</label>
                <textarea 
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                  rows={3} 
                  placeholder="Street Address, City, State"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
                <button className="btn-primary btn-sm" type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)' }}>
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEACTIVATE ACCOUNT CONFIRMATION MODAL */}
      {showDeactivateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(35, 23, 16, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 420,
            padding: 24,
            border: '1px solid #eee5d8',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ background: '#fee2e2', color: '#dc2626', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#2b1b12', margin: 0 }}>Deactivate Profile?</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              Are you sure you want to deactivate your profile account? Your historical leave, attendance, and payroll records will be preserved safely in the database.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22 }}>
              <button className="btn-secondary" onClick={() => setShowDeactivateModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeactivate} style={{ flex: 1, background: '#dc2626' }}>
                Deactivate Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
