import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import './User.css';

export default function UserSettings({ userImage, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    paddingLeft: '10px',
    cursor: 'pointer',
    position: 'relative',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    color: 'white',
  };

  const handleLogout = () => {
    setOpen(false);
    if (typeof onLogout === 'function') onLogout();
    navigate('/authPage');
  };

  // onclick outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      <img
        src={userImage}
        alt="User"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
        }}
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div
          className="user-menu"
          style={{
            position: 'absolute',
            top: '50px',
            right: 0,
            background: 'var(--menu-bg-dark)',
            color: 'white',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            minWidth: '140px',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              onClick={() => {
                setOpen(false);
                navigate('/profile');
              }}
              role="menuitem"
            >
              <span className="nav-label">Profile</span>
                <span className="nav-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
            </li>

            <li
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              onClick={() => {
                setOpen(false);
                navigate('/settings');
              }}
              role="menuitem"
            >
              
              <span style={{ color: 'inherit' }}>Settings</span>
              <FiSettings size={18} style={{ flex: '0 0 18px', color: 'inherit' }} />
            </li>

            <li
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: 'inherit',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                aria-label="Logout"
              > 
                <span style={{ color: 'inherit' }}>Logout</span>
                <FiLogOut size={18} style={{ flex: '0 0 18px', color: 'inherit' }} />
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
