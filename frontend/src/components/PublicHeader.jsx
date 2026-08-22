import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function PublicHeader() {
  const { auth, token, user, logout } = useAuth();
  const activeToken = token || auth?.token;
  const activeUser = user || auth?.user;
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = activeUser?.role === 'Admin';
  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ 
      background: '#140c08', 
      color: 'white', 
      padding: '12px 36px', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
      borderBottom: '2px solid rgba(204, 153, 102, 0.4)'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: 20 }}>
        {/* Official ElyVia Logo & Cursive Brand Name (Full Vertical Padding to Prevent Top Cutoffs) */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
          <img 
            src="/elyvia-logo.jpg" 
            alt="ElyVia Logo" 
            style={{ 
              height: 42, 
              width: 42, 
              borderRadius: '50%', 
              objectFit: 'cover', 
              boxShadow: '0 0 12px rgba(204, 153, 102, 0.55)', 
              border: '2px solid #cc9966',
              background: '#fdfaf6',
              flexShrink: 0
            }} 
          />
          <span 
            className="brand-name" 
            style={{ 
              fontFamily: "'Alex Brush', 'Great Vibes', cursive", 
              fontSize: 34, 
              fontWeight: 400, 
              letterSpacing: '0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff4c2 35%, #e2c074 70%, #cc9966 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              lineHeight: 1.4,
              paddingTop: 6,
              paddingBottom: 6,
              paddingRight: 8,
              display: 'inline-block'
            }}
          >
            ElyVia
          </span>
        </Link>

        {/* Complete Navigation Links across ALL 4 pages (Home | Features | About | Contact) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
          <Link 
            to="/" 
            style={{ 
              color: isActive('/') ? '#ffffff' : '#d1c1b5', 
              textDecoration: 'none', 
              transition: 'color 0.2s', 
              borderBottom: isActive('/') ? '2.5px solid #cc9966' : '2.5px solid transparent', 
              paddingBottom: 4,
              fontWeight: isActive('/') ? 800 : 600
            }}
          >
            Home
          </Link>
          <Link 
            to="/features" 
            style={{ 
              color: isActive('/features') ? '#ffffff' : '#d1c1b5', 
              textDecoration: 'none', 
              transition: 'color 0.2s', 
              borderBottom: isActive('/features') ? '2.5px solid #cc9966' : '2.5px solid transparent', 
              paddingBottom: 4,
              fontWeight: isActive('/features') ? 800 : 600
            }}
          >
            Features
          </Link>
          <Link 
            to="/about" 
            style={{ 
              color: isActive('/about') ? '#ffffff' : '#d1c1b5', 
              textDecoration: 'none', 
              transition: 'color 0.2s', 
              borderBottom: isActive('/about') ? '2.5px solid #cc9966' : '2.5px solid transparent', 
              paddingBottom: 4,
              fontWeight: isActive('/about') ? 800 : 600
            }}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            style={{ 
              color: isActive('/contact') ? '#ffffff' : '#d1c1b5', 
              textDecoration: 'none', 
              transition: 'color 0.2s', 
              borderBottom: isActive('/contact') ? '2.5px solid #cc9966' : '2.5px solid transparent', 
              paddingBottom: 4,
              fontWeight: isActive('/contact') ? 800 : 600
            }}
          >
            Contact
          </Link>
        </div>

        {/* Authentication Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {activeToken ? (
            <>
              <Link 
                to={dashboardPath} 
                className="btn-primary btn-sm" 
                style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', gap: 8, height: 40, borderRadius: 10, whiteSpace: 'nowrap' }}
              >
                <LayoutDashboard size={16} /> Open Dashboard
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn-secondary btn-sm" 
                style={{ background: 'rgba(255, 244, 194, 0.1)', color: '#fff4c2', borderColor: 'rgba(255, 244, 194, 0.25)', gap: 6, height: 40, borderRadius: 10, whiteSpace: 'nowrap' }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn-secondary btn-sm" 
                style={{ 
                  background: 'rgba(255, 244, 194, 0.12)', 
                  color: '#fff4c2', 
                  border: '1px solid rgba(255, 244, 194, 0.25)', 
                  padding: '10px 22px',
                  height: 40,
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="btn-primary btn-sm" 
                style={{ 
                  padding: '10px 24px', 
                  background: 'linear-gradient(135deg, #b37a4c 0%, #9c6137 100%)', 
                  gap: 8,
                  height: 40,
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                Get Started <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
