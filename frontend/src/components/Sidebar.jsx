import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Calendar, FileCheck, CreditCard, BarChart3, User, LogOut, LayoutDashboard, Menu, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../AuthContext';
import NotificationCenter from './NotificationCenter';

export default function Sidebar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = auth?.user?.role === 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="mobile-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="logo-badge">EV</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>ElyVia</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NotificationCenter />
          <button className="bell-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ width: 36, height: 36 }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Main Sidebar Navigation */}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-show' : ''}`}>
        <div className="sidebar-header">
          <div className="navbar-brand">
            <span className="logo-badge" style={{ padding: '8px 12px', fontSize: 18 }}>EV</span>
            <div>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>ElyVia</span>
              <div style={{ fontSize: 10, color: '#cc9966', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                HUMAN RESOURCE SYSTEM
              </div>
            </div>
          </div>
        </div>

        {/* Role Permission Tag */}
        <div className="sidebar-role-tag">
          <ShieldCheck size={14} color="#fff4c2" />
          <span>{isAdmin ? 'HR Administrator 👑' : 'Employee Access'}</span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          {isAdmin ? (
            <>
              <NavLink to="/admin" end onClick={() => setMobileOpen(false)}><Users size={18} /> Workforce Roster</NavLink>
              <NavLink to="/admin/attendance" onClick={() => setMobileOpen(false)}><Calendar size={18} /> Attendance Matrix</NavLink>
              <NavLink to="/admin/leaves" onClick={() => setMobileOpen(false)}><FileCheck size={18} /> Leave Approvals</NavLink>
              <NavLink to="/payroll" onClick={() => setMobileOpen(false)}><CreditCard size={18} /> Payroll Matrix</NavLink>
              <NavLink to="/analytics" onClick={() => setMobileOpen(false)}><BarChart3 size={18} /> Analytics & Reports</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}><LayoutDashboard size={18} /> Dashboard</NavLink>
              <NavLink to="/profile" onClick={() => setMobileOpen(false)}><User size={18} /> My Profile</NavLink>
              <NavLink to="/attendance" onClick={() => setMobileOpen(false)}><Calendar size={18} /> Attendance Log</NavLink>
              <NavLink to="/leaves" onClick={() => setMobileOpen(false)}><FileCheck size={18} /> Leave Requests</NavLink>
              <NavLink to="/payroll" onClick={() => setMobileOpen(false)}><CreditCard size={18} /> My Paystubs</NavLink>
            </>
          )}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="sidebar-footer">
          <div className="notif-wrapper">
            <NotificationCenter />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <img
              src={auth?.user?.profilePicture || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'}
              alt="Avatar"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #b37a4c' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {auth?.user?.name}
              </div>
              <div style={{ fontSize: 11, color: '#d1c1b5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {auth?.user?.email}
              </div>
            </div>
          </div>
          <button className="btn-secondary btn-sm" onClick={handleLogout} title="Logout" style={{ padding: 8, background: 'rgba(255, 244, 194, 0.1)', color: '#fff4c2', border: 'none' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
