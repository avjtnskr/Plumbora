import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navbarStyles = `
  .navbar-custom {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(0,194,199,0.12);
    padding: 14px 0;
    transition: box-shadow 0.3s;
    font-family: 'DM Sans', sans-serif;
  }
  .navbar-custom.scrolled { box-shadow: 0 2px 20px rgba(13,43,44,0.08); }

  .nav-brand {
    font-family: 'Clash Display', sans-serif;
    font-size: 22px; font-weight: 700;
    color: #007A7E;
    display: flex; align-items: center; gap: 8px; cursor: pointer;
    text-decoration: none;
  }
  .nav-brand span { color: #00C2C7; }
  .nav-logo-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #00C2C7; display: inline-block;
  }

  .nav-links { display: flex; gap: 28px; align-items: center; }
  .nav-link-item {
    font-size: 14px; font-weight: 500; color: #3D6163;
    cursor: pointer; transition: color 0.2s;
    text-decoration: none;
  }
  .nav-link-item:hover { color: #00C2C7; }
  .nav-link-item.active { color: #00C2C7; font-weight: 600; }

  .btn-nav {
    background: #00C2C7; color: white; border: none;
    padding: 9px 22px; border-radius: 50px;
    font-size: 14px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-nav:hover { background: #00A8AD; transform: translateY(-1px); }

  .btn-nav-outline {
    background: transparent; color: #007A7E;
    border: 1.5px solid #00C2C7;
    padding: 8px 20px; border-radius: 50px;
    font-size: 14px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }
  .btn-nav-outline:hover { background: #E0F9FA; }

  .nav-profile-btn {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #00C2C7, #007A7E);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,194,199,0.3);
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .nav-profile-btn:hover { transform: scale(1.08); }

  .nav-user-name {
    font-size: 13px; font-weight: 600;
    color: #007A7E; max-width: 100px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .nav-hamburger {
    display: none;
    flex-direction: column; gap: 5px;
    cursor: pointer; padding: 4px;
    background: none; border: none;
  }
  .nav-hamburger span {
    display: block; width: 22px; height: 2px;
    background: #3D6163; border-radius: 2px;
    transition: all 0.3s;
  }

  .nav-mobile-menu {
    display: none;
    position: fixed; top: 62px; left: 0; right: 0;
    background: white;
    border-bottom: 1px solid rgba(0,194,199,0.12);
    padding: 16px 20px;
    flex-direction: column; gap: 4px;
    box-shadow: 0 8px 24px rgba(13,43,44,0.08);
    z-index: 999;
  }
  .nav-mobile-menu.open { display: flex; }
  .nav-mobile-link {
    padding: 12px 16px; border-radius: 10px;
    font-size: 14px; font-weight: 500; color: #3D6163;
    cursor: pointer; transition: all 0.2s;
  }
  .nav-mobile-link:hover, .nav-mobile-link.active {
    background: #E0F9FA; color: #007A7E;
  }
  .nav-mobile-divider { height: 1px; background: rgba(0,194,199,0.1); margin: 8px 0; }
  .nav-mobile-actions { display: flex; gap: 10px; padding: 8px 16px; flex-wrap: wrap; }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .btn-nav-outline { display: none !important; }
    .nav-user-name { display: none !important; }
    .nav-hamburger { display: flex; }
  }
`;

const NAV_LINKS = [
  { label: 'Home',     path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Plumbers', path: '/plumbers' },
  { label: 'About Us', path: '/about' },
  { label: 'Track Booking', path: '/track' },
];

export default function Navbar() {
  const navigate                     = useNavigate();
  const location                     = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const [scrolled, setScrolled]      = useState(false);
  const [menuOpen, setMenuOpen]      = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const links = NAV_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{navbarStyles}</style>

      <nav className={`navbar-custom ${scrolled ? 'scrolled' : ''}`}>
        <div className="container d-flex align-items-center justify-content-between">

          {/* Brand */}
          <div className="nav-brand" onClick={() => navigate('/')}>
            <span className="nav-logo-dot" />
            PLUMBORA
          </div>

          {/* Desktop Links */}
          <div className="nav-links">
            {links.map((link) => (
              <span
                key={link.path}
                className={`nav-link-item ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </span>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="d-flex align-items-center gap-2">
            {isLoggedIn ? (
              <>
                <span className="nav-user-name">Hi, {user?.firstName || user?.name?.split(' ')[0]}</span>
                <button className="btn-nav-outline" onClick={handleLogout}>Logout</button>
                <div className="nav-profile-btn" onClick={() => navigate('/profile')} title="My Profile">👤</div>
              </>
            ) : (
              <>
                <button className="btn-nav-outline" onClick={() => navigate('/login')}>Login</button>
                <button className="btn-nav" onClick={() => navigate('/book')}>Book Now</button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>

        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <div
            key={link.path}
            className={`nav-mobile-link ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </div>
        ))}
        <div className="nav-mobile-divider" />
        <div className="nav-mobile-actions">
          {isLoggedIn ? (
            <>
              <button className="btn-nav-outline" style={{ flex: 1 }} onClick={handleLogout}>Logout</button>
              <div className="nav-profile-btn" onClick={() => navigate('/profile')} title="My Profile">👤</div>
            </>
          ) : (
            <>
              <button className="btn-nav-outline" style={{ flex: 1 }} onClick={() => navigate('/login')}>Login</button>
              <button className="btn-nav" style={{ flex: 1 }} onClick={() => navigate('/register')}>Book Now</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
