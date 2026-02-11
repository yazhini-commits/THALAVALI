import { MessageSquare } from "lucide-react";

export default function HistoryItem({
  chat,
  onClick,
  compact = false,
}) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer
        rounded-lg
        px-3 py-2
        bg-gray-100 dark:bg-zinc-900
        hover:bg-purple-600/10
        transition
        flex gap-2
      "
    >
      <MessageSquare
        size={16}
        className="mt-0.5 text-purple-600 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {chat.title || "Untitled chat"}
        </p>

        {!compact && (
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(chat.createdAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
