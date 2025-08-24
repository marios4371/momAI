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
      const v = localStorage.getItem(KEY_ACTIVE);
      return v ? Number(v) : conversations[0]?.id ?? null;
    } catch {
      return conversations[0]?.id ?? null;
    }
  });

  const [isBusy, setIsBusy] = useState(false);

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

  const removeConversation = useCallback((id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      return next;
    });
    setActiveId((curr) => (curr === id ? (conversations.find(c => c.id !== id)?.id ?? null) : curr));
  }, [conversations]);

  // add a message directly
  const addMessage = useCallback((convId, msg) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c)));
  }, []);

  // user sends a message -> provider handles setting busy and creating a simulated AI reply.
  const sendUserMessage = useCallback((text) => {
    if (!activeId || isBusy) return;
    const userMsg = { id: Date.now(), text, from: 'user', ts: Date.now() };
    addMessage(activeId, userMsg);

    // set busy until AI reply finishes
    setIsBusy(true);

    // SIMULATED AI response (replace with real call)
    setTimeout(() => {
      const botMsg = { id: Date.now()+1, text: `AI reply to: "${text}"`, from: 'bot', ts: Date.now() };
      addMessage(activeId, botMsg);
      setIsBusy(false);
    }, 1400);
  }, [activeId, addMessage, isBusy]);

  // resend arbitrary message as user (used for "resend" on edited bubble)
  const resendAsUser = useCallback((convId, text) => {
    if (!convId || isBusy) return;
    const userMsg = { id: Date.now(), text, from: 'user', ts: Date.now() };
    addMessage(convId, userMsg);
    setIsBusy(true);
    setTimeout(() => {
      const botMsg = { id: Date.now()+1, text: `AI reply to: "${text}"`, from: 'bot', ts: Date.now() };
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
      removeConversation
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
