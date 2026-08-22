import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthContext';
import NotificationCenter from './NotificationCenter';
import { getAvatarUrl } from '../utils/avatar';

export default function Navbar() {
  const { auth, token, user, logout } = useAuth();
  const activeUser = user || auth?.user;

  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Compute Page Title from route
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/profile': return 'My Profile';
      case '/attendance': return 'Attendance Records';
      case '/leaves': return 'Leave Requests';
      case '/payroll': return 'Salary & Paystubs';
      case '/notifications': return 'Notifications Center';
      case '/admin': return 'HR Control Center';
      case '/admin/employees': return 'Employee Directory';
      case '/admin/attendance': return 'Workforce Attendance';
      case '/admin/leaves': return 'Leave Approvals';
      case '/admin/payroll': return 'Payroll Administration';
      case '/analytics': return 'Reports & Analytics';
      default: return 'Workspace';
    }
  };

  const title = getPageTitle(location.pathname);
  const avatarUrl = getAvatarUrl(activeUser);

  return (
    <header style={{ 
      background: '#231710', 
      color: 'white', 
      height: 70, 
      padding: '0 28px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      borderBottom: '1px solid rgba(255, 244, 194, 0.15)',
      boxShadow: '0 4px 14px rgba(35, 23, 16, 0.12)'
    }}>
      {/* Left: Page Title & Breadcrumb */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#cc9966', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          ElyVia HRMS &bull; {title}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.3px' }}>
          {title}
        </h2>
      </div>

      {/* Right: Search, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Compact Search Bar */}
        <div className="desktop-only" style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 10, color: '#cc9966' }} />
          <input 
            placeholder="Search records..." 
            style={{ 
              background: 'rgba(255, 244, 194, 0.08)', 
              border: '1px solid rgba(255, 244, 194, 0.2)', 
              color: 'white', 
              fontSize: 13, 
              padding: '6px 12px 6px 34px', 
              borderRadius: 20,
              width: 180 
            }}
          />
        </div>

        {/* Real-Time Database Notification Center Component */}
        <NotificationCenter />

        {/* Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <img 
              src={avatarUrl} 
              alt="Avatar"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #cc9966' }}
            />
            <div className="desktop-only" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{activeUser?.name || 'MOUNADHARSHINI VIMALRAJ'}</div>
              <div style={{ fontSize: 11, color: '#cc9966', fontWeight: 600 }}>{activeUser?.role === 'Admin' ? 'HR Admin 👑' : 'Employee Access'}</div>
            </div>
            <ChevronDown size={14} color="#cc9966" />
          </div>

          {showProfileDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 50,
              width: 200,
              background: 'white',
              borderRadius: 14,
              border: '1px solid #eee5d8',
              boxShadow: '0 10px 25px rgba(35, 23, 16, 0.18)',
              overflow: 'hidden',
              zIndex: 100
            }}>
              <Link 
                to="/profile" 
                onClick={() => setShowProfileDropdown(false)}
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#2b1b12', fontSize: 13, fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid #eee5d8' }}
              >
                <User size={15} color="#b37a4c" /> My Profile
              </Link>
              <div 
                onClick={() => { setShowProfileDropdown(false); logout(); navigate('/'); }}
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <LogOut size={15} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
