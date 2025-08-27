import './App.css';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SideMenu from './components/SlideMenu.jsx';
import ChatInput from './components/ChatInput';
import UserSettings from './components/User.jsx';
import userPic from './assets/user.png';
import Blog from './pages/Blog.jsx';
import AuthPage from './pages/AuthPage.jsx';
import History from './pages/History';
import Upload from './pages/Upload.jsx';
import Post from './pages/Post.jsx';
import Profile from './pages/Profile.jsx';
import { ConversationsProvider, useConversations } from './components/Conversation';

function ChatArea() {
  const { conversations, activeId, sendUserMessage, resendAsUser, isBusy, selectConversation, suppressAutoSelect } = useConversations();
  const active = conversations.find(c => c.id === activeId) ?? null;
  const [editingText, setEditingText] = useState('');
  const [editingMsgId, setEditingMsgId] = useState(null);
  const scrollRef = useRef(null);
  const mountedRef = useRef(false);
  const prevConvLenRef = useRef(conversations.length);

  useEffect(() => {
    // skip first render logic (we don't force-select on mount)
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevConvLenRef.current = conversations.length;
      return;
    }

    // if there's no active conversation and suppressAutoSelect is false,
    // only auto-select when conversations length has increased (new conv created)
    if (!active && conversations.length && !suppressAutoSelect) {
      if (conversations.length > prevConvLenRef.current) {
        selectConversation(conversations[0].id);
      }
    }

    prevConvLenRef.current = conversations.length;
  }, [active, conversations, selectConversation, suppressAutoSelect]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages?.length, activeId]);

  const handleSend = (text) => {
    if (editingMsgId) {
      // send edited text as new user message
      sendUserMessage(text);
      setEditingMsgId(null);
      setEditingText('');
      return;
    }
    sendUserMessage(text);
  };

  const startEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
    // focus & populate input via initialText prop
  };

  const handleResend = (msg) => {
    resendAsUser(active.id, msg.text);
  };

  return (
    <>
      <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 720, zIndex: 1300 }}>
        <ChatInput onSend={handleSend} initialText={editingText} disabled={isBusy} onTextChange={() => {}} />
      </div>

      <div
        ref={scrollRef}
        className="messages-container"
      >
        {active && active.messages && active.messages.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.messages.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '86%', background: m.from === 'user' ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04))' : 'rgba(255,255,255,0.03)', color: 'var(--text, #fff)', padding: '12px 14px', borderRadius: 12, fontSize: 16, lineHeight: 1.4, boxShadow: m.from === 'user' ? '0 6px 18px rgba(0,0,0,0.45)' : 'none', position: 'relative' }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>

                {m.from === 'user' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button title="Edit" onClick={() => startEdit(m)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer' }}>✎</button>
                    <button title="Resend" onClick={() => handleResend(m)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer' }}>↺</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: 48 }} />
        )}
      </div>
    </>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('boy');
  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  const [resetActiveOnEntry, setResetActiveOnEntry] = useState(false);

  const applyTheme = useCallback((t) => {
    setTheme(t);
    try {
      localStorage.setItem('app-theme', t);
    } catch {}
    document.body.classList.remove('theme-boy', 'theme-girl');
    document.body.classList.add(t === 'girl' ? 'theme-girl' : 'theme-boy');
  }, []);

  useEffect(() => {
    document.body.classList.remove('theme-boy', 'theme-girl');
    document.body.classList.add(theme === 'girl' ? 'theme-girl' : 'theme-boy');
  }, []);

  return (
    <div className="app-container">
      {isAuthenticated ? (
        // ΠΕΡΝΑΜΕ την προτίμηση στο provider
        <ConversationsProvider resetActiveOnMount={resetActiveOnEntry}>
          <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
          <UserSettings userImage={userPic} onLogout={() => { setIsAuthenticated(false); applyTheme('boy'); }} />

          <Routes>
            <Route path="/auth" element={<AuthPage setTheme={(t) => applyTheme(t)} onAuth={() => { setResetActiveOnEntry(true); setIsAuthenticated(true); }} />} />
            <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/auth" replace />} />
            <Route path="/blog" element={isAuthenticated ? <Blog /> : <Navigate to="/auth" replace />} />
            <Route path="/" element={isAuthenticated ? <ChatArea /> : <Navigate to="/auth" replace />} />
            <Route path="/upload" element={isAuthenticated ? <Upload /> : <Navigate to="/auth" replace />} />
            <Route path="/post" element={isAuthenticated ? <Post /> : <Navigate to="/auth" replace />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/auth'} replace />} />
          </Routes>
        </ConversationsProvider>
      ) : (
        <Routes>
          <Route path="/auth" element={<AuthPage setTheme={(t) => applyTheme(t)} onAuth={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      )}
    </div>
  );
}
export default App;