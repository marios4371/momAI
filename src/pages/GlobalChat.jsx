import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import './GlobalChat.css';

export default function GlobalChat() {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const navigate = useNavigate();

  // ensure full-page background matches chat background while on this page
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = '#f5efe6';
    return () => { document.body.style.background = prev; };
  }, []);

  // Use page scroll to detect if messages are at bottom
  useEffect(() => {
    const onScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowBottom = window.innerHeight || document.documentElement.clientHeight;
      const distance = windowBottom - rect.bottom;
      const threshold = 60;
      setIsAtBottom(distance >= -threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch (e) {}
    }
  }, [messages.length, isAtBottom]);

  const handleSend = (text) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), text, from: 'user' },
    ]);
  };

  return (
  <div className="global-chat-container" style={{ '--globalchat-input-top': '100px', '--globalchat-input-height': '72px' }}>
      <div className="header">
        <button
          className="create-profile-btn"
          onClick={() => navigate('/auth?mode=signUp')}
          aria-label="Create profile"
        >
          Create Profile
        </button>
      </div>
      {/* ChatInput fixed at top to match ChatArea (keeps input stable) - placed outside .chat-panel
          so transforms on .chat-panel don't create a containing block for fixed positioning */}
      <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 720, zIndex: 1100, '--globalchat-input-top': '100px', '--globalchat-input-height': '72px' }}>
        <ChatInput onSend={handleSend} />
      </div>

      {/* mask that hides messages as they scroll up under the fixed chat input
          sits between messages (lower z) and chat input (higher z) */}
  <div className="messages-top-mask" aria-hidden="true" />

      <div className="chat-panel chat-panel--top">
        <div ref={scrollRef} className="messages-container">
          {messages.length ? (
            messages.map((m) => (
              <div key={m.id} className={`message ${m.from}`}>
                {m.text}
              </div>
            ))
          ) : (
            <div className="no-messages"></div>
          )}
        </div>
      </div>
      {!isAtBottom && (
        <a
          href="#"
          className="scroll-down-link scroll-down-arrow"
          onClick={(e) => {
            e.preventDefault();
            try {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            } catch (err) {
              window.scrollTo(0, document.body.scrollHeight);
            }
          }}
          aria-label="Scroll to bottom"
        />
      )}
    </div>
  );
}