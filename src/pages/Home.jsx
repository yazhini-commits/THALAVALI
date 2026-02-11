import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { PromptContext } from "../context/PromptContext";
import { ThemeContext } from "../context/ThemeContext";
import Sidebar from "../components/sidebar/Sidebar";
import TopBar from "../components/header/TopBar";
import PromptBox from "../components/prompt/PromptBox";
import ContentCards from "../components/prompt/ContentCards";
import HistoryPanel from "../components/history/HistoryPanel";
import Toast from "../components/overlays/Toast";
import Papa from "papaparse";
import PromptPanel from "../components/prompt/PromptPanel";
import { motion, AnimatePresence } from "framer-motion";
import { generateContent } from "../services/aiService";
import TemplatesSidebar from "../components/templates/TemplatesSidebar";
import TemplatesBar from "../components/advanced/TemplatesBar";
import ABTestPanel from "../components/advanced/ABTestPanel";
import { ABContext } from "../context/ABContext";
import ABLoader from "../components/advanced/ABLoader";
import { createChatFromAB } from "../utils/historyStorage";
import { streamText } from "../utils/streamRenderer";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  RotateCcw,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { getChatById } from "../utils/historyStorage";
import { getWordCount, getReadabilityScore } from "../utils/textAnalytics";

export default function Home() {
  const [showVariations, setShowVariations] = useState(false);
const [variations, setVariations] = useState([]);
const [basePromptForVariations, setBasePromptForVariations] = useState(null);
const [selectedVariation] = useState(null); // 🔥 NEW
/* ================= TEMPLATES SYSTEM ================= */
const [templatesOpen, setTemplatesOpen] = useState(false);
const [selectedTemplate, setSelectedTemplate] = useState(null);
/* ================= ADVANCED MODE ================= */
const { advancedMode, setDark } = useContext(ThemeContext);
const [abOpen, setAbOpen] = useState(false);
/* typing hero text */
const [typedText, setTypedText] = useState("");
const { setPromptPanelOpen } = useContext(PromptContext);
const { abData, setABResults, clearAB } = useContext(ABContext);
const [abFullscreen, setAbFullscreen] = useState(false);

useEffect(() => {
  // nothing to do
  if (!abData || !abData.generating) return;

  // open fullscreen lab mode
  setAbFullscreen(true);

  // prevents state update if component rerenders/unmounts
  let cancelled = false;

  const runABTest = async () => {
    try {
      /* -------- VERSION A -------- */
      const resA = await generateContent({
        chatId: "__AB_TEST__",
        type: abData.type,
        topic: abData.promptA,
        abTest: true,
      });

      if (cancelled) return;

      /* -------- VERSION B -------- */
      const resB = await generateContent({
        chatId: "__AB_TEST__",
        type: abData.type,
        topic: abData.promptB,
        abTest: true,
      });

      if (cancelled) return;

      // ⭐ THIS IS THE MOST IMPORTANT LINE
      // saves results AND stops loader
      setABResults(resA.content, resB.content);

    } catch (err) {
      console.error("AB generation failed:", err);

      // safely exit lab mode
      clearAB();
      setAbFullscreen(false);
    }
  };

  runABTest();

  // cleanup (prevents double rendering in React strict mode)
  return () => {
    cancelled = true;
  };

}, [abData]);


const chooseWinner = (winner) => {
  if (!abData) return;

  const chosenPrompt =
    winner === "A" ? abData.promptA : abData.promptB;

  const chosenText =
    winner === "A" ? abData.resultA : abData.resultB;

  /* ⭐ CREATE REAL CHAT SESSION */
  const newChatId = createChatFromAB({
    userPrompt: chosenPrompt,
    assistantReply: chosenText,
    type: abData.type,
    title: chosenPrompt,
  });

  /* exit AB mode */
  clearAB();
  setAbFullscreen(false);

  /* open chat */
  setActiveChatId(newChatId);
  setIsNewSession(false);

  setMessages([
    {
      role: "user",
      content: chosenPrompt,
      meta: { type: abData.type },
    },
    {
      role: "assistant",
      content: chosenText,
      id: Date.now(),
      createdAt: Date.now(),
    },
  ]);

  setSelectedType(abData.type);
};



const advancedText =
`Power Mode Unlocked
Accuracy • Smarter • Dynamic`;

  // 🔥 Batch Mode
const [batchMode, setBatchMode] = useState(false);
const [batchInputs, setBatchInputs] = useState([]); // [{ id, text }]
const [batchResults, setBatchResults] = useState([]); // [{ id, status, output, error }]
const [batchProgress, setBatchProgress] = useState(0);
const [batchRunning, setBatchRunning] = useState(false);

  const [selectedType, setSelectedType] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [messages, setMessages] = useState([]);
  /* ===== CHAT AUTO SCROLL ===== */
const chatEndRef = useRef(null);
const [isStreaming, setIsStreaming] = useState(false);

  const [reuseParams, setReuseParams] = useState(null);

  const [copiedIndex, setCopiedIndex] = useState(null);
const [feedback, setFeedback] = useState(() => {
  return JSON.parse(localStorage.getItem("ai_feedback")) || {};
});
const navigate = useNavigate();
const [checkingAuth, setCheckingAuth] = useState(true);

const [feedbackAnim, setFeedbackAnim] = useState({});

const [activeChatId, setActiveChatId] = useState(null);
const [isNewSession, setIsNewSession] = useState(true);

  const hasMessages = messages.length > 0 && !abData;
/* ================= DYNAMIC LOADING ================= */
const LOADING_STEPS = [
  { text: "Analyzing your prompt…", type: "spinner" },
  { text: "Thinking creatively…", type: "dots" },
  { text: "Structuring response…", type: "bar" },
  { text: "Finalizing output…", type: "pulse" },
];
const [showSuccessToast, setShowSuccessToast] = useState(false);
const [activeTemplate, setActiveTemplate] = useState(null);

const [loadingStep, setLoadingStep] = useState(0);

  /* ================= LOAD CHAT ================= */
function handleSelectChat(chatId) {

  // ⭐ tell TopBar which chat is open
  setActiveChatId(chatId);

  // NEW CHAT
  if (!chatId) {
    setMessages([]);
    setSelectedType(null);
    setReuseParams(null);
    setIsNewSession(true);
    return;
  }

  setIsNewSession(false);

  const chat = getChatById(chatId);
  if (!chat) return;

  // load messages from history
  setMessages(
    chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
      meta: m.meta || null,
      id: m.messageId, // ⭐ IMPORTANT (editor needs this)
    }))
  );

  setSelectedType(chat.type || null);
  setReuseParams(null);
}

