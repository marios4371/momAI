import { useState, useRef, useEffect } from 'react';

export default function ChatInput() {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      const maxHeight = 150;
      ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
    }
  }, [text]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        border: '1px solid gray',
        borderRadius: '20px',
        background: '#333',
        overflow: 'hidden',
        padding: '2px',
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Become a better mom"
        style={{
          width: '100%',
          minHeight: '50px',
          maxHeight: '150px',
          resize: 'none',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#333',
          color: 'white',
          padding: '10px 16px 10px 12px',
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          lineHeight: '1.4',
          borderRadius: '18px',
          boxSizing: 'border-box',
        }}
        className="custom-scrollbar"
      />
    </div>
  );
}
