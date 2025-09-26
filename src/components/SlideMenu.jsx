// SideMenu.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useConversations } from "./Conversation";

function Icon({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

export default function SideMenu({ isOpen, toggleMenu, closeMenu }) {
  const { conversations, activeId, newConversation, selectConversation, removeConversation, clearActive } = useConversations();
  const location = useLocation();
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();

  // close on outside click / Esc (only when open)
  useEffect(() => {
    function onDocClick(e) {
      if (!isOpen) return;
      const target = e.target;
      if (menuRef.current && !menuRef.current.contains(target) && btnRef.current && !btnRef.current.contains(target)) {
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

  const collapsedWidth = 56;
  const openWidth = 200;
  const width = isOpen ? openWidth : collapsedWidth;

  const IconButton = ({ to, label, icon, onClick }) => {
    const content = (
      <div
        className="sm-item"
        onClick={(e) => { onClick && onClick(e); }}
        title={label}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') { onClick && onClick(e); if (to) navigate(to); } }}
      >
        <div className="sm-icon" aria-hidden>{icon}</div>
        {isOpen && <div className="sm-label">{label}</div>}
      </div>
    );

    return to ? (
      <Link to={to} onClick={() => { if (toggleMenu && isOpen) toggleMenu(); }} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    ) : content;
  };

    const handleParentAI = (e) => {
    e && e.stopPropagation();
    // Clear current selection so the page is empty and suppress auto-select briefly
    clearActive();
    // Clear persisted active id as well to avoid reload auto-select
    try { localStorage.removeItem('momai_active_v1'); } catch {}
    // Optionally close the menu and navigate home
    closeMenu && closeMenu();
    navigate('/');
  };

    const handleNewAdvice = async (e) => {
    e && e.stopPropagation();
    try {
      const conv = await newConversation();
      if (conv?.id) selectConversation(conv.id);
    } catch (err) {
    }
    closeMenu && closeMenu();
    setTimeout(() => navigate('/'), 50);
  };


  return (
    <nav
      ref={menuRef}
      className={`side-menu ${isOpen ? 'open' : 'collapsed'}`}
      style={{
        width,
        left: 0,
        height: '100%',
        transition: 'width 180ms ease',
        padding: isOpen ? '10px' : '6px',
        boxSizing: 'border-box'
      }}
    >
      {/* ICONS ROW */}
      <div className="sm-top">
        {/* Toggle */}
        <div
          ref={btnRef}
          className="sm-item sm-toggle"
          onClick={toggleMenu}
          role="button"
          aria-pressed={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          title={isOpen ? 'Close menu' : 'Open menu'}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') toggleMenu(); }}
        >
          <div className="sm-icon" aria-hidden>
            {isOpen ? (
              // close icon
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              // menu icon
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </div>
        </div>

        <div className="sm-actions">
          {/* ParentAI */}
          <IconButton
            label="ParentAI"
            onClick={handleParentAI}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 7a2 2 0 0 1 2-2h8.5a2 2 0 0 1 1.6.8l3.4 4.4a2 2 0 0 1 .4 1.2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M10 13h4M7 13h.01M7 17h.01M10 17h7" />
              </svg>
            }
          />
          {/* Blog + History (closer spacing as a pair) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <IconButton
              to="/blog"
              label="Blog"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 5h11a4 4 0 0 1 4 4v10H8a4 4 0 0 1-4-4z" />
                  <path d="M8 5v14" />
                </svg>
              }
            />
            <IconButton
              to="/history"
              label="History"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              }
            />
          </div>
        </div>

        {/* New Advice appears as a compact item only when open */}
        {isOpen && (
          <div className="sm-item new-advice" onClick={handleNewAdvice} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleNewAdvice(); }} title="+ New Advice">
            <div className="sm-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="sm-label">New Advice</div>
          </div>
        )}
      </div>

      {/* Conversations: only shown when menu is open and on root */}
      {isOpen && location.pathname === '/' && (
        <div className="conversations" style={{ marginTop: 6 }}>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 6 }}>Conversations</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {conversations.map((c) => (
              <li key={c.id} className="conversation-row" title={c.title}>
                <div
                  onClick={() => { selectConversation(c.id); navigate('/'); closeMenu && closeMenu(); }}
                  style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'white', cursor: 'pointer', padding: '4px 0' }}
                >
                  {c.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeConversation(c.id); }}
                    title="Delete"
                    aria-label={`Delete ${c.title}`}
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', padding: 6 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