/* ================= KEYBOARD SHORTCUTS (FIXED POSITION) ================= */
useKeyboardShortcuts({
  newChat: () => handleSelectChat(null),

  search: () =>
    window.dispatchEvent(new Event("openSearch")),

  dashboard: () => navigate("/dashboard"),

  templates: () =>
    window.dispatchEvent(new Event("openTemplates")),

  promptPanel: () => {
    if (selectedType)
      setPromptPanelOpen(prev => !prev);
  },

  theme: () => setDark(prev => !prev),

  abTest: () => setAbOpen(prev => !prev),
});


  /* ================= THEME ================= */

useEffect(() => {
  const user = localStorage.getItem("user");

  // simulate auth check delay (UX polish)
  setTimeout(() => {
    if (!user) {
      navigate("/sign", { replace: true });
    } else {
      setCheckingAuth(false);
    }
  }, 800);
}, []);




useEffect(() => {
  if (templatesOpen && sidebarOpen) {
    setSidebarOpen(false);
  }
}, [templatesOpen]);

/* ================= HERO TYPING EFFECT ================= */
useEffect(() => {
  if (!advancedMode) {
    setTypedText("");
    return;
  }

  let i = 0;
  setTypedText("");

  const interval = setInterval(() => {
    setTypedText(advancedText.slice(0, i));
    i++;

    if (i > advancedText.length) clearInterval(interval);
  }, 28);

  return () => clearInterval(interval);
}, [advancedMode]);

useEffect(() => {
  const open = () => setTemplatesOpen(true);
  window.addEventListener("openTemplates", open);
  return () => window.removeEventListener("openTemplates", open);
}, []);

/* ================= LOADING ANIMATION CYCLE ================= */

/* ================= LOADING ANIMATION CYCLE ================= */
useEffect(() => {

  // stop loader when AI starts writing
  if (isStreaming) {
    setLoadingStep(0);
    return;
  }

  const hasLoading = messages.some(
    (m) => m.role === "assistant" && m.content === ""
  );

  if (!hasLoading) {
    setLoadingStep(0);
    return;
  }

  const interval = setInterval(() => {
    setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
  }, 4000);

  return () => clearInterval(interval);

}, [messages, isStreaming]);


