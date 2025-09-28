import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const KEY = "momai_conversations_v1";
const KEY_ACTIVE = "momai_active_v1";
const USER_KEY = "momai_user_id";

const Ctx = createContext(null);

export function ConversationsProvider({ children, resetActiveOnMount = false, userIdProp = null }) {
  const location = useLocation();
  const firstMountRef = useRef(true);
  const prevPathRef = useRef(location.pathname);
  const lastCreatedRef = useRef(null);

  const [userId, setUserId] = useState(() => {
    return userIdProp ?? (localStorage.getItem(USER_KEY) || null);
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [{ id: Date.now(), title: "Conversation 1", messages: [] }];
    } catch {
      return [{ id: Date.now(), title: "Conversation 1", messages: [] }];
    }
  });

  const [activeId, setActiveId] = useState(null);
  const [suppressAutoSelect, setSuppressAutoSelect] = useState(Boolean(resetActiveOnMount));
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (userIdProp && userIdProp !== userId) {
      setUserId(userIdProp);
      try { localStorage.setItem(USER_KEY, String(userIdProp)); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdProp]);

  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === USER_KEY) {
        const newVal = e.newValue || null;
        setUserId(newVal);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(conversations)); } catch {}
  }, [conversations]);

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
      if (location.pathname === "/") {
        setActiveId(null);
        try { localStorage.removeItem(KEY_ACTIVE); } catch {}
        setSuppressAutoSelect(true);
        setTimeout(() => setSuppressAutoSelect(false), 0);
      }
      return;
    }
    const prev = prevPathRef.current;
    const cur = location.pathname;
    if (cur === "/" && prev !== "/") {
      setActiveId(null);
      try { localStorage.removeItem(KEY_ACTIVE); } catch {}
    }
    prevPathRef.current = cur;
  }, [location.pathname, activeId]);

  // Χρησιμοποιούμε ρητά το CHAT API BASE (8081)
  const CHAT_API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CHAT_API_BASE) ||
    'http://localhost:8081';

  console.log('[Conversation] CHAT_API_BASE =', CHAT_API_BASE);

  const getUserIdHeader = useCallback(() => {
    return userId ?? (localStorage.getItem(USER_KEY) || null);
  }, [userId]);

  // Φέρνουμε conversations όταν υπάρχει userId
  useEffect(() => {
    (async () => {
      const uid = getUserIdHeader();
      console.log('[Conversation] current userId =', uid);
      if (!uid) {
        return;
      }

      try {
        localStorage.removeItem(KEY);
        setConversations([]);
      } catch {}

      try {
        const res = await fetch(`${CHAT_API_BASE}/api/conversations`, {
          headers: { "X-User-Id": String(uid) }
        });
        if (!res.ok) {
          console.warn('GET /api/conversations failed', res.status);
          return;
        }
        const list = await res.json();
        if (Array.isArray(list)) {
          const normalized = list.map(c => ({ ...c, messages: c.messages || [] }));
          setConversations(normalized);
        }
      } catch (e) {
        console.warn("Failed loading conversations:", e);
      }
    })();
  }, [getUserIdHeader, CHAT_API_BASE, resetActiveOnMount, location.pathname]);

  const replaceConversationMessages = useCallback((convId, messages) => {
    setConversations(prev => prev.map(c => (c.id === convId ? { ...c, messages } : c)));
  }, []);

  const addMessage = useCallback((convId, msg) => {
    setConversations(prev => prev.map(c => (c.id === convId ? { ...c, messages: [...(c.messages || []), msg] } : c)));
  }, []);

  const updateConversationTitle = useCallback((convId, title) => {
    setConversations(prev => prev.map(c => (c.id === convId ? { ...c, title } : c)));
  }, []);

  const newConversation = useCallback(async (title = null) => {
    const uid = getUserIdHeader();

    if (!uid) {
      // Αν δεν υπάρχει user id, μην προσπαθήσεις backend — δείξε καθαρό μήνυμα στον χρήστη
      const conv = { id: Date.now(), title: title || `Conversation ${conversations.length + 1}`, messages: [] };
      setConversations(s => [conv, ...s]);
      setActiveId(conv.id);
      lastCreatedRef.current = conv.id;
      // Ενημερωτικό μήνυμα
      const warn = { id: Date.now()+1, text: "Δεν είσαι συνδεδεμένος. Κάνε login για να στείλεις στο μοντέλο.", from: 'bot', ts: Date.now() };
      setTimeout(() => addMessage(conv.id, warn), 0);
      return conv;
    }

    try {
      const res = await fetch(`${CHAT_API_BASE}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(uid)
        },
        body: JSON.stringify({ title: title || `Conversation ${conversations.length + 1}` })
      });
      if (!res.ok) throw new Error("create conversation failed");
      const conv = await res.json();
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
  }, [conversations.length, getUserIdHeader, CHAT_API_BASE, addMessage]);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  const clearActive = useCallback(() => {
    setActiveId(null);
    setSuppressAutoSelect(true);
    setTimeout(() => setSuppressAutoSelect(false), 0);
  }, []);

  const removeConversation = useCallback((id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setActiveId(curr => (curr === id ? (conversations.find(c => c.id !== id)?.id ?? null) : curr));
  }, [conversations]);

  const sendUserMessage = useCallback(async (payload) => {
    if (isBusy) return;

    let convId = activeId;
    if (!convId) {
      try {
        const created = await newConversation();
        convId = created?.id || null;
      } catch {
        convId = null;
      }
      if (!convId) return;
    }

    const text = typeof payload === 'string' ? payload : (payload?.text ?? JSON.stringify(payload));
    const tempId = Date.now();
    const userMsg = { id: tempId, text, from: 'user', ts: Date.now() };
    addMessage(convId, userMsg);
    setIsBusy(true);

    const uid = getUserIdHeader();

    // Αν δεν έχουμε userId, μην χτυπήσεις backend — καθαρό μήνυμα
    if (!uid) {
      addMessage(convId, { id: Date.now()+1, text: "Δεν είσαι συνδεδεμένος. Κάνε login για να λάβεις απάντηση.", from: 'bot', ts: Date.now() });
      setIsBusy(false);
      return;
    }

    try {
      console.log('[Conversation] POST', `${CHAT_API_BASE}/api/conversations/${convId}/messages`, 'X-User-Id=', uid);
      const res = await fetch(`${CHAT_API_BASE}/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(uid)
        },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errText = data?.error || data?.message || "Server error";
        addMessage(convId, { id: Date.now()+1, text: `Error: ${errText}`, from: 'bot', ts: Date.now() });
      } else {
        const botText = data.reply || (data.botMessage && data.botMessage.text) || null;
        if (data.botMessage) {
          const bm = data.botMessage;
          const botLocal = { id: bm.id, text: bm.text, from: 'bot', ts: bm.createdAt ? new Date(bm.createdAt).getTime() : Date.now() };
          addMessage(convId, botLocal);
        } else if (botText) {
          addMessage(convId, { id: Date.now()+1, text: botText, from: 'bot', ts: Date.now() });
        } else {
          try {
            const msgsRes = await fetch(`${CHAT_API_BASE}/api/conversations/${convId}/messages`, {
              headers: { "X-User-Id": String(uid) }
            });
            if (msgsRes.ok) {
              const msgs = await msgsRes.json();
              const normalized = (Array.isArray(msgs) ? msgs : []).map(m => ({
                id: m.id,
                text: m.text,
                from: m.sender === 'user' ? 'user' : 'bot',
                ts: m.createdAt ? new Date(m.createdAt).getTime() : Date.now()
              }));
              replaceConversationMessages(convId, normalized);
            }
          } catch (e) {
            console.warn("failed to sync messages:", e);
            addMessage(convId, { id: Date.now()+1, text: "No reply (sync failed)", from: 'bot', ts: Date.now() });
          }
        }
      }
    } catch (err) {
      addMessage(convId, { id: Date.now()+1, text: `Network error: ${err.message}`, from: 'bot', ts: Date.now() });
    } finally {
      setIsBusy(false);
    }
  }, [activeId, addMessage, isBusy, getUserIdHeader, replaceConversationMessages, CHAT_API_BASE, newConversation]);

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
      clearActive,
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