import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useConversations } from "./Conversation";

export default function SideMenu({ isOpen, toggleMenu, closeMenu }) {
  const { conversations, activeId, newConversation, selectConversation, removeConversation } = useConversations();
  const location = useLocation();
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const [momDropdown, setMomDropdown] = useState(false);

  // delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  // per-conversation three-dots dropdown
  const [openMenuId, setOpenMenuId] = useState(null);

  const confirmDelete = (conv) => {
    setDeleteTarget(conv);
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    removeConversation(deleteTarget.id);
    setDeleteTarget(null);
  };

  const cancelDelete = () => setDeleteTarget(null);

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
        setOpenMenuId(null);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu && closeMenu();
        setOpenMenuId(null);
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
        {isOpen && (
          <>
            <h3
              className={`mom-header ${(location.pathname === '/blog' || location.pathname === '/history' || location.pathname === '/upload' || location.pathname === '/post' || location.pathname === '/profile' || location.pathname === '/' ) && momDropdown ? 'active' : ''}`}
              onClick={() => { if (location.pathname === '/blog' || location.pathname === '/history' || location.pathname === '/upload' || location.pathname === '/post' || location.pathname === '/profile' || location.pathname === '/' ) setMomDropdown((v) => !v); }}
              style={{ marginTop: '11px', marginLeft: '30px', fontWeight: 'bold', cursor: (location.pathname === '/blog' || location.pathname === '/history' || location.pathname === '/upload' || location.pathname === '/post' || location.pathname === '/profile' || location.pathname === '/' ) ? 'pointer' : 'default' }}
            >
              MOM AI
            </h3>

            {/* dropdown content */}
            {(location.pathname === '/blog' || location.pathname === '/history' || location.pathname === '/upload' || location.pathname === '/post' || location.pathname === '/profile' || location.pathname === '/' )&& momDropdown && (
              <div style={{ marginTop: 8, marginLeft: 6 }}>
                <button
                  className="btn new-advice"
                  onClick={(e) => {
                    e.stopPropagation();
                    const conv = newConversation();
                    // ensure active selection is applied
                    try { if (conv?.id) selectConversation(conv.id); } catch {}
                    setMomDropdown(false);
                    closeMenu && closeMenu();
                    // navigate after a tiny delay so provider state updates take effect
                    setTimeout(() => {
                      navigate('/');
                    }, 50);
                  }}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                >
                  + New Advice
                </button>
              </div>
            )}
          </>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* three-dots button opens small dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId((id) => (id === c.id ? null : c.id)); }}
                        title="More"
                        aria-label={`More options for ${c.title}`}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', padding: 6, marginLeft: 8 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <circle cx="12" cy="5" r="1.5"></circle>
                          <circle cx="12" cy="12" r="1.5"></circle>
                          <circle cx="12" cy="19" r="1.5"></circle>
                        </svg>
                      </button>

                      {openMenuId === c.id && (
                        <div
                          role="menu"
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 28,
                            background: 'rgba(40,40,44,0.96)',
                            borderRadius: 8,
                            padding: 6,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                            minWidth: 120,
                            zIndex: 1500
                          }}
                        >
                          {/* bin */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              confirmDelete(c);
                              closeMenu && closeMenu();
                            }}
                            style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '8px', cursor: 'pointer', borderRadius: 6 }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                              <path d="M10 11v6"></path>
                              <path d="M14 11v6"></path>
                            </svg>
                            <span style={{ fontSize: 14 }}>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {deleteTarget && (
        <div
          className="delete-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={cancelDelete}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360,
              maxWidth: '92%',
              background: 'linear-gradient(180deg, #2f2f32, #232425)',
              color: 'white',
              padding: 18,
              borderRadius: 10,
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              textAlign: 'center'
            }}
          >
            <div style={{ marginBottom: 12, fontWeight: 700 }}>Delete Conversation</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 18 }}>{`Are you sure about deleting this conversation? "${deleteTarget.title}" ;`}</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={cancelDelete} className="btn ghost" style={{ padding: '8px 12px' }}>No</button>
              <button onClick={() => { doDelete(); }} className="btn" style={{ padding: '8px 12px' }}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

}