/* ================= AUTO SCROLL DURING STREAM ================= */
useEffect(() => {
  if (!chatEndRef.current) return;

  chatEndRef.current.scrollIntoView({
    behavior: isStreaming ? "auto" : "smooth",
    block: "end",
  });

}, [messages, isStreaming]);







  /* ================= COPY ================= */
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const formatLabel = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

  const recordFeedback = (messageId, type, meta) => {
  const stored = JSON.parse(localStorage.getItem("ai_feedback")) || {};

  stored[messageId] = {
    type, // "up" | "down"
    contentType: meta?.type,
    timestamp: Date.now(),
  };

  localStorage.setItem("ai_feedback", JSON.stringify(stored));
  setFeedback(stored);
};
if (checkingAuth) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0b0b14] text-white">
      <div className="flex gap-2 mb-4">
        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" />
        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-150" />
        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-300" />
      </div>
      <p className="text-sm opacity-70">Preparing your workspace…</p>
    </div>
  );
}

  return (
    <div className="h-screen w-screen flex overflow-hidden">

      <Sidebar isOpen={sidebarOpen} onSelectChat={handleSelectChat} />
      
      {/* TOGGLE */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-6 z-50 w-10 h-10 rounded-full flex items-center justify-center
        bg-white dark:bg-black/70 backdrop-blur border border-black/10 dark:border-white/10
        ${sidebarOpen ? "left-[18rem]" : "left-[5.5rem]"}`}
      >
        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
      
          
      <main
  className={`relative flex-1 h-full transition-all duration-300
  ${templatesOpen ? "mr-[380px]" : ""}
  ${abData?.generating ? "pointer-events-none select-none" : ""}
`}
>
    {/* GLOBAL PROCESSING OVERLAY */}
<AnimatePresence>
{abData?.generating && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 backdrop-blur-2xl bg-black/50 flex items-center justify-center"
  >
    <div className="text-center">
      <ABLoader />
      <p className="mt-6 text-lg font-semibold tracking-wide">
        Comparing AI responses...
      </p>
      <p className="opacity-70 text-sm mt-2">
        Evaluating creativity • structure • clarity
      </p>
    </div>
  </motion.div>
)}
</AnimatePresence>


      
        {/* BG — UNCHANGED */}
        <div className="absolute inset-0">
          <div
  className="absolute inset-0 bg-cover bg-center transition-all duration-700"
  style={{
    backgroundImage: `url('${
      advancedMode ? "/advanced-bg.jpg" : "/bg.png"
    }')`,
  }}
/>

          <div className="absolute inset-0 bg-white/85 dark:hidden" />
          <div className="absolute inset-0 hidden dark:block bg-black/65" />
        </div>
          
        <TopBar 
  activeChatId={activeChatId}
  selectedType={selectedType}
/>
<TemplatesBar
  selectedType={selectedType}
  activeTemplate={selectedTemplate}
  onOpenTemplates={() => setTemplatesOpen(true)}
  onOpenAB={() => setAbOpen(true)}
/>



<TemplatesSidebar
  open={templatesOpen}
  
  selectedType={selectedType}
  onClose={() => setTemplatesOpen(false)}
  onUseTemplate={(templateObject) => {
  setActiveTemplate(templateObject);
  setTemplatesOpen(false);
}}
/>



<PromptPanel />
<ABTestPanel
  open={abOpen}
  onClose={() => setAbOpen(false)}
  selectedType={selectedType}
