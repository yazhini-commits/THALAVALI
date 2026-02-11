import { X, Search } from "lucide-react";
import { getHistory } from "../../utils/historyStorage";

export default function SearchChatsOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  const history = getHistory();

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24">
      <div className="w-full max-w-xl bg-white dark:bg-[#0f0f12] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/10 dark:border-white/10">
          <Search size={18} className="text-purple-600" />
          <input
            autoFocus
            placeholder="Search chats..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-purple-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-5">
          
          {/* TODAY */}
          <Section title="Today">
            {history.slice(0, 3).map((item) => (
              <ChatItem key={item.id} item={item} />
            ))}
          </Section>

          {/* PREVIOUS */}
          <Section title="Previous 7 Days">
            {history.slice(3).map((item) => (
              <ChatItem key={item.id} item={item} />
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- HELPERS ---------- */

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ChatItem({ item }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-600/10 cursor-pointer transition">
      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
        ✨
      </div>
      <div className="text-sm truncate">
        {item.topic || "Untitled Chat"}
      </div>
    </div>
  );
}
