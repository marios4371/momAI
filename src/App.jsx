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

  const contentRef = useRef(null); // ref για το inner content
  const [spacerHeight, setSpacerHeight] = useState(0); // ύψος για το spacer
  const [clipHeight, setClipHeight] = useState(0); // ύψος για το clipper

  const TOP_OFFSET = 140; // ΠΡΕΠΕΙ να ταιριάζει με το top: 140px στο CSS της .messages-clipper

  const [phIndex, setPhIndex] = useState(0);
  const placeholders = [
    'Γράψε ένα στόχο γονεϊκότητας…',
    'Πες μου τι σε δυσκολεύει με το παιδί σου σήμερα…',
    'Ζήτα ιδέες για όρια με αγάπη…',
    'Πώς να χειριστώ μια έκρηξη θυμού;…',
    'Βοήθησέ με να φτιάξω ρουτίνα ύπνου…',
    'Θέλω να επικοινωνώ πιο ήρεμα…',
  ];

  useEffect(() => {
    const t = setInterval(() => setPhIndex((i) => (i + 1) % placeholders.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Ενημέρωση spacer και clipHeight: υπολογίζουμε ΜΟΝΟ το υπερβάλλον ύψος που προκαλεί overflow
  const updateSpacer = useCallback(() => {
    try {
      const el = contentRef.current;
      if (!el) {
        setSpacerHeight(0);
        setClipHeight(0);
        return;
      }
      // Το πλήρες ύψος του περιεχομένου μέσα στο inner content
      const contentHeight = el.scrollHeight || el.offsetHeight || 0;

      // χώρος που έχουμε διαθέσιμο στο viewport για να δείξουμε το container χωρίς overflow:
      const availableHeight = window.innerHeight - TOP_OFFSET - 16; // 16px margin ασφαλείας

      // Αν χωράει, δεν χρειάζεται spacer -> 0, και clipHeight = contentHeight (ή available για safety)
      const extra = Math.max(0, contentHeight - availableHeight);
      setSpacerHeight(extra);
      setClipHeight(availableHeight);
    } catch (e) {
      setSpacerHeight(0);
      setClipHeight(0);
    }
  }, [TOP_OFFSET]);

  // Διαχείριση visibility της scrollbar βασισμένο στο spacerHeight
  useEffect(() => {
    const overflowStyle = spacerHeight > 0 ? 'auto' : 'hidden';
    document.documentElement.style.overflowY = overflowStyle;
    document.body.style.overflowY = overflowStyle;
  }, [spacerHeight]);

  // Όταν αλλάζουν τα μηνύματα, ενημέρωσε spacer και σκρολλάρισε το παράθυρο στο τέλος
  useEffect(() => {
    // μικρό delay για να ολοκληρωθεί το render και να έχει σωστό scrollHeight
    const raf = requestAnimationFrame(() => {
      updateSpacer();
    });

    const t = setTimeout(() => {
      try {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
      } catch {
        window.scrollTo(0, document.body.scrollHeight);
      }
    }, 40);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [active?.messages?.length, activeId, updateSpacer]);

  // Συγχρονισμός του inner content με το φυσικό scroll (έτσι η default scrollbar κινεί και τα μηνύματα)
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      // Μετακινούμε το inner content αντίθετα στο scroll για να "τρέξει" μαζί με το document.
      // Όταν το window.scrollY = s, ο content μετακινείται κατά -s (οπτικά κινείται επάνω)
      const s = window.scrollY || window.pageYOffset || 0;
      el.style.transform = `translateY(${-s}px)`;
    };

    // αρχική κλήση για να ορίσουμε transform
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // resize listener για να ανανεώνουμε όταν αλλάζει μέγεθος ο viewport
  useEffect(() => {
    const onResize = () => updateSpacer();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateSpacer]);

  // Αρχικοποίηση overflow σε hidden κατά το mount
  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.body.style.overflowY = 'hidden';

    return () => {
      // Επαναφορά σε default κατά το unmount
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
    };
  }, []);

  const handleSend = (text) => {
    if (editingMsgId) {
      // αν επεξεργαζόμαστε μήνυμα, στείλε σαν νέο (σημερινή λογική)
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
    // το ChatInput παίρνει initialText από το editingText
  };

  const handleResend = (msg) => {
    resendAsUser(active.id, msg.text);
  };

  return (
    <>
      {/* ChatInput παραμένει fixed όπως το είχες */}
      <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 720, zIndex: 1300 }}>
        <ChatInput onSend={(txt) => handleSend(txt)} initialText={editingText || ''} />
      </div>

      {/* Spacer: συμμετέχει στο document flow και παίρνει ΜΟΝΟ το υπερβάλλον ύψος */}
      <div className="messages-spacer" style={{ height: spacerHeight ? `${spacerHeight}px` : undefined }} />

      {/* Fixed clipper: περιορίζει το visible area, με mask για fade disappear */}
      <div 
        className="messages-clipper" 
        style={{ 
          position: 'fixed', 
          top: TOP_OFFSET, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '92%', 
          maxWidth: 900, 
          height: `${clipHeight}px`, 
          overflow: 'hidden', 
          zIndex: 1200, 
          pointerEvents: 'none',
          WebkitMaskImage: spacerHeight > 0 ? 'linear-gradient(to bottom, transparent 0px, black 120px, black 100%)' : 'none',
          maskImage: spacerHeight > 0 ? 'linear-gradient(to bottom, transparent 0px, black 120px, black 100%)' : 'none',
        }}
      >
        {/* Inner content: με ref για μέτρηση ύψους και transform sync */}
        <div ref={contentRef} style={{ padding: 12, boxSizing: 'border-box' }} aria-live="polite">
          {active && active.messages && active.messages.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {active.messages.map(m => (
                <div key={m.id} className="message-row" style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
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
            <div style={{ height: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', maxWidth: 520, padding: '12px 16px', color: 'rgba(255,255,255,0.92)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>ParentAI</div>
                <div style={{ fontSize: 16, opacity: 0.92 }}>{placeholders[phIndex]}</div>
                <div style={{ marginTop: 8, fontSize: 13, opacity: 0.72 }}>Ξεκίνα να πληκτρολογείς παραπάνω και πάτησε Enter για νέα συμβουλή.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Persisted auth: read from localStorage (user id or token)
  const AUTH_TOKEN_KEY = 'momai_auth_token';
  const USER_KEY = 'momai_user_id';
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(USER_KEY));
    } catch {
      return false;
    }
  });
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

  // Keep isAuthenticated in sync with storage changes (multi-tab or after login in-page)
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (!e.key || e.key === AUTH_TOKEN_KEY || e.key === USER_KEY) {
        const hasAuth = Boolean(localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(USER_KEY));
        setIsAuthenticated(hasAuth);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="app-container">
      {isAuthenticated ? (
        // ΠΕΡΝΑΜΕ την προτίμηση στο provider
        <ConversationsProvider resetActiveOnMount={resetActiveOnEntry}>
          <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
          <UserSettings
            userImage={userPic}
            onLogout={() => {
              try {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
              } catch {}
              setIsAuthenticated(false);
              applyTheme('boy');
            }}
          />

          <Routes>
            {/* onAuth should also store momai_user_id and/or momai_auth_token in localStorage */}
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
          {/* For first-time login; AuthPage should store auth in localStorage so refresh keeps you signed in */}
          <Route path="/auth" element={<AuthPage setTheme={(t) => applyTheme(t)} onAuth={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      )}
    </div>
  );
}
export default App;