/>


        {/* CHAT */}
        <div className="relative z-10 pt-28 h-[calc(100vh-140px)] overflow-y-auto">


          <div className="max-w-4xl mx-auto px-6 pb-[420px] space-y-6">
            
            {!hasMessages && !abData && !abData?.generating && (
  <div className="text-center mb-24">
                <h1 className="text-5xl font-bold mb-4 whitespace-pre-line transition-all duration-500">
  {advancedMode ? (
    <span className="advanced-text">{typedText}</span>
  ) : (
    <>
      Hi Siddhu! <br />I’m your creative partner.
    </>
  )}
</h1>

                <p className="max-w-xl mx-auto text-gray-600 dark:text-white/70 text-lg">
                  I help you write LinkedIn posts, emails, ad copy, and more.
                </p>
              </div>
            )}
            

            {!batchMode &&
  messages.map((msg, index) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={index}
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
                  <div
                    className={`max-w-3xl px-6 py-4 rounded-2xl backdrop-blur-xl border
                    ${
                      isUser
                        ? "bg-purple-600 text-white border-purple-500/40"
                        : "bg-white dark:bg-black/70 text-gray-800 dark:text-white border-black/10 dark:border-white/10"
                    }`}
                  >
                    {/* ================= MESSAGE RENDERER (3-STATE AI) ================= */}

{!isUser && msg.content === "" && !isStreaming ? (

  /* ---------------- THINKING (LOADER) ---------------- */
  <div className="flex items-center gap-3 text-gray-500 dark:text-white/70">

    {LOADING_STEPS[loadingStep].type === "spinner" && (
      <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    )}

    {LOADING_STEPS[loadingStep].type === "dots" && (
      <span className="flex gap-1">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150" />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-300" />
      </span>
    )}

    {LOADING_STEPS[loadingStep].type === "bar" && (
      <span className="w-24 h-1 bg-purple-500/20 rounded overflow-hidden">
        <span className="block h-full w-1/2 bg-purple-500 animate-pulse" />
      </span>
    )}

    {LOADING_STEPS[loadingStep].type === "pulse" && (
      <span className="w-3 h-3 bg-purple-500 rounded-full animate-ping" />
    )}

    <span>{LOADING_STEPS[loadingStep].text}</span>
  </div>

) : isUser ? (

  /* ---------------- USER MESSAGE ---------------- */
  <>
    <div className="whitespace-pre-wrap leading-relaxed">
      {msg.content.replace(/Feedback Hint:.*$/im, "").trim()}
    </div>

    {msg.meta && (
      <div className="flex flex-wrap gap-2 mt-3 text-xs">
        {Object.entries(msg.meta)
          .filter(([k, v]) => v && k !== "type" && k !== "topic")
          .map(([k, v]) => (
            <span
              key={k}
              className="px-2 py-1 rounded-full bg-white/20"
            >
              {formatLabel(k)}: {String(v)}
            </span>
          ))}
      </div>
    )}
  </>

) : (

  /* ---------------- AI WRITING + FINAL ---------------- */
  <>
    <div
      className="whitespace-pre-wrap leading-relaxed"
      dangerouslySetInnerHTML={{ __html: msg.content || "" }}
    />

    {/* analytics only after writing finished */}
    {!msg.content.endsWith("▌") && (
      <div className="flex gap-4 text-xs opacity-70 mt-3">
        <span>{getWordCount(msg.content || "")} words</span>
<span>
  Readability: {getReadabilityScore(msg.content || "")}/100
</span>

      </div>
    )}
  </>

)}

                  </div>

                  {/* ACTIONS */}
                  {msg.content && (
                    <div className="mt-2 flex gap-4 text-xs opacity-70">
                      <button
                        onClick={() => handleCopy(msg.content, index)}
                        className="flex items-center gap-1"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check size={20} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={20} />
                          </>
                        )}
                      </button>

                      {!isUser && (
                        <>
                          <button
  onClick={() => {
    setFeedbackAnim({ [msg.id]: "up" });
    recordFeedback(msg.id, "up", msg.meta);

    setTimeout(() => setFeedbackAnim({}), 600);
  }}
  className={`transition transform ${
    feedbackAnim[msg.id] === "up"
      ? "scale-125 text-green-500 animate-bounce"
      : "hover:scale-110"
  }`}
>
  <ThumbsUp size={20} />
</button>


<button
  onClick={() => {
    setFeedbackAnim({ [msg.id]: "down" });
    recordFeedback(msg.id, "down", msg.meta);

    setTimeout(() => setFeedbackAnim({}), 600);
  }}
  className={`transition transform ${
    feedbackAnim[msg.id] === "down"
      ? "scale-125 text-red-500 animate-pulse"
      : "hover:scale-110"
  }`}
>
  <ThumbsDown size={20} />
</button>



                          <button
                            onClick={() => {
                              const lastUser = [...messages]
                                .slice(0, index)
                                .reverse()
                                .find((m) => m.role === "user");
                              if (!lastUser) return;

                              setReuseParams({
                                topic: lastUser.content,
                                ...lastUser.meta,
                              });
                              setSelectedType(lastUser.meta?.type);
                            }}
                          >
                            <RotateCcw size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {/* CHAT SCROLL ANCHOR */}
<div ref={chatEndRef} className="h-2" />

          </div>
        </div>
        {batchMode && (
  <div className="max-w-4xl mx-auto px-6 pb-[420px] space-y-6">
    <div className="p-6 rounded-2xl bg-white dark:bg-black/70 border">
      <h2 className="text-lg font-semibold mb-4">
        Batch Content Generation
      </h2>

      <input
  type="file"
  accept=".csv"
  className="block w-full mb-4"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data
          .filter(r => r.prompt)
          .map((row, i) => ({
            id: i + 1,
            text: row.prompt,
          }));

        setBatchInputs(rows);
        setBatchResults([]);
        setBatchProgress(0);
      },
    });
  }}
/>
{batchInputs.length > 0 && (
  <>
    <button
      onClick={async () => {
        setBatchRunning(true);
        setBatchResults([]);
        setBatchProgress(0);

        for (let i = 0; i < batchInputs.length; i++) {
          const item = batchInputs[i];

          try {
            const result = await generateContent({
              chatId: null,
              type: selectedType,
              topic: item.text,
            });

            setBatchResults(prev => [
              ...prev,
              {
                id: item.id,
                status: "success",
                output: result.content,
              },
            ]);
          } catch (err) {
            setBatchResults(prev => [
              ...prev,
              {
                id: item.id,
                status: "error",
                error: "Generation failed",
              },
            ]);
          }

          setBatchProgress(Math.round(((i + 1) / batchInputs.length) * 100));
        }

        setBatchRunning(false);
      }}
      className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:scale-105 transition"
    >
      Run Batch ({batchInputs.length})
    </button>

    {/* PROGRESS BAR */}
    {batchRunning && (
      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all"
            style={{ width: `${batchProgress}%` }}
          />
        </div>
        <p className="text-xs mt-2 opacity-70">
          Processing… {batchProgress}%
        </p>
      </div>
    )}
  </>
)}


      <p className="text-sm opacity-70">
        Upload a CSV or switch to Chat mode for single prompts.
      </p>
    </div>
  </div>
)}
{batchResults.length > 0 && (
  <div className="mt-6 space-y-4">
    {batchResults.map((r) => (
      <div
        key={r.id}
        className={`p-4 rounded-xl border ${
          r.status === "success"
            ? "bg-green-50 dark:bg-green-900/20 border-green-500/30"
            : "bg-red-50 dark:bg-red-900/20 border-red-500/30"
        }`}
      >
        <p className="text-xs opacity-60 mb-1">
          Row {r.id} — {r.status}
        </p>

        {r.status === "success" ? (
          <p className="text-sm whitespace-pre-wrap">
            {r.output}
          </p>
        ) : (
          <p className="text-sm text-red-600">
            {r.error}
          </p>
        )}
      </div>
    ))}
  </div>
)}

        <HistoryPanel
          onReuse={(item) => {
            setSelectedType(item.type);
            setReuseParams(item.params);
          }}
        />
        
        {/* INPUT */}
        <div
  className={`
    fixed bottom-0 z-50
    transition-all duration-300 ease-out
    ${sidebarOpen ? "left-72" : "left-20"}
${templatesOpen ? "right-[380px]" : "right-0"}
  `}
