import { useState, useEffect } from "react";
import { getHistory } from "../../utils/historyStorage";
import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";

export default function EditorSidebar({ onOpenMessage, onToggle }) {
  const [open, setOpen] = useState(true);
  const history = getHistory();
  const [copiedId, setCopiedId] = useState(null);

  // notify workspace
  useEffect(() => {
    onToggle(open);
  }, [open]);

  return (
    <div
      className={`fixed top-0 left-0 h-full z-30 transition-all duration-300 ease-in-out
      backdrop-blur-2xl border-r border-white/10
      ${open ? "w-72" : "w-12"}
      bg-black/50`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          absolute -right-3 top-12
          bg-purple-600 w-7 h-7 rounded-full
          flex items-center justify-center
          shadow-lg hover:scale-110 transition
        "
      >
        {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Collapsed Icon */}
      {!open && (
        <div className="h-full flex items-start justify-center pt-20">
          <span className="rotate-90 text-xs opacity-60 tracking-widest">
            HISTORY
          </span>
        </div>
      )}

      {/* OPEN MODE */}
      {open && (
        <div className="p-4 overflow-y-auto h-full space-y-4">
          <h2 className="text-sm font-semibold opacity-70 mb-2">
            Chat Sessions
          </h2>

          {history.map(chat => (
            <div key={chat.chatId} className="space-y-3">

              <div className="text-xs opacity-60 font-semibold tracking-wide">
                {chat.title || "Untitled Chat"}
              </div>

              {chat.messages
                .filter(m => m.role === "assistant" && m.content)
                .map(msg => (
                  <div
                    key={msg.messageId}
                    className="
                      p-3 rounded-xl
                      bg-white/5 hover:bg-purple-600/20
                      border border-white/5
                      cursor-pointer group
                      transition-all duration-200
                    "
                    onClick={() =>
                      onOpenMessage(chat.chatId, msg.messageId, msg.content)
                    }
                  >
                    <p className="text-xs line-clamp-3 opacity-90">
                      {msg.content.replace(/<[^>]+>/g, "").slice(0, 120)}
                    </p>

                    {/* COPY BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          msg.content.replace(/<[^>]+>/g, "")
                        );
                        setCopiedId(msg.messageId);
                        setTimeout(() => setCopiedId(null), 1200);
                      }}
                      className="
                        mt-3 text-xs flex gap-2 items-center
                        opacity-0 group-hover:opacity-100
                        transition
                      "
                    >
                      {copiedId === msg.messageId ? (
                        <>
                          <Check size={13} className="text-green-400 animate-bounce" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13}/>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
