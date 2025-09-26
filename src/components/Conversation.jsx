import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const KEY = "momai_conversations_v1";
const KEY_ACTIVE = "momai_active_v1";
const USER_KEY = "momai_user_id";

const Ctx = createContext(null);

/**
 * Προστέθηκε προαιρετικό prop `userIdProp` που επιτρέπει στο parent να περάσει
 * το userId κατευθείαν (προτιμητέα λύση), αλλιώς ο provider παρακολουθεί το localStorage.
 */
export function ConversationsProvider({ children, resetActiveOnMount = false, userIdProp = null }) {
  const location = useLocation();
  const firstMountRef = useRef(true);
  const prevPathRef = useRef(location.pathname);
  const lastCreatedRef = useRef(null);

  // manage userId state: προτιμάμε prop αν δίνεται, αλλιώς διαβάζουμε localStorage
  const [userId, setUserId] = useState(() => {
    return userIdProp ?? (localStorage.getItem(USER_KEY) || null);
  });

  // keep local conversations in state
  const [conversations, setConversations] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [{ id: Date.now(), title: "Conversation 1", messages: [] }];
    } catch {
      return [{ id: Date.now(), title: "Conversation 1", messages: [] }];
    }
  });

  // Always start with no active conversation; user explicitly selects or we create on send
  const [activeId, setActiveId] = useState(null);

  const [suppressAutoSelect, setSuppressAutoSelect] = useState(Boolean(resetActiveOnMount));
  const [isBusy, setIsBusy] = useState(false);

  // Keep userId in sync if parent prop changes
  useEffect(() => {
    if (userIdProp && userIdProp !== userId) {
      setUserId(userIdProp);
      // persist to localStorage so other code can read it
      try { localStorage.setItem(USER_KEY, String(userIdProp)); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdProp]);

  // Listen to storage events (login might happen in same tab setting localStorage,
  // or in another tab). This updates provider when USER_KEY changes.
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      // modern browsers: e.key string or null for clear()
      if (e.key === USER_KEY) {
        const newVal = e.newValue || null;
        setUserId(newVal);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Persist local copy (for offline UX) — we store conversations in KEY
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  // Do not persist activeId anymore to always land on blank state

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
      // Ensure blank chat when landing directly on '/'
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
      // Always blank when entering '/'
      setActiveId(null);
      try { localStorage.removeItem(KEY_ACTIVE); } catch {}
    }
    prevPathRef.current = cur;
  }, [location.pathname, activeId]);

  const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
    window.REACT_APP_API_BASE ||
    'http://localhost:8081';

  // helper to read latest user id from localStorage (fallback)
  const getUserIdHeader = useCallback(() => {
    return userId ?? (localStorage.getItem(USER_KEY) || null);
  }, [userId]);

  // --- IMPORTANT: fetch conversations whenever userId becomes available or changes ---
  useEffect(() => {
    (async () => {
      const uid = getUserIdHeader();
      if (!uid) {
        // no user logged in: keep local conversations as fallback, do not wipe them
        return;
      }

      // if user changed, wipe cached conversations (avoid showing other user's convos)
      try {
        const stored = JSON.parse(localStorage.getItem(KEY) || "null");
        // if local cache exists but it's from a different user, clear it
        // We don't store per-user key by default, so safest is to clear when user logs-in
        // to ensure we only show server data for the logged-in user.
        localStorage.removeItem(KEY);
        setConversations([]); // clear while loading
      } catch (e) {
        // ignore
      }

      try {
        const res = await fetch(`${API_BASE}/api/conversations`, {
          headers: { "X-User-Id": String(uid) }
        });
        if (!res.ok) {
          // keep empty or fallback
          return;
        }
        const list = await res.json();
        if (Array.isArray(list)) {
          const normalized = list.map(c => ({ ...c, messages: c.messages || [] }));
          setConversations(normalized);
          // Do not auto-select here; selection/clearing is handled by location effects
          // and user actions (ParentAI, New Advice, sendUserMessage auto-creates).
        }
      } catch (e) {
        console.warn("Failed loading conversations:", e);
      }
    })();
    // run whenever userId changes (i.e. login/logout)
  }, [getUserIdHeader, API_BASE, resetActiveOnMount, location.pathname]);

  // --- helpers to update state (unchanged) ---
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
  }, [conversations.length, getUserIdHeader, API_BASE]);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  // Clear selection and temporarily suppress auto-select to ensure blank state
  const clearActive = useCallback(() => {
    setActiveId(null);
    setSuppressAutoSelect(true);
    // release suppression on next tick (same behavior as initial suppression)
    setTimeout(() => setSuppressAutoSelect(false), 0);
  }, []);

  const removeConversation = useCallback((id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setActiveId(curr => (curr === id ? (conversations.find(c => c.id !== id)?.id ?? null) : curr));
  }, [conversations]);

  const sendUserMessage = useCallback(async (payload) => {
    if (isBusy) return;

    // Ensure there is an active conversation; if not, create one like "+ New Advice".
    let convId = activeId;
    if (!convId) {
      try {
        const created = await newConversation();
        convId = created?.id || null;
      } catch {
        convId = null;
      }
      if (!convId) return; // couldn't create conversation
    }

    const text = typeof payload === 'string' ? payload : (payload?.text ?? JSON.stringify(payload));
    const tempId = Date.now();
    const userMsg = { id: tempId, text, from: 'user', ts: Date.now() };
    addMessage(convId, userMsg);
    setIsBusy(true);

    const uid = getUserIdHeader();

    try {
      const res = await fetch(`${API_BASE}/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": uid || ""
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
            const msgsRes = await fetch(`${API_BASE}/api/conversations/${convId}/messages`, {
              headers: { "X-User-Id": uid || "" }
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
  }, [activeId, addMessage, isBusy, getUserIdHeader, replaceConversationMessages, API_BASE, newConversation]);

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