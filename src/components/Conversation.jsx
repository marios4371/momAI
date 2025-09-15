import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const KEY = "momai_conversations_v1";
const KEY_ACTIVE = "momai_active_v1";
const USER_KEY = "momai_user_id";

const Ctx = createContext(null);

export function ConversationsProvider({ children, resetActiveOnMount = false }) {
  // compute initial conversations once (local fallback)
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
      if (resetActiveOnMount) return null;
      const v = localStorage.getItem(KEY_ACTIVE);
      return v ? Number(v) : initialConversations[0]?.id ?? null;
    } catch {
      return initialConversations[0]?.id ?? null;
    }
  });

  const [suppressAutoSelect, setSuppressAutoSelect] = useState(Boolean(resetActiveOnMount));
  const [isBusy, setIsBusy] = useState(false);

  const location = useLocation();
  const firstMountRef = useRef(true);
  const prevPathRef = useRef(location.pathname);
  const lastCreatedRef = useRef(null);

  // Persist local copy (for offline UX)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  useEffect(() => {
    try {
      if (activeId) localStorage.setItem(KEY_ACTIVE, String(activeId));
      else try { localStorage.removeItem(KEY_ACTIVE); } catch {}
    } catch {}
  }, [activeId]);

  useEffect(() => {
    if (resetActiveOnMount) {
      try { localStorage.removeItem(KEY_ACTIVE); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (suppressAutoSelect) {
      const t = setTimeout(() => setSuppressAutoSelect(false), 0);
      return () => clearTimeout(t);
    }
  }, [suppressAutoSelect]);

  useEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false;
      prevPathRef.current = location.pathname;
      return;
    }
    const prev = prevPathRef.current;
    const cur = location.pathname;
    if (cur === "/" && prev !== "/") {
      if (lastCreatedRef.current && lastCreatedRef.current === activeId) {
        lastCreatedRef.current = null;
      } else {
        setActiveId(null);
        try { localStorage.removeItem(KEY_ACTIVE); } catch {}
      }
    }
    prevPathRef.current = cur;
  }, [location.pathname, activeId]);

  // --- helper: read user id from localStorage ---
  const getUserIdHeader = useCallback(() => {
    // make sure your login flow stores numeric id as string under USER_KEY
    const v = localStorage.getItem(USER_KEY);
    return v || null;
  }, []);

  const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  window.REACT_APP_API_BASE ||
  'http://localhost:8081';

  // --- initial load from server ---
  useEffect(() => {
    (async () => {
      const userId = getUserIdHeader();
      if (!userId) {
        // no user id yet (not logged-in) -> keep local fallback
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/conversations`, {
        headers: { "X-User-Id": userId }
        });
        if (!res.ok) {
          // keep local fallback
          return;
        }
        const list = await res.json();
        if (Array.isArray(list) && list.length) {
          // normalize shape: ensure messages array exists
          const normalized = list.map(c => ({ ...c, messages: c.messages || [] }));
          setConversations(normalized);
          // select most recent (unless resetActiveOnMount is true)
          if (!resetActiveOnMount) {
            setActiveId(normalized[0]?.id ?? null);
          } else {
            setActiveId(null);
          }
        }
      } catch (e) {
        console.warn("Failed loading conversations:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // --- helpers to update state ---
  const replaceConversationMessages = useCallback((convId, messages) => {
    setConversations(prev => prev.map(c => (c.id === convId ? { ...c, messages } : c)));
  }, []);

  const addMessage = useCallback((convId, msg) => {
    setConversations(prev => prev.map(c => (c.id === convId ? { ...c, messages: [...(c.messages || []), msg] } : c)));
  }, []);

  const updateConversationTitle = useCallback((convId, title) => {
    setConversations(prev => prev.map(c => (c.id === convId ? { ...c, title } : c)));
  }, []);

  // --- newConversation: create on server then add locally ---
  const newConversation = useCallback(async (title = null) => {
    const userId = getUserIdHeader();
    // optimistic local creation fallback if no userId
    if (!userId) {
      const conv = { id: Date.now(), title: title || `Conversation ${conversations.length + 1}`, messages: [] };
      setConversations(s => [conv, ...s]);
      setActiveId(conv.id);
      lastCreatedRef.current = conv.id;
      return conv;
    }

    try {
      const res = await fetch(`${API_BASE}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId
        },
        body: JSON.stringify({ title: title || `Conversation ${conversations.length + 1}` })
      });
      if (!res.ok) throw new Error("create conversation failed");
      const conv = await res.json();
      // ensure messages array
      const normalized = { ...conv, messages: conv.messages || [] };
      setConversations(s => [normalized, ...s]);
      setActiveId(normalized.id);
      lastCreatedRef.current = normalized.id;
      return normalized;
    } catch (e) {
      console.warn("Create conversation failed, falling back to local:", e);
      const conv = { id: Date.now(), title: title || `Conversation ${conversations.length + 1}`, messages: [] };
      setConversations(s => [conv, ...s]);
      setActiveId(conv.id);
      lastCreatedRef.current = conv.id;
      return conv;
    }
  }, [conversations.length, getUserIdHeader]);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  const removeConversation = useCallback((id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setActiveId(curr => (curr === id ? (conversations.find(c => c.id !== id)?.id ?? null) : curr));
  }, [conversations]);

  // --- sendUserMessage: POST to server, optimistic UI, add bot reply when arrives ---
  const sendUserMessage = useCallback(async (payload) => {
    if (!activeId || isBusy) return;
    const text = typeof payload === 'string' ? payload : (payload?.text ?? JSON.stringify(payload));
    const tempId = Date.now(); // local temp id
    const userMsg = { id: tempId, text, from: 'user', ts: Date.now() };
    addMessage(activeId, userMsg);
    setIsBusy(true);

    const userId = getUserIdHeader();

    // If no userId or no activeId persisted on server, you might need to create conversation first on server
    try {
      // POST message to backend (assumes backend conversation exists)
      const res = await fetch(`${API_BASE}/api/conversations/${activeId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId || ""
        },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errText = data?.error || data?.message || "Server error";
        addMessage(activeId, { id: Date.now()+1, text: `Error: ${errText}`, from: 'bot', ts: Date.now() });
      } else {
        // server may return { reply: "...", botMessage: { id, text, createdAt, ... } }
        const botText = data.reply || (data.botMessage && data.botMessage.text) || null;
        if (data.botMessage) {
          // use server-supplied bot message (has real id)
          const bm = data.botMessage;
          const botLocal = { id: bm.id, text: bm.text, from: 'bot', ts: bm.createdAt ? new Date(bm.createdAt).getTime() : Date.now() };
          addMessage(activeId, botLocal);
        } else if (botText) {
          addMessage(activeId, { id: Date.now()+1, text: botText, from: 'bot', ts: Date.now() });
        } else {
          // optionally sync full conversation messages from server
          try {
            const msgsRes = await fetch(`/api/conversations/${activeId}/messages`, {
              headers: { "X-User-Id": userId || "" }
            });
            if (msgsRes.ok) {
              const msgs = await msgsRes.json();
              // normalize to local shape (id, text, from, ts)
              const normalized = (Array.isArray(msgs) ? msgs : []).map(m => ({
                id: m.id,
                text: m.text,
                from: m.sender === 'user' ? 'user' : 'bot',
                ts: m.createdAt ? new Date(m.createdAt).getTime() : Date.now()
              }));
              replaceConversationMessages(activeId, normalized);
            }
          } catch (e) {
            // ignore sync failure
            console.warn("failed to sync messages:", e);
            addMessage(activeId, { id: Date.now()+1, text: "No reply (sync failed)", from: 'bot', ts: Date.now() });
          }
        }
      }
    } catch (err) {
      addMessage(activeId, { id: Date.now()+1, text: `Network error: ${err.message}`, from: 'bot', ts: Date.now() });
    } finally {
      setIsBusy(false);
    }
  }, [activeId, addMessage, isBusy, getUserIdHeader, replaceConversationMessages]);

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
