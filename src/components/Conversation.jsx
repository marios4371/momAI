import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const KEY = "momai_conversations_v1";
const KEY_ACTIVE = "momai_active_v1";

const Ctx = createContext(null);

export function ConversationsProvider({ children }) {
  const [conversations, setConversations] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [{ id: Date.now(), title: "Conversation 1", messages: [] }];
    } catch {
      return [{ id: Date.now(), title: "Conversation 1", messages: [] }];
    }
  });
  const [activeId, setActiveId] = useState(() => {
    try {
      return localStorage.getItem(KEY_ACTIVE) ? Number(localStorage.getItem(KEY_ACTIVE)) : conversations[0]?.id ?? null;
    } catch { return conversations[0]?.id ?? null; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  useEffect(() => {
    try { if (activeId) localStorage.setItem(KEY_ACTIVE, String(activeId)); } catch {}
  }, [activeId]);

  const newConversation = useCallback(() => {
    const conv = { id: Date.now(), title: `Conversation ${conversations.length + 1}`, messages: [] };
    setConversations((s) => [conv, ...s]);
    setActiveId(conv.id);
    return conv;
  }, [conversations.length]);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  const addMessage = useCallback((id, msg) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg] } : c)));
  }, []);

  return (
    <Ctx.Provider value={{ conversations, activeId, newConversation, selectConversation, addMessage }}>
      {children}
    </Ctx.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConversations must be used inside ConversationsProvider");
  return ctx;
}