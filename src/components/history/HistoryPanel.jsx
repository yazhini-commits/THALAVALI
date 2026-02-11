import { useEffect, useState } from "react";
import { getHistory } from "../../utils/historyStorage";
import HistoryItem from "./HistoryItem";

export default function HistoryPanel({
  onSelectChat,
  compact = false,
}) {
  const [history, setHistory] = useState([]);

  /* 🔥 LOAD + AUTO REFRESH */
  useEffect(() => {
    const load = () => setHistory(getHistory());
    load();

    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  return (
    <div
      className={`
        flex flex-col h-full
        ${compact ? "" : "bg-white dark:bg-black/80 border"}
        border-black/10 dark:border-white/10
        rounded-xl
      `}
    >
      {!compact && (
        <div className="px-4 py-3 border-b border-black/10 dark:border-white/10">
          <h2 className="text-lg font-semibold">Chat History</h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {history.length === 0 && (
          <p className="text-xs text-gray-500 text-center mt-4">
            No chats yet
          </p>
        )}

        {history.map(chat => (
          <HistoryItem
            key={chat.chatId}
            chat={chat}
            compact={compact}
            onClick={() => onSelectChat(chat.chatId)}
          />
        ))}
      </div>
    </div>
  );
}
