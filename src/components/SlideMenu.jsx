import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function SideMenu({ isOpen, toggleMenu, closeMenu }) {
  const location = useLocation();
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // close out or ESC
  useEffect(() => {
    function onDocClick(e) {
      if (!isOpen) return;
      const target = e.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        // for clicking outside
        closeMenu && closeMenu();
      }
    }
    function onKey(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu && closeMenu();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeMenu]);

  const menuItemStyle = {
    padding: '10px 0',
    paddingLeft: '10px',
    cursor: isOpen ? 'pointer' : 'default',
    position: 'relative',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  };

  const handleHover = (e, color) => {
    if (isOpen) {
      e.currentTarget.style.backgroundColor = color;
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleMenu}
        style={{
          position: 'fixed',
          top: '20px',
          left: '2.8px',
          padding: '5px 10px',
          cursor: 'pointer',
          backgroundColor: 'white',
          color: 'black',
          border: 'none',
          borderRadius: '4px',
          outline: 'none',
          zIndex: 1100,
        }}
      >
        ☰
      </button>

      <div
        ref={menuRef}
        className="theme-menu"
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? '0' : '-200px',
          width: '200px',
          height: '100%',
          background: 'var(--menu-bg-dark)',
          color: 'var(--menu-text)',
          padding: '20px',
          transition: 'left 0.3s ease',
          zIndex: 1000,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <h3
          style={{
            marginTop: '11px',
            marginLeft: '50px',
            fontWeight: 'bold',
          }}
        >
          MOM AI
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {location.pathname === '/' && (
            <>
              <li
                style={menuItemStyle}
                onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => handleHover(e, 'transparent')}
              >
                <Link
                  to="/blog"
                  onClick={toggleMenu}
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Blog
                </Link>
              </li>
              <li
                style={menuItemStyle}
                onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => handleHover(e, 'transparent')}
              >
                <Link
                  to="/history"
                  onClick={toggleMenu}
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  History
                </Link>
              </li>
            </>
          )}

          {location.pathname === '/blog' && (
            <>
              <li
                style={menuItemStyle}
                onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => handleHover(e, 'transparent')}
              >
                <Link
                  to="/"
                  onClick={toggleMenu}
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Mom AI
                </Link>
              </li>
              <li
                style={menuItemStyle}
                onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => handleHover(e, 'transparent')}
              >
                <Link
                  to="/history"
                  onClick={toggleMenu}
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  History
                </Link>
              </li>
            </>
          )}

          {location.pathname === '/history' && (
            <>
              <li
                style={menuItemStyle}
                onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => handleHover(e, 'transparent')}
              >
                <Link
                  to="/"
                  onClick={toggleMenu}
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  MomAi
                </Link>
              </li>
              <li
                style={menuItemStyle}
                onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => handleHover(e, 'transparent')}
              >
                <Link
                  to="/blog"
                  onClick={toggleMenu}
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Blog
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}
