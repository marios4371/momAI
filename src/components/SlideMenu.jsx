import React, { useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useConversations } from './Conversation';

export default function SlideMenu({ isOpen, toggleMenu, closeMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const {
    conversations = [],
    clearActive,
    newConversation,
    selectConversation,
    removeConversation,
  } = useConversations?.() || {};

  const collapsedWidth = 56;
  const openWidth = 220;
  const width = isOpen ? openWidth : collapsedWidth;

  const isActivePath = (path) => location.pathname === path;

  const handleParentAI = (e) => {
    e && e.stopPropagation();
    try { clearActive && clearActive(); } catch {}
    try { localStorage.removeItem('momai_active_v1'); } catch {}
    closeMenu && closeMenu();
    navigate('/');
  };

  const handleNewAdvice = async (e) => {
    e && e.stopPropagation();
    try {
      const conv = await (newConversation && newConversation());
      if (conv?.id) selectConversation && selectConversation(conv.id);
    } catch {}
    closeMenu && closeMenu();
    setTimeout(() => navigate('/'), 50);
  };

  const IconButton = ({ to, label, icon, onClick, active }) => {
    const classes = `sm-item${active ? ' active' : ''}`;
    const content = (
      <div
        className={classes}
        onClick={(e) => { onClick && onClick(e); }}
        title={label}
        role="link"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onClick && onClick(e);
            if (to) navigate(to);
          }
        }}
      >
        <div className="sm-icon" aria-hidden>{icon}</div>
        {isOpen && <div className="sm-label">{label}</div>}
      </div>
    );

    return to ? (
      <Link
        to={to}
        aria-current={active ? 'page' : undefined}
        onClick={() => { if (toggleMenu && isOpen) toggleMenu(); }}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {content}
      </Link>
    ) : content;
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
        boxSizing: 'border-box',
        // διακριτική, minimal λευκή γραμμή όπως ChatGPT/Grok
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* TOP: Toggle + Quick Links */}
      <div className="sm-top">
        {/* Toggle (πάνω πάνω) */}
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
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </div>
          {isOpen && <div className="sm-label">Menu</div>}
        </div>

        {/* Quick group: ParentAI, Blog, History */}
        <div className="sm-group sm-quick" style={{ marginTop: isOpen ? 16 : 12 }}>
          <IconButton
            label="ParentAI"
            onClick={handleParentAI}
            active={isActivePath('/')}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 7a2 2 0 0 1 2-2h8.5a2 2 0 0 1 1.6.8l3.4 4.4a2 2 0 0 1 .4 1.2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M10 13h4M7 13h.01M7 17h.01M10 17h7" />
              </svg>
            }
          />
          <IconButton
            to="/blog"
            label="Blog"
            active={isActivePath('/blog')}
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
            active={isActivePath('/history')}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
          />
        </div>

        <div className="sm-separator" />

        {/* New Advice (πιο “primary”, μόνο όταν είναι ανοιχτό) */}
        {isOpen && (
          <div
            className="sm-item new-advice"
            onClick={handleNewAdvice}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNewAdvice(); }}
            title="+ New Advice"
            aria-label="New Advice"
          >
            <div className="sm-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="sm-label">New Advice</div>
          </div>
        )}
      </div>

      {/* Conversations: μόνο όταν open και στο root */}
      {isOpen && location.pathname === '/' && (
        <div className="conversations" style={{ marginTop: 6 }}>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 6 }}>Conversations</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {conversations.map((c) => (
              <li key={c.id} className="conversation-row" title={c.title}>
                <div
                  onClick={() => { selectConversation && selectConversation(c.id); navigate('/'); closeMenu && closeMenu(); }}
                  style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'white', cursor: 'pointer', padding: '4px 0' }}
                >
                  {c.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeConversation && removeConversation(c.id); }}
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