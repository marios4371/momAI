import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useConversations } from "./Conversation";

export default function SideMenu({ isOpen, toggleMenu, closeMenu }) {
  const { conversations, activeId, newConversation, selectConversation } = useConversations();
  const location = useLocation();
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [momDropdown, setMomDropdown] = useState(false);

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

  const menuItemStyle = { padding: '10px 0', paddingLeft: '10px', cursor: isOpen ? 'pointer' : 'default', position: 'relative', borderRadius: '4px', transition: 'background-color 0.2s ease' };

  const handleHover = (e, color) => { if (isOpen) e.currentTarget.style.backgroundColor = color; };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleMenu}
        style={{ position: 'fixed', top: '20px', left: '2.8px', padding: '5px 10px', cursor: 'pointer', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '4px', outline: 'none', zIndex: 1100 }}
      >
        ☰
      </button>

      <div
        ref={menuRef}
        className="theme-menu"
        style={{ position: 'fixed', top: 0, left: isOpen ? '0' : '-200px', width: '200px', height: '100%', background: 'var(--menu-bg-dark)', color: 'var(--menu-text)', padding: '20px', transition: 'left 0.3s ease', zIndex: 1000, pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        {/* MOM AI dropdown*/}
        <h3
          className={`mom-header ${location.pathname === '/' && momDropdown ? 'active' : ''}`}
          onClick={() => { if (location.pathname === '/') setMomDropdown((v) => !v); }}
          style={{ marginTop: '11px', marginLeft: '30px', fontWeight: 'bold', cursor: location.pathname === '/' ? 'pointer' : 'default' }}
        >
          MOM AI
        </h3>

        {/* dropdown content */}
        {location.pathname === '/' && momDropdown && (
          <div style={{ marginTop: 8, marginLeft: 6 }}>
            <button
              className="btn new-advice"
              onClick={(e) => {
                e.stopPropagation();
                const conv = newConversation();
                window.location.reload();
              }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
            >
              + New Advice
            </button>
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          {location.pathname === '/' && (
            <>
              <li style={menuItemStyle} onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')} onMouseLeave={(e) => handleHover(e, 'transparent')}>
                <Link to="/blog" onClick={toggleMenu} style={{ color: 'white', textDecoration: 'none' }}>Blog</Link>
              </li>
              <li style={menuItemStyle} onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')} onMouseLeave={(e) => handleHover(e, 'transparent')}>
                <Link to="/history" onClick={toggleMenu} style={{ color: 'white', textDecoration: 'none' }}>History</Link>
              </li>
            </>
          )}

          {(location.pathname === '/blog' || location.pathname === '/history' || location.pathname === '/upload' || location.pathname === '/post' || location.pathname === '/profile') && (
            <>
              <li style={menuItemStyle} onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')} onMouseLeave={(e) => handleHover(e, 'transparent')}>
                <Link to="/" onClick={toggleMenu} style={{ color: 'white', textDecoration: 'none' }}>MomAi</Link>
              </li>
              <li style={menuItemStyle} onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')} onMouseLeave={(e) => handleHover(e, 'transparent')}>
                <Link to="/blog" onClick={toggleMenu} style={{ color: 'white', textDecoration: 'none' }}>Blog</Link>
              </li>
              <li style={menuItemStyle} onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.08)')} onMouseLeave={(e) => handleHover(e, 'transparent')}>
                <Link to="/history" onClick={toggleMenu} style={{ color: 'white', textDecoration: 'none' }}>History</Link>
              </li>
            </>
          )}
        </ul>

        {location.pathname === '/' && (
          <div className="conversations" style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: 'white' }}>Conversations</div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {conversations.map((c) => (
                <li
                  key={c.id}
                  onClick={() => { selectConversation(c.id); }}
                  onMouseEnter={(e) => handleHover(e, 'rgba(255,255,255,0.04)')}
                  onMouseLeave={(e) => handleHover(e, 'transparent')}
                  style={{ padding: '8px 10px', borderRadius: 6, marginBottom: 6, background: c.id === activeId ? 'rgba(255,255,255,0.06)' : 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}
                  title={c.title}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{(c.messages?.length || 0)}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </>
  );

}
