import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Calendar, FileCheck, CreditCard, BarChart3, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../AuthContext';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = auth?.user?.role === 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo-badge">DF</span>
        <div>
          <span style={{ fontSize: 20, fontWeight: 800 }}>Dayflow</span>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.05em' }}>
            HR MANAGEMENT SYSTEM
          </div>
        </div>
      </div>

      <div className="nav-links">
        {isAdmin ? (
          <>
            <NavLink to="/admin" end><Users size={16} /> Employees</NavLink>
            <NavLink to="/admin/attendance"><Calendar size={16} /> Attendance</NavLink>
            <NavLink to="/admin/leaves"><FileCheck size={16} /> Approvals</NavLink>
            <NavLink to="/payroll"><CreditCard size={16} /> Payroll</NavLink>
            <NavLink to="/analytics"><BarChart3 size={16} /> Analytics</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard"><LayoutDashboard size={16} /> Dashboard</NavLink>
            <NavLink to="/profile"><User size={16} /> Profile</NavLink>
            <NavLink to="/attendance"><Calendar size={16} /> Attendance</NavLink>
            <NavLink to="/leaves"><FileCheck size={16} /> Leaves</NavLink>
            <NavLink to="/payroll"><CreditCard size={16} /> Payroll</NavLink>
          </>
        )}
      </div>

      <div className="user-profile-menu">
        <NotificationCenter />
        <img
          src={auth?.user?.profilePicture || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'}
          alt="Avatar"
          className="avatar-img"
        />
        <div style={{ textAlign: 'left', display: 'none', md: 'block' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{auth?.user?.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{auth?.user?.role}</div>
        </div>
        <button className="btn-secondary btn-sm" onClick={handleLogout} title="Logout" style={{ padding: '6px 12px' }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </nav>
  );
}
