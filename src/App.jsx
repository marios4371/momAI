import './App.css';
import { useEffect, useState, useCallback } from 'react';
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
  const { conversations, activeId, addMessage } = useConversations();
  const active = conversations.find(c => c.id === activeId) ?? null;

  const handleSend = (text) => {
    if (!active) return;
    addMessage(active.id, { id: Date.now(), text, from: 'user', ts: Date.now() });
  };

  return (
    <div>
      <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '600px' }}>
        <ChatInput onSend={handleSend} />
      </div>

      <div style={{ position:'fixed', top: '100px', left:'50%', transform: 'translateX(-50%)', width:'90%', maxWidth:'600px', maxHeight: '60vh', overflowY:'auto', padding: 12 }}>
        {active ? (
          active.messages.map(m => (
            <div key={m.id} style={{ marginBottom: 8, padding: 10, background: m.from === 'user' ? 'rgba(0,128,0,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <div style={{ color: '#fff' }}>{m.text}</div>
            </div>
          ))
        ) : (
          <div style={{ color: '#aaa' }}>No conversation selected</div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('boy');
  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

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
      {isAuthenticated && (
        <ConversationsProvider>
          <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
          <UserSettings userImage={userPic} onLogout={() => { setIsAuthenticated(false); applyTheme('boy'); }} />
        </ConversationsProvider>
      )}

      <Routes>
        <Route path="/auth" element={<AuthPage setTheme={(t) => applyTheme(t)} onAuth={() => setIsAuthenticated(true)} />} />
        <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/auth" replace />} />
        <Route path="/blog" element={isAuthenticated ? <Blog /> : <Navigate to="/auth" replace />} />
        <Route path="/" element={isAuthenticated ? (
          <ConversationsProvider>
            <ChatArea />
          </ConversationsProvider>
        ) : <Navigate to="/auth" replace />} />
        <Route path="/upload" element={isAuthenticated ? <Upload /> : <Navigate to="/auth" replace />} />
        <Route path="/post" element={isAuthenticated ? <Post /> : <Navigate to="/auth" replace />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/auth'} replace />} />
      </Routes>
    </div>
  );
}
export default App;