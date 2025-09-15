import { useState, useRef, useEffect } from 'react';
import { useConversations } from './Conversation';

export default function ChatInput({ onSend, initialText = '' }) {
  const { activeId } = useConversations();
  const [text, setText] = useState(initialText || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      const maxHeight = 150;
      ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
    }
    // removed undefined onTextChange reference
  }, [text]);

  useEffect(() => {
    setText(initialText || '');
    try { textareaRef.current && textareaRef.current.focus(); } catch (e) {}
  }, [activeId, initialText]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    if (typeof onSend === 'function') {
      onSend(text.trim());
    }
    setText('');
  };

  const onEnterSend = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="chat-input"
      style={{
        top: '-70px',
        left: '10%',
        width: '100%',
        maxWidth: '600px',
        borderRadius: '20px',
        background: '#333',
        overflow: 'hidden',
        padding: '8px 12px',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        position: 'relative'
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onEnterSend}
        placeholder="Become a better parent"
        style={{
          width: '100%',
          minHeight: '50px',
          maxHeight: '150px',
          resize: 'none',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: 'transparent',
          color: 'white',
          padding: '10px 16px 40px 12px',
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          lineHeight: '1.4',
          borderRadius: '8px',
          boxSizing: 'border-box'
        }}
        className="custom-scrollbar"
      />

      <button
        type="submit"
        className="send-btn"
        aria-label="Send"
        style={{
          position: 'absolute',
          right: 27,
          bottom: 10,
          width: 40,
          height: 40,
          borderRadius: 20,
          border: 'none',
          background: 'rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 19V6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M5 12l7-7 7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </button>
    </form>
  );
}
