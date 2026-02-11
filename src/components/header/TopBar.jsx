import { useContext, useState, useRef, useEffect } from "react";
import { Sun, Moon, Pencil, ChevronDown, Flame, Wand2 } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { getHistory } from "../../utils/historyStorage";
import { useNavigate } from "react-router-dom";
import { PromptContext } from "../../context/PromptContext";

export default function TopBar({ activeChatId, selectedType }) {
  const { dark, setDark, advancedMode, setAdvancedMode } = useContext(ThemeContext);
  const { promptPanelOpen, setPromptPanelOpen } = useContext(PromptContext);
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  /* ================= LOAD CHATS ================= */
  useEffect(() => {
  if (!open) return;

  const history = getHistory();
  const currentChat = history.find(c => c.chatId === activeChatId);

  if (!currentChat) {
    setChats([]);
    return;
  }

  const generatedMessages = currentChat.messages
    .filter(m => m.role === "assistant" && m.content && m.content.trim() !== "")
    .map((m, index) => ({
      id: m.messageId || index,
      content: m.content
    }));

  setChats(generatedMessages);

}, [activeChatId, open]);



  /* ================= CLICK OUTSIDE CLOSE ================= */
  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="fixed top-6 right-8 z-50 flex items-center gap-3">
      {/* ================= PROMPT PANEL (ADVANCED ONLY) ================= */}
{advancedMode && selectedType && (
  <motion.button
  onClick={() => setPromptPanelOpen(prev => !prev)}
    whileTap={{ scale: 0.9 }}
    whileHover={{ scale: 1.08 }}
    className={`
  relative overflow-hidden
  flex items-center gap-2
  px-4 py-2 rounded-full
  text-sm font-medium
  backdrop-blur-xl
  border
  transition-all duration-300

  ${promptPanelOpen
    ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white border-purple-400 shadow-[0_0_25px_rgba(139,92,246,.55)]"
    : "bg-white/70 dark:bg-black/60 border-white/20 text-gray-800 dark:text-purple-300 hover:border-purple-400/40 hover:shadow-purple-500/30"}
`}

  >
    <motion.span
  animate={
    promptPanelOpen
      ? { rotate: [0, -15, 10, -8, 6, 0] }
      : { rotate: 0 }
  }
  transition={{
    duration: 0.8,
    repeat: promptPanelOpen ? Infinity : 0,
    ease: "easeInOut",
  }}
  className="flex items-center"
>
  <Wand2 size={16} />
</motion.span>

    Prompt Panel
  </motion.button>
)}

      {/* ================= EDIT BUTTON ================= */}
      <div className="relative" ref={dropdownRef}>

        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setOpen(!open)}
          className="group
  relative overflow-hidden
  flex items-center gap-2
  px-4 py-2 rounded-full
  text-sm font-medium

  bg-white/70 dark:bg-black/60
  backdrop-blur-xl
  border border-white/20

  shadow-xl
  transition-all duration-300
  hover:scale-105
  hover:border-purple-400/40
  hover:shadow-purple-500/30
"
        >
          <Pencil size={16} />
          Edit
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${open ? "rotate-180 text-purple-400" : "opacity-70"}`}
          />
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-purple-500/10 transition duration-300" />
        </motion.button>

        {/* ================= DROPDOWN ================= */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="
  absolute right-0 mt-3 w-80 max-h-[320px] overflow-y-auto
                rounded-2xl
                backdrop-blur-2xl
                bg-white/80 dark:bg-[#0b0c10]/90
                border border-black/10 dark:border-white/10
                shadow-2xl
                p-2
              "
            >
              <p className="px-3 py-2 text-xs font-semibold opacity-60">
                Select content to edit
              </p>

              {chats.length === 0 ? (
  <p className="px-4 py-6 text-center text-sm opacity-60">
    {activeChatId
  ? "This chat has no generated content yet."
  : "Start a conversation to enable editing."}

  </p>
) : (
  chats.map((msg, index) => {
    // remove HTML tags for preview
    const preview = msg.content
      .replace(/<[^>]*>/g, "")
      .replace(/\n/g, " ")
      .trim()
      .slice(0, 140);

    return (
      <motion.button
        key={msg.id || index}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.04 }}
        whileHover={{
          scale: 1.02,
          backgroundColor: "rgba(139,92,246,0.12)",
        }}
        whileTap={{ scale: 0.97 }}
        onClick={() =>
          navigate("/editor", {
  state: {
    chatId: activeChatId,
    messageId: msg.id,
  },
})
        }
        className="
          w-full text-left px-4 py-3 rounded-xl
          transition-all duration-200
          border border-transparent
          hover:border-purple-500/30
        "
      >
        {/* preview text */}
        <p className="text-sm font-medium line-clamp-3 leading-relaxed">
          {preview || "Generated Content"}
        </p>

        {/* generated badge */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs opacity-50">
            Generated Output #{index + 1}
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            editable
          </span>
        </div>
      </motion.button>
    );
  })
)}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* 🔥 ADVANCED MODE BUTTON */}
{/* 🔥 ADVANCED MODE BUTTON */}
<motion.button
  whileTap={{ scale: 0.9 }}
  whileHover={{ scale: 1.06 }}
  onClick={() => setAdvancedMode(prev => !prev)}
  className={`
    cursor-pointer
    relative overflow-visible
    flex items-center gap-2
    px-5 py-2.5 rounded-full
    text-sm font-semibold
    backdrop-blur-xl
    border
    transition-all duration-500

    ${advancedMode
      ? "text-white border-orange-400/40 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
      : "bg-white/70 dark:bg-black/60 border-white/20 text-gray-800 dark:text-white"}
  `}
>

  {/* ================= NORMAL MODE EMBER RIPPLE ================= */}
{!advancedMode && (
  <>

    {/* warm breathing aura */}
    <span className="absolute inset-0 rounded-full animate-[emberGlow_4.5s_ease-in-out_infinite]" />
  </>
)}


  {/* ================= ADVANCED FIRE WAVES ================= */}
  

  {/* ICON */}
  <span
    className={`relative flex items-center justify-center ${
  advancedMode
    ? "animate-[heartbeat_1.4s_infinite]"
    : "animate-[emberPulse_3s_ease-in-out_infinite]"
}`}

  >
    <Flame
  size={18}
  className={
    advancedMode
      ? "text-yellow-200 drop-shadow-[0_0_6px_rgba(255,200,80,.9)]"
      : "text-orange-400 drop-shadow-[0_0_4px_rgba(255,140,0,.6)]"
  }
/>

  </span>

  {/* TEXT */}
  <span className="relative z-10">
    {advancedMode ? "Advanced" : "Normal"}
  </span>

  {/* FIRE AURA */}
  {advancedMode && (
    <span className="absolute inset-0 rounded-full animate-[fireGlow_2.4s_ease-in-out_infinite]" />
  )}
</motion.button>



      {/* ================= THEME BUTTON ================= */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.08 }}
        onClick={() => setDark(!dark)}
        className="
          relative overflow-hidden
          flex items-center gap-2
          bg-white/70 dark:bg-black/60
          backdrop-blur-xl
          border border-white/20
          px-4 py-2 rounded-full
          shadow-xl
          text-sm
          transition-all duration-300
        "
      >

        {dark ? <Sun size={16} /> : <Moon size={16} />}
        <span>{dark ? "Light" : "Dark"}</span>
      </motion.button>
    </header>
  );
}
