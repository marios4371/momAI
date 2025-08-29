import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const KEY = "momai_conversations_v1";
const KEY_ACTIVE = "momai_active_v1";

const Ctx = createContext(null);

export function ConversationsProvider({ children, resetActiveOnMount = false }) {
  // compute initial conversations once
  const initialConversations = (() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [{ id: Date.now(), title: "Conversation 1", messages: [] }];
    } catch {
      return [{ id: Date.now(), title: "Conversation 1", messages: [] }];
    }
  })();

  const [conversations, setConversations] = useState(initialConversations);

  const [activeId, setActiveId] = useState(() => {
    try {
      if (resetActiveOnMount) {
        // do not load previous active — start with null on mount after login
        return null;
      }
      const v = localStorage.getItem(KEY_ACTIVE);
      return v ? Number(v) : initialConversations[0]?.id ?? null;
    } catch {
      return initialConversations[0]?.id ?? null;
    }
  });

  // internal suppression flag (children can read this)
  const [suppressAutoSelect, setSuppressAutoSelect] = useState(Boolean(resetActiveOnMount));

  const [isBusy, setIsBusy] = useState(false);

  const location = useLocation();
  const firstMountRef = useRef(true);
  const prevPathRef = useRef(location.pathname);
  const lastCreatedRef = useRef(null); // remember id of conversation created via newConversation()

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  useEffect(() => {
    try { if (activeId) localStorage.setItem(KEY_ACTIVE, String(activeId)); else try { localStorage.removeItem(KEY_ACTIVE); } catch {} } catch {}
  }, [activeId]);

  // clear persisted active if requested (safety: already handled in initial state, but keep for robustness)
  useEffect(() => {
    if (resetActiveOnMount) {
      try { localStorage.removeItem(KEY_ACTIVE); } catch {}
      // activeId already null from initializer
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // after first render, clear the internal suppress flag so future behaviour is normal
  useEffect(() => {
    if (suppressAutoSelect) {
      const t = setTimeout(() => setSuppressAutoSelect(false), 0);
      return () => clearTimeout(t);
    }
  }, [suppressAutoSelect]);

  // Watch location changes: when navigating into "/" from another page, clear active selection
  // BUT if we just created a conversation (lastCreatedRef) and it's the current active, keep it.
  useEffect(() => {
    // skip processing on initial mount
    if (firstMountRef.current) {
      firstMountRef.current = false;
      prevPathRef.current = location.pathname;
      return;
    }

    const prev = prevPathRef.current;
    const cur = location.pathname;

    if (cur === "/" && prev !== "/") {
      // navigated into root from a different page
      if (lastCreatedRef.current && lastCreatedRef.current === activeId) {
        // this navigation likely comes from creating a new conversation and then navigate('/'),
        // keep the newly created active conversation but clear the marker.
        lastCreatedRef.current = null;
      } else {
        // clear active selection so old conversation doesn't show
        setActiveId(null);
        try { localStorage.removeItem(KEY_ACTIVE); } catch {}
      }
    }

    prevPathRef.current = cur;
  }, [location.pathname, activeId]);

  const newConversation = useCallback(() => {
    const conv = { id: Date.now(), title: `Conversation ${conversations.length + 1}`, messages: [] };
    setConversations((s) => [conv, ...s]);
    setActiveId(conv.id);
    // remember that we just created this conv so navigation to '/' immediately after won't clear it
    lastCreatedRef.current = conv.id;
    return conv;
  }, [conversations.length]);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  const removeConversation = useCallback((id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      return next;
    });
    setActiveId((curr) => (curr === id ? (conversations.find(c => c.id !== id)?.id ?? null) : curr));
  }, [conversations]);

  const addMessage = useCallback((convId, msg) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c)));
  }, []);

  const sendUserMessage = useCallback((text) => {
    if (!activeId || isBusy) return;
    const userMsg = { id: Date.now(), text, from: 'user', ts: Date.now() };
    addMessage(activeId, userMsg);
    setIsBusy(true);
    setTimeout(() => {
      const botMsg = { id: Date.now()+1, text: `parentAI replies: "${text}"`, from: 'bot', ts: Date.now() };
      addMessage(activeId, botMsg);
      setIsBusy(false);
    }, 1400);
  }, [activeId, addMessage, isBusy]);

  const resendAsUser = useCallback((convId, text) => {
    if (!convId || isBusy) return;
    const userMsg = { id: Date.now(), text, from: 'user', ts: Date.now() };
    addMessage(convId, userMsg);
    setIsBusy(true);
    setTimeout(() => {
      const botMsg = { id: Date.now()+1, text: `parentAI reply to: "${text}"`, from: 'bot', ts: Date.now() };
      addMessage(convId, botMsg);
      setIsBusy(false);
    }, 1400);
  }, [addMessage, isBusy]);

  return (
    <Ctx.Provider value={{
      conversations,
      activeId,
      isBusy,
      newConversation,
      selectConversation,
      addMessage,
      sendUserMessage,
      resendAsUser,
      removeConversation,
      suppressAutoSelect
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConversations must be used inside ConversationsProvider");
  return ctx;
}
