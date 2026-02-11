import {
  Search,
  Image,
  Plus,
  LogOut,
  User,
  Clock,
  Download,
  X,
  LayoutDashboard, // ✅ ADDED (1)
  Trash2, // ✅ ADDED (HISTORY DELETE ICON)
  Pencil
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../../utils/historyStorage";
import { exportCSV,  exportSingleChatPDF,exportSingleChatCSV, exportPDF } from "../../utils/exportHistory";
import KeyHint from "../ui/KeyHint";
export default function Sidebar({ isOpen, onSelectChat }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const exportRef = useRef(null);
  const searchRef = useRef(null); // ✅ ADDED
  const navigate = useNavigate();
const [history, setHistory] = useState(getHistory());
  const [deletingId, setDeletingId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
const [renameValue, setRenameValue] = useState("");
const renameInputRef = useRef(null);

useEffect(() => {
  if (renamingId && renameInputRef.current) {
    renameInputRef.current.focus();
    renameInputRef.current.select();
  }
}, [renamingId]);


/* ================= CTRL + D → EXPORT CSV ================= */
useEffect(() => {
  const handler = (e) => {
    const key = e.key.toLowerCase();

    // Ctrl + D (Windows/Linux) or Cmd + D (Mac)
    if ((e.ctrlKey || e.metaKey) && key === "d") {
      // ❌ prevent browser bookmark
      e.preventDefault();

      // ❌ don’t trigger while typing
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      exportCSV();
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);

  /* ================= CLOSE EXPORT ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  useEffect(() => {
  setHistory(getHistory());
}, [localStorage.getItem("creator_chat_history")]);

  /* ================= SEARCH OVERLAY OUTSIDE CLICK ================= */
const handleSearchOverlayClick = (e) => {
  if (searchRef.current && !searchRef.current.contains(e.target)) {
    setShowSearchPanel(false); // ✅ just close overlay
  }
};


  /* ================= SEARCH FILTER LOGIC ================= */
  const filteredHistory = useMemo(() => {
    return history.filter((chat) => {
      const textMatch =
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages?.some((m) =>
          m.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const typeMatch =
  typeFilter === "All" ||
  chat.messages?.some((m) => m.meta?.type === typeFilter);


      const created = new Date(chat.createdAt);
      const now = new Date();
      let dateMatch = true;

      if (dateFilter === "Today")
        dateMatch = created.toDateString() === now.toDateString();
      if (dateFilter === "7 Days")
        dateMatch = (now - created) / 86400000 <= 7;
      if (dateFilter === "30 Days")
        dateMatch = (now - created) / 86400000 <= 30;

      return textMatch && typeMatch && dateMatch;
    });
  }, [history, searchQuery, typeFilter, dateFilter]);

const deleteSingleChat = (chatId) => {
  setDeletingId(chatId); // trigger animation

  setTimeout(() => {
    const updatedHistory = history.filter(
      (chat) => chat.chatId !== chatId
    );

    localStorage.setItem(
      "creator_chat_history",
      JSON.stringify(updatedHistory)
    );

    setHistory(updatedHistory);
    onSelectChat(null);
    setDeletingId(null);
  }, 300); // animation duration
};
const saveRename = (chatId) => {
  if (!renameValue.trim()) {
    setRenamingId(null);
    return;
  }

  const updated = history.map(chat =>
    chat.chatId === chatId
      ? { ...chat, title: renameValue.trim() }
      : chat
  );

  localStorage.setItem("creator_chat_history", JSON.stringify(updated));
  setHistory(updated);
  setRenamingId(null);
};

const [isDark, setIsDark] = useState(
  document.documentElement.classList.contains("dark")
);

useEffect(() => {
  const observer = new MutationObserver(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}, []);


  return (
    <>
      {/* ================= SIDEBAR ================= */}
      <aside
  className={`relative h-screen shrink-0 flex flex-col
  bg-white dark:bg-[#0b0c10]
  border-r border-gray-200 dark:border-white/10
  transition-all duration-300 ease-in-out
  ${isOpen ? "w-72" : "w-20"}`}
>
        <div className="flex flex-col flex-1 min-h-0">
          {/* HEADER */}
          <div className="px-4 pt-3 ">
  {/* ===== BRAND HEADER ===== */}
{/* ===== BRAND HEADER ===== */}
<div className="px-4 pt-3 flex items-center gap-3">
  <div className="flex items-center gap-3">
    {/* LOGO (NO BG, NO HOVER, NO ANIMATION) */}
    <img
      src={
        isOpen
          ? isDark
            ? "/infosys-dark.png"
            : "/infosys-light.png"
          : "/Infosys.png"
      }
      alt="Creator AI Logo"
      className={`
        block object-contain
        ${isOpen ? "h-9 w-auto" : "h-10 w-10"}
      `}
      draggable={false}
    />

    {/* BRAND NAME (OPEN SIDEBAR ONLY) */}
    {isOpen && (
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">
        Info Creator
      </h1>
    )}
  </div>
</div>




            <button
  onClick={() => {
    onSelectChat(null);
  }}
              className="mt-4 w-full flex items-center justify-center gap-2
              bg-purple-600 text-white py-2.5 rounded-xl
              hover:bg-purple-700 transition"
            >
              <Plus size={18} />
              {isOpen && (
  <span className="flex items-center">
    New Chat <KeyHint keys={["Ctrl","N"]}/>
  </span>
)}

            </button>

            <div className={`mt-6 space-y-2 ${!isOpen && "flex flex-col items-center"}`}>
              <SidebarItem
                icon={Search}
                label={
  <>
    Search Chats <KeyHint keys={["Ctrl","F"]}/>
  </>
}

                isOpen={isOpen}
                onClick={() => setShowSearchPanel(true)}
              />
              <SidebarItem icon={Image} label="Images" isOpen={isOpen} />

              {/* ✅ DASHBOARD ADDED (2) */}
              <SidebarItem
                icon={LayoutDashboard}
                label={
  <>
    Dashboard <KeyHint keys={["Ctrl","H"]}/>
  </>
}
                isOpen={isOpen}
                onClick={() => navigate("/dashboard")}
              />
            </div>
          </div>

          {/* HISTORY */}
          {isOpen && (
  <div className="flex-1 px-4 mt-3 min-h-0 flex flex-col overflow-hidden">
    {/* HEADER */}
    <div className="flex items-center justify-between mb-2 shrink-0">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase opacity-60">
        <Clock size={14} /> Content History
      </div>

      <div ref={exportRef} className="relative group">
        <button
          onClick={() => setShowExportMenu((v) => !v)}
          className="p-2 rounded-md text-purple-600 hover:bg-purple-600/10 transition"
        >
          <Download size={16} />
        </button>

        {showExportMenu && (
          <div className="absolute right-0 mt-2 w-28
            bg-white dark:bg-[#111]
            border border-gray-200 dark:border-white/10
            rounded-md shadow-xl z-[1100]">
            <ExportRow label="CSV" onClick={exportCSV} />
            <ExportRow label="PDF" onClick={exportPDF} />
          </div>
        )}
      </div>
    </div>

    {/* ✅ SCROLLABLE LIST */}
    <div className="flex-1 overflow-y-auto pr-1 space-y-2 overscroll-contain">
      {history.map((chat) => (
       <div
  key={chat.chatId}
  onClick={() => onSelectChat(chat.chatId)}   // ✅ MOVE CLICK HERE
  className={`
    group px-3 py-2 rounded-md text-sm
    flex items-center justify-between
    transition-all duration-200 ease-out
    cursor-pointer
    hover:bg-purple-600/10
    hover:translate-x-1
    ${
      deletingId === chat.chatId
        ? "opacity-0 scale-95 -translate-x-4"
        : "opacity-100 scale-100"
    }
  animate-[fadeIn_0.3s_ease-out]
`}
>

          <div className="flex-1 truncate">

  {renamingId === chat.chatId ? (
    <input
      ref={renameInputRef}
      value={renameValue}
      onChange={(e) => setRenameValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") saveRename(chat.chatId);
        if (e.key === "Escape") setRenamingId(null);
      }}
      onBlur={() => saveRename(chat.chatId)}
      className="w-full bg-transparent border-b border-purple-500
      outline-none text-sm font-medium"
    />
  ) : (
    <span className="truncate font-medium">
      {chat.title || "Untitled chat"}
    </span>
  )}

</div>


          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">

  {/* RENAME */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      setRenamingId(chat.chatId);
      setRenameValue(chat.title || "");
    }}
    className="p-1 rounded-md text-blue-500 hover:bg-blue-500/20"
  >
    <Pencil size={14} />
  </button>

  {/* DOWNLOAD */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      exportSingleChatPDF(chat);
    }}
    className="p-1 rounded-md text-purple-600 hover:bg-purple-600/20"
  >
    <Download size={14} />
  </button>

  {/* DELETE */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      deleteSingleChat(chat.chatId);
    }}
    className="p-1 rounded-md text-red-500 hover:bg-red-500/20"
  >
    <Trash2 size={14} />
  </button>

</div>

        </div>
      ))}
    </div>
  </div>
)}

        </div>

        {/* PROFILE */}
        <div
          className={`relative px-4 py-4 ${!isOpen ? "mt-auto flex justify-center" : ""}`}
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className={`flex items-center ${isOpen ? "gap-3" : "justify-center"}`}>
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
              S
            </div>

            {isOpen && (
              <div>
                <p className="text-sm font-medium">Siddharth</p>
                <p className="text-xs opacity-60">siddharthb7009@gmail.com</p>
              </div>
            )}
          </div>

          {showMenu && isOpen && (
            <div className="absolute bottom-14 left-4 right-4
              bg-white dark:bg-[#111]
              border rounded-xl shadow-xl">
              <DropdownItem icon={User} label="Profile" onClick={() => navigate("/profile")} />

              {/* ✅ DASHBOARD ADDED (3) */}
              <DropdownItem
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => navigate("/dashboard")}
              />

              <DropdownItem
  icon={LogOut}
  label="Sign Out"
  danger
  onClick={() => {
    localStorage.removeItem("isLoggedIn");
    navigate("/"); // ✅ Intro page
  }}
/>

            </div>
          )}
        </div>
      </aside>

      {/* ================= SEARCH OVERLAY ================= */}
      {showSearchPanel && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm"
          onClick={handleSearchOverlayClick}
        >
          <div
            ref={searchRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 top-24 -translate-x-1/2
            w-[480px] bg-white dark:bg-[#0b0c10]
            rounded-2xl border shadow-2xl"
          >
            {/* SEARCH INPUT */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Search size={16} className="text-purple-600" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button onClick={() => setShowSearchPanel(false)}>
                <X size={18} />
              </button>
            </div>

            {/* FILTERS */}
            <div className="px-4 py-3 space-y-3 border-b">
              <FilterRow
                options={["All", "Tweet", "Email Draft", "LinkedIn Post", "Ad Copy", "Blog Intro"]}
                value={typeFilter}
                onChange={setTypeFilter}
              />
              <FilterRow
                options={["All", "Today", "7 Days", "30 Days"]}
                value={dateFilter}
                onChange={setDateFilter}
              />
            </div>

            {/* RESULTS */}
            <div className="max-h-[45vh] overflow-y-auto p-4 space-y-2">
              {filteredHistory.length === 0 && (
                <p className="text-sm opacity-60 text-center py-6">
                  No results found
                </p>
              )}

              {filteredHistory.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() => {
                    onSelectChat(chat.chatId);
                    setShowSearchPanel(false);
                  }}
                  className="p-3 rounded-xl cursor-pointer
                  bg-gray-100 dark:bg-zinc-900
                  transition hover:bg-purple-600/10"
                >
                  <div className="font-medium text-sm">{chat.title}</div>
                  <div className="text-xs opacity-60 flex justify-between">
                    <span>{chat.type}</span>
                    <span>{new Date(chat.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= HELPERS ================= */

function SidebarItem({ icon: Icon, label, isOpen, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg transition hover:bg-purple-600/10
      ${isOpen ? "flex items-center gap-3 px-3 py-2" : "w-10 h-10 flex items-center justify-center"}`}
    >
      <Icon size={18} />
      {isOpen && <span className="text-sm">{label}</span>}
    </div>
  );
}

function DropdownItem({ icon: Icon, label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm
      ${danger ? "text-red-500 hover:bg-red-500/10" : "hover:bg-purple-600/10"}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function ExportRow({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 text-sm text-left hover:bg-purple-600/10 transition"
    >
      {label}
    </button>
  );
}

function FilterRow({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 rounded-full text-xs transition
          ${value === opt
            ? "bg-purple-600 text-white"
            : "bg-black/5 dark:bg-white/10 hover:bg-purple-600/20"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
