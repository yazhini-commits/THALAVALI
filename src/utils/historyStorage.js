const STORAGE_KEY = "creator_chat_history";

/* ================= GET ALL CHATS ================= */
export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Failed to parse history:", error);
    return [];
  }
}

/* ================= CREATE CHAT IF NOT EXISTS ================= */
export function createChatIfNotExists(chatId, title) {
  const history = getHistory();

  // If chat already exists, return existing chatId
  const existing = history.find((c) => c.chatId === chatId);
  if (existing) return chatId;

  // Create new chat
  const newChatId = chatId || Date.now().toString();

  const newChat = {
  chatId: newChatId,
  title: title || "Untitled chat",
  createdAt: new Date().toISOString(),
  messages: [],
};


  history.unshift(newChat); // newest on top
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  return newChatId;
}

/* ================= SAVE MESSAGE (🔥 FIXED) ================= */
export function saveChatMessage({
  chatId,
  role,        // "user" | "assistant"
  content,
  meta = null, // 🔥 IMPORTANT: STORE USER PREFS
}) {
  /* 🚫 Ignore A/B testing generations */
if (chatId === "__AB_TEST__" || meta?.abTest) {
  return;
}

  const history = getHistory();
  const chat = history.find((c) => c.chatId === chatId);

  if (!chat) return;

  chat.messages.push({
    messageId: Date.now(),
    role,
    content,
    meta, // ✅ PERSIST META
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/* ================= UPDATE CHAT TITLE ================= */
export function updateChatTitle(chatId, title) {
  if (!title) return;

  const history = getHistory();
  const chat = history.find((c) => c.chatId === chatId);

  // Update only if still default
  if (chat && chat.title === "Untitled chat") {
    chat.title = title;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

/* ================= GET SINGLE CHAT ================= */
export function getChatById(chatId) {
  return getHistory().find((c) => c.chatId === chatId);
}

/* ================= DELETE SINGLE CHAT ================= */
export function deleteChat(chatId) {
  const updated = getHistory().filter((c) => c.chatId !== chatId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/* ================= CLEAR ALL HISTORY ================= */
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}


export function getChatPrimaryType(chat) {
  if (!chat?.messages?.length) return "General";

  const typeCount = {};

  chat.messages.forEach((m) => {
    const t = m.meta?.type;
    if (t) typeCount[t] = (typeCount[t] || 0) + 1;
  });

  const entries = Object.entries(typeCount);
  if (entries.length === 0) return "General";
  if (entries.length === 1) return entries[0][0];

  // multiple types used
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0]; // dominant type
}
/* ================= CREATE CHAT FROM AB TEST ================= */
export function createChatFromAB({
  chatId,
  title,
  userPrompt,
  assistantReply,
  type,
}) {
  const history = getHistory();

  const newChatId = chatId || Date.now().toString();

  const newChat = {
    chatId: newChatId,
    title: title || userPrompt.slice(0, 40),
    createdAt: new Date().toISOString(),
    messages: [
      {
        messageId: Date.now(),
        role: "user",
        content: userPrompt,
        meta: { type },
        createdAt: new Date().toISOString(),
      },
      {
        messageId: Date.now() + 1,
        role: "assistant",
        content: assistantReply,
        meta: { type },
        createdAt: new Date().toISOString(),
      },
    ],
  };

  history.unshift(newChat);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  return newChatId;
}