>


          <div className="max-w-4xl mx-auto px-6 pb-6 space-y-4">
            {!selectedType && <ContentCards onSelect={setSelectedType} />}

            <div className="bg-gray-200 dark:bg-black/80 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl">
              <PromptBox
                disabled={!!abData}
                chatId={activeChatId}
  setActiveChatId={setActiveChatId}
  isNewSession={isNewSession}
  setIsNewSession={setIsNewSession}
                selectedType={selectedType}
                reuseParams={reuseParams}
                selectedVariation={selectedVariation}
                setBatchMode={setBatchMode}
                activeTemplate={selectedTemplate}
onRemoveTemplate={() => setSelectedTemplate(null)}
                onClearType={() => {
                  setSelectedType(null);
                  setReuseParams(null);
                }}
                onOpenVariations={async (data) => {
  setShowVariations(true);
  setVariations([]);
  setBasePromptForVariations(data);

  const result = await generateContent({
    chatId: null,
    type: selectedType,
    topic: data.prompt,
    tone: data.tone,
    audience: data.audience,
    keywords: data.keywords,
    length: data.length,
    model: data.model,
    variationMode: true,
  });

  const parts =
    typeof result?.content === "string"
      ? result.content
          .split(/===\s*VARIATION\s*[A-Z]\s*===/i)
          .map(v => v.trim())
          .filter(v => v.length > 50)
      : [];

  setVariations(
    parts.length
      ? parts
      : ["No structured variations returned. Try again."]
  );
}}


                onSubmit={(userText, params) => {
  // ⭐ GENERAL MODE (each line is its own message)
  if (params?.type && params.type !== selectedType && selectedType === "General") {
    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: userText,
        meta: { type: params.type, source: "general" },
      },
      {
        role: "assistant",
        content: "", // loader bubble
      },
    ]);
    return;
  }

  // ⭐ NORMAL MODE
  setMessages(prev => [
    ...prev,
    {
      role: "user",
      content: userText,
      meta: { type: selectedType, ...params },
    },
    {
      role: "assistant",
      content: "",
    },
  ]);
}}

                onResult={async (aiText, returnedChatId) => {

  if (!activeChatId && returnedChatId) {
    setActiveChatId(returnedChatId);
    setIsNewSession(false);
  }

  let assistantIndex = -1;

  // Keep loader visible first
  await new Promise(r => setTimeout(r, 400)); // natural pause

  setMessages(prev => {
    const updated = [...prev];
    for (let i = updated.length - 1; i >= 0; i--) {
      if (updated[i].role === "assistant" && updated[i].content === "") {
        assistantIndex = i;
        break;
      }
    }
    return updated;
  });

  // 🔥 NOW WRITING STARTS
  setIsStreaming(true);

  await streamText({
    text: aiText,
    speed: 14,
    onUpdate: (partial) => {
      setMessages(prev => {
        const updated = [...prev];
        if (assistantIndex !== -1 && updated[assistantIndex]) {
          updated[assistantIndex].content = partial + "▌";
        }
        return updated;
      });
    },
  });

  // finalize
  setMessages(prev => {
    const updated = [...prev];
    if (assistantIndex !== -1 && updated[assistantIndex]) {
      updated[assistantIndex].content = aiText;
    }
    return updated;
  });

  setIsStreaming(false);

  setShowSuccessToast(true);
  setTimeout(() => setShowSuccessToast(false), 2500);
}}






              />
            </div>
          </div>
        </div>
      </main>
      {/* ================= GLOBAL AB LAB MODE ================= */}
