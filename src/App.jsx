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
  const { conversations, activeId, sendUserMessage, resendAsUser, isBusy, selectConversation, suppressAutoSelect, updateMessage } = useConversations();
  const active = conversations.find(c => c.id === activeId) ?? null;
  const [editingText, setEditingText] = useState('');
  const [editingMsgId, setEditingMsgId] = useState(null);
  const editTextareaRef = useRef(null);

  const contentRef = useRef(null); // ref για το inner content
  const inputBarRef = useRef(null); // ref για το fixed chat input wrapper
  const [spacerHeight, setSpacerHeight] = useState(0); // ύψος για το spacer
  const [clipHeight, setClipHeight] = useState(0); // ύψος για το clipper
  const [topPad, setTopPad] = useState(132); // extra απόσταση πριν από το πρώτο μήνυμα

  const TOP_OFFSET = 140; // ΠΡΕΠΕΙ να ταιριάζει με το top: 140px στο CSS της .messages-clipper
  const TOP_FADE = 120;   // ΠΡΕΠΕΙ να ταιριάζει με το gradient mask top fade

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

  // Υπολόγισε το ύψος του chat input (αν χρειάζεται) και όρισε topPad ώστε το πρώτο μήνυμα να μην "χάνεται" στο fade
  useEffect(() => {
    try {
      const h = inputBarRef.current ? inputBarRef.current.offsetHeight : 0;
      // Βάλε padding τουλάχιστον όσο το TOP_FADE, συν ένα μικρό περιθώριο
      const desired = Math.max(TOP_FADE + 12, h ? h + 24 : 0);
      setTopPad(desired);
    } catch {}
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
    // Αποστολή νέου μηνύματος μόνο από το κάτω ChatInput
    sendUserMessage(text);
  };

  const startEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
    // το ChatInput παίρνει initialText από το editingText
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setEditingText('');
    // ανανέωση μετρήσεων ύψους
    setTimeout(() => updateSpacer(), 0);
  };

  const saveEdit = (convId, msgId) => {
    const newText = (editingText || '').trim();
    if (!newText) {
      // κενό: δεν αποθηκεύουμε αλλαγές
      cancelEdit();
      return;
    }
    try {
      updateMessage(convId, msgId, newText);
    } finally {
      setEditingMsgId(null);
      setEditingText('');
      setTimeout(() => updateSpacer(), 0);
    }
  };

  // autofocus στο textarea όταν ξεκινά η επεξεργασία
  useEffect(() => {
    if (editingMsgId && editTextareaRef.current) {
      try {
        const ta = editTextareaRef.current;
        ta.focus();
        // autosize αρχικά
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 220) + 'px';
      } catch {}
    }
  }, [editingMsgId]);

  const handleResend = (msg) => {
    resendAsUser(active.id, msg.text);
  };

  return (
    <>
      {/* ChatInput παραμένει fixed όπως το είχες */}
      <div ref={inputBarRef} style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 720, zIndex: 1300 }}>
        <ChatInput onSend={(txt) => handleSend(txt)} initialText={''} />
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
          pointerEvents: 'auto',
          WebkitMaskImage: spacerHeight > 0 ? 'linear-gradient(to bottom, transparent 0px, black 120px, black 100%)' : 'none',
          maskImage: spacerHeight > 0 ? 'linear-gradient(to bottom, transparent 0px, black 120px, black 100%)' : 'none',
        }}
      >
        {/* Inner content: με ref για μέτρηση ύψους και transform sync */}
        <div ref={contentRef} style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 12, paddingTop: 12 + topPad, boxSizing: 'border-box' }} aria-live="polite">
          {active && active.messages && active.messages.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {active.messages.map(m => (
                <div key={m.id} className="message-row" style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                  {(() => {
                    const isUser = m.from === 'user';
                    const styleUser = {
                      maxWidth: '86%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04))',
                      color: 'var(--text, #fff)',
                      padding: '12px 14px',
                      borderRadius: 12,
                      fontSize: 16,
                      lineHeight: 1.4,
                      boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
                      position: 'relative'
                    };
                    const styleBot = {
                      maxWidth: '86%',
                      background: 'transparent',
                      color: 'var(--text, #fff)',
                      padding: 0,
                      borderRadius: 0,
                      fontSize: 16,
                      lineHeight: 1.5,
                      boxShadow: 'none',
                      position: 'relative'
                    };
                    if (!isUser) {
                      return (
                        <div style={styleBot}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                        </div>
                      );
                    }

                    // User bubble: render either view or inline edit
                    const isEditing = editingMsgId === m.id;
                    if (!isEditing) {
                      return (
                        <div style={styleUser}>
                          {/* Edit button overlay on bubble */}
                          <button
                            title="Edit"
                            onClick={() => startEdit(m)}
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              width: 26,
                              height: 26,
                              borderRadius: 13,
                              border: 'none',
                              background: 'rgba(255,255,255,0.18)',
                              color: 'rgba(255,255,255,0.95)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✎
                          </button>
                          <div style={{ whiteSpace: 'pre-wrap', paddingRight: 30 }}>{m.text}</div>
                        </div>
                      );
                    }

                    // Inline edit UI inside bubble
                    return (
                      <div style={{ ...styleUser, maxWidth: '92%', background: '#3b82f6', padding: 12 }}>
                        <textarea
                          ref={editTextareaRef}
                          value={editingText}
                          onChange={(e) => {
                            setEditingText(e.target.value);
                            // autosize
                            try {
                              const ta = e.target;
                              ta.style.height = 'auto';
                              ta.style.height = Math.min(ta.scrollHeight, 280) + 'px';
                            } catch {}
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              saveEdit(active.id, m.id);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                          style={{
                            width: '100%',
                            minHeight: 100,
                            maxHeight: 280,
                            resize: 'none',
                            background: 'transparent',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '12px 12px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            fontSize: 16,
                            lineHeight: 1.5,
                            marginBottom: 10
                          }}
                        />
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={cancelEdit}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: '#fff',
                              color: '#1f2937',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: 13
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(active.id, m.id)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: '#1d4ed8',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 800,
                              fontSize: 13
                            }}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    );
                  })()}

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
  const AUTH_EXP_KEY = 'momai_auth_exp';

  const hasValidAuth = useCallback(() => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const expRaw = localStorage.getItem(AUTH_EXP_KEY);
      const exp = expRaw ? parseInt(expRaw, 10) : 0;
      const now = Date.now();
      if (!token || !exp || now > exp) {
        // expired or missing: cleanup to avoid accidental auto-login by user id
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_EXP_KEY);
        localStorage.removeItem(USER_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasValidAuth());
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
      if (!e.key || e.key === AUTH_TOKEN_KEY || e.key === AUTH_EXP_KEY || e.key === USER_KEY) {
        setIsAuthenticated(hasValidAuth());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hasValidAuth]);

  // On mount, enforce expiry once (in case a stale token/user id remained)
  useEffect(() => {
    setIsAuthenticated(hasValidAuth());
  }, [hasValidAuth]);

  // Auto-logout timer
  useEffect(() => {
    if (!isAuthenticated) return;
    let timer;
    try {
      const expRaw = localStorage.getItem(AUTH_EXP_KEY);
      const exp = expRaw ? parseInt(expRaw, 10) : 0;
      const now = Date.now();
      const ms = exp - now;
      if (ms > 0) {
        timer = setTimeout(() => {
          try {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_EXP_KEY);
            localStorage.removeItem(USER_KEY);
          } catch {}
          setIsAuthenticated(false);
        }, ms);
      } else {
        try {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_EXP_KEY);
          localStorage.removeItem(USER_KEY);
        } catch {}
        setIsAuthenticated(false);
      }
    } catch {}
    return () => timer && clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <div className="app-container">
      {isAuthenticated ? (
        <ConversationsProvider resetActiveOnMount={resetActiveOnEntry}>
          <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
          <UserSettings
            userImage={userPic}
            onLogout={() => {
              try {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(AUTH_EXP_KEY);
                localStorage.removeItem(USER_KEY);
                // καθάρισε και τα στοιχεία avatar για να μη μένει παλιά φωτογραφία
                localStorage.removeItem('momai_login_provider');
                localStorage.removeItem('momai_user_photo');
                localStorage.removeItem('momai_user_name');
                localStorage.removeItem('momai_user_email');
                localStorage.removeItem('momai_user_initials');
              } catch {}
              setIsAuthenticated(false);
              applyTheme('boy');
            }}
          />

          <Routes>
            {/* onAuth: set auth token with 2-hour expiration; AuthPage can still set user id */}
            <Route path="/auth" element={<AuthPage setTheme={(t) => applyTheme(t)} onAuth={() => {
              try {
                localStorage.setItem(AUTH_TOKEN_KEY, '1');
                const exp = Date.now() + 2 * 60 * 60 * 1000;
                localStorage.setItem(AUTH_EXP_KEY, String(exp));
              } catch {}
              setResetActiveOnEntry(true);
              setIsAuthenticated(true);
            }} />} />
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
          <Route path="/auth" element={<AuthPage setTheme={(t) => applyTheme(t)} onAuth={() => {
            try {
              localStorage.setItem(AUTH_TOKEN_KEY, '1');
              const exp = Date.now() + 2 * 60 * 60 * 1000;
              localStorage.setItem(AUTH_EXP_KEY, String(exp));
            } catch {}
            setIsAuthenticated(true);
          }} />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      )}
    </div>
  );
}
export default App;