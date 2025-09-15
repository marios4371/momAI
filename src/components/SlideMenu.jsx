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
  const { conversations, activeId, newConversation, selectConversation, removeConversation } = useConversations();
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </div>
        </div>

        <IconButton to="/" label="ParentAI" icon={<Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"></path></Icon>} />
        <IconButton to="/blog" label="Blog" icon={<Icon><path d="M21 15V6a2 2 0 0 0-2-2H7"></path><path d="M3 6v12a2 2 0 0 0 2 2h12"></path></Icon>} />
        <IconButton to="/history" label="History" icon={<Icon><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></Icon>} />

        {/* New Advice appears as a compact item only when open */}
        {isOpen && (
          <div className="sm-item new-advice" onClick={handleNewAdvice} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleNewAdvice(); }} title="+ New Advice">
            <div className="sm-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
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
