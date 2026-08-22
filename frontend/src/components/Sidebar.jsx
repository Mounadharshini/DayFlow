import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Calendar, FileCheck, CreditCard, 
  Bell, LogOut, ShieldCheck, ChevronLeft, ChevronRight, Menu, X, Users, BarChart3, Sparkles 
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { getAvatarUrl } from '../utils/avatar';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const employeeLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/attendance', label: 'Attendance', icon: Calendar },
    { to: '/leaves', label: 'Leave Requests', icon: FileCheck },
    { to: '/payroll', label: 'Salary / Payroll', icon: CreditCard },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin', label: 'HR Control Center', icon: ShieldCheck },
    { to: '/admin/attendance', label: 'Workforce Attendance', icon: Calendar },
    { to: '/admin/leaves', label: 'Leave Approvals', icon: FileCheck },
    { to: '/analytics', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const avatarUrl = getAvatarUrl(user);

  return (
    <>
      {/* Mobile Top Navbar Header */}
      <div className="mobile-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="logo-badge" style={{ padding: '4px 8px', fontSize: 14 }}>EV</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>ElyVia HRMS</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          style={{ background: 'rgba(255, 244, 194, 0.1)', border: '1px solid rgba(255, 244, 194, 0.2)', color: '#fff4c2', padding: 8, borderRadius: 8 }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Main Responsive Left Sidebar */}
      <aside 
        className={`app-sidebar ${mobileOpen ? 'mobile-show' : ''}`}
        style={{ width: collapsed ? 80 : 260, transition: 'width 0.3s ease, transform 0.3s ease' }}
      >
        {/* Sidebar Brand Header */}
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
            <span className="logo-badge" style={{ padding: '6px 10px', fontSize: 16 }}>EV</span>
            {!collapsed && (
              <div>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>ElyVia</span>
                <span style={{ fontSize: 10, color: '#cc9966', fontWeight: 800, marginLeft: 6, letterSpacing: '0.08em' }}>HRMS</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="desktop-only"
            style={{ background: 'rgba(255, 244, 194, 0.1)', border: 'none', color: '#fff4c2', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Role Tag Banner */}
        {!collapsed && (
          <div className="sidebar-role-tag">
            <Sparkles size={14} color="#cc9966" />
            <span>{isAdmin ? 'HR Administrator 👑' : 'Employee Access'}</span>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-section-label">MAIN WORKSPACE</div>}
          {employeeLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className={isActive ? 'active' : ''}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.label : ''}
              >
                <Icon size={18} />
                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}

          {isAdmin && (
            <>
              {!collapsed && <div className="nav-section-label" style={{ marginTop: 14 }}>ADMIN MANAGEMENT</div>}
              {adminLinks.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <NavLink 
                    key={link.to} 
                    to={link.to} 
                    className={isActive ? 'active' : ''}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? link.label : ''}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{link.label}</span>}
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Employee Profile Snippet & Logout */}
        <div className="sidebar-footer" style={{ justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              <img 
                src={avatarUrl} 
                alt="Avatar"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
              />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{user?.name || 'Employee'}</div>
                <div style={{ fontSize: 11, color: '#cc9966', fontWeight: 600 }}>{user?.employeeId || 'EMP-101'}</div>
              </div>
            </div>
          ) : (
            <img 
              src={avatarUrl} 
              alt="Avatar"
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cc9966' }}
            />
          )}

          <button 
            onClick={() => setShowLogoutModal(true)}
            style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#fca5a5', padding: 8, borderRadius: 8, cursor: 'pointer' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
            <div style={{ background: '#fee2e2', color: '#dc2626', width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <LogOut size={26} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2b1b12' }}>Are you sure you want to logout?</h3>
            <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
              You will be securely signed out from your ElyVia account session.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleLogout} style={{ borderRadius: 10, padding: 10, fontWeight: 700 }}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