<AnimatePresence>
{abFullscreen && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[120]"
  >

    {/* Blur + dim whole app */}
    <div className="absolute inset-0 backdrop-blur-2xl bg-black/60 pointer-events-none" />

    {/* Foreground A/B Workspace */}
    <div className="absolute inset-0 overflow-y-auto pt-28 pb-48 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold tracking-wide">
            AI Prompt Testing
          </h2>

          <p className="opacity-70 mt-2">
            Pick the better response — the other disappears forever
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* VERSION A */}
          <div className="rounded-2xl border border-purple-500/30 bg-white dark:bg-[#0b0c10] shadow-2xl p-6 flex flex-col">
            <div className="mb-3 text-xs font-semibold text-purple-500">
              VERSION A
            </div>

            <div className="mb-4 px-4 py-3 rounded-xl bg-purple-600 text-white">
              {abData?.promptA}
            </div>

            <div className="whitespace-pre-wrap leading-relaxed">
              {abData?.generating ? <ABLoader /> : abData?.resultA}
            </div>

            {!abData?.generating && (
              <button
                onClick={() => chooseWinner("A")}
                className="mt-6 py-3 rounded-xl bg-purple-600 text-white hover:scale-[1.03] transition"
              >
                I prefer this
              </button>
            )}
          </div>

          {/* VERSION B */}
          <div className="rounded-2xl border border-indigo-500/30 bg-white dark:bg-[#0b0c10] shadow-2xl p-6 flex flex-col">
            <div className="mb-3 text-xs font-semibold text-indigo-500">
              VERSION B
            </div>

            <div className="mb-4 px-4 py-3 rounded-xl bg-indigo-600 text-white">
              {abData?.promptB}
            </div>

            <div className="flex-1 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {abData?.generating ? <ABLoader /> : abData?.resultB}
            </div>

            {!abData?.generating && (
              <button
                onClick={() => chooseWinner("B")}
                className="mt-6 py-3 rounded-xl bg-indigo-600 text-white hover:scale-[1.03] transition"
              >
                I prefer this
              </button>
            )}
          </div>

        </div>
      </div>
    </div>

  </motion.div>
)}
</AnimatePresence>


      <Toast
  show={showSuccessToast}
  message="Content generated successfully"
/>

    </div>
  );
}
