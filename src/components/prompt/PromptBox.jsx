import { useState, useEffect, useRef, useContext } from "react";
import { generateContent } from "../../services/aiService";
import { motion, AnimatePresence } from "framer-motion";
import { PromptContext } from "../../context/PromptContext";
import {
  Send,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Cpu,
  Check,
  Zap,
  Sparkles
} from "lucide-react";

import { parseBulkInput, processBulk } from "../../utils/bulkProcessor";

export default function PromptBox({
  selectedType,
  reuseParams,
  chatId,
  onClearType,
  onSubmit,
  onResult,
  setActiveChatId,
  isNewSession,
  setIsNewSession,
  onOpenVariations,
  selectedVariation,
  activeTemplate,
  onRemoveTemplate,
  disabled = false,   // ⭐ ADD THIS LINE
}) {
  const fileInputRef = useRef(null);
const [attachedFiles, setAttachedFiles] = useState([]);
  const variationRef = useRef(null);
  const inputRef = useRef(null);
  const [variationOpen, setVariationOpen] = useState(false);
const [variations, setVariations] = useState([]);
const [loadingVariations, setLoadingVariations] = useState(false);

  const [model, setModel] = useState("gpt-3.4");
  const [modelOpen, setModelOpen] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const [prompt, setPrompt] = useState("");
  const isGeneral = selectedType === "General";
  const {
  setFinalPrompt,
  editablePrompt,
  hasCustomPrompt,
  resetPromptPanel
} = useContext(PromptContext);
  const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed"
];
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [length, setLength] = useState("");
  const resetPromptBox = () => {
  setPrompt("");
  setTone("");
  setAudience("");
  setKeywords("");
  setLength("");
  setShowOptions(false);
  setVariationOpen(false);
  setVariations([]);
};
  const handleTypeChange = () => {
  resetPromptBox();
  setPrompt(""); // remove template


  // important: clear session if user was in General bulk mode
  setPrompt("");
  setVariations([]);
  setVariationOpen(false);

  // go back to card selection
  onClearType?.();
};

  const [loading, setLoading] = useState(false);
  const handleKeyDown = (e) => {
  if (disabled) return;

  if (!isGeneral && e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleGenerate();
  }
};

useEffect(() => {
  const handleUploadShortcut = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "u") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  window.addEventListener("keydown", handleUploadShortcut);
  return () => window.removeEventListener("keydown", handleUploadShortcut);
}, []);

useEffect(() => {
  // do NOT reset if template is being injected
  if (reuseParams?.fromTemplate) return;

  if (selectedType) {
    resetPromptBox();
  }
}, [selectedType]);


    useEffect(() => {
  if ((selectedType || reuseParams?.fromTemplate) && inputRef.current) {
    inputRef.current.focus();
  }
}, [selectedType, reuseParams]);


  useEffect(() => {
  const close = () => setModelOpen(false);
  window.addEventListener("click", close);
  return () => window.removeEventListener("click", close);
}, []);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      variationRef.current &&
      !variationRef.current.contains(e.target)
    ) {
      setVariationOpen(false);
    }
  };

  if (variationOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [variationOpen]);

useEffect(() => {
  return () => {
    attachedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
  };
}, [attachedFiles]);

  /* ================= 🔁 REUSE FROM HISTORY ================= */
  useEffect(() => {
  if (!reuseParams) return;

  // ⭐ TEMPLATE MODE
  if (reuseParams.fromTemplate) {
    setPrompt(reuseParams.topic || "");

    // do NOT open options
    setShowOptions(false);

    // focus cursor at end
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = inputRef.current.value.length;
      }
    }, 50);

    return;
  }

  // ⭐ HISTORY REUSE MODE (old behavior)
  setPrompt(reuseParams.topic || "");
  setTone(reuseParams.tone || "Professional");
  setAudience(reuseParams.audience || "");
  setKeywords(reuseParams.keywords || "");
  setLength(reuseParams.length || "Medium");

  if (!isGeneral) setShowOptions(true);

}, [reuseParams, isGeneral]);


const handleFileUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const validFiles = [];

  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert(`Unsupported file: ${file.name}`);
      continue;
    }

    // CSV → activate bulk mode automatically
    if (file.type === "text/csv") {
      const text = await file.text();
      setPrompt(text);
      setSelectedType?.("General"); // bulk processing
      continue;
    }

    const isImage = file.type.startsWith("image/");

validFiles.push({
  id: Date.now() + Math.random(),
  name: file.name,
  size: (file.size / 1024).toFixed(1) + " KB",
  file,
  type: file.type,
  preview: isImage ? URL.createObjectURL(file) : null
});

  }
  e.target.value = null;
  setAttachedFiles(prev => [...prev, ...validFiles]);
};

  /* ================= 🚀 GENERATE ================= */
  /* ================= 🚀 GENERATE ================= */
const handleGenerate = async () => {

  if (disabled) return;   // ⭐ ABSOLUTE BLOCK

  if (!prompt.trim() || !selectedType || loading) return;


  // =========================
  // ⭐ GENERAL BULK MODE
  // =========================
  if (isGeneral) {

    const tasks = parseBulkInput(prompt);

    if (tasks.length === 0) return;

    setLoading(true);
    setPrompt("");

    await processBulk(
      tasks,

      // generator
      async (task) => {

        // 1️⃣ show user bubble (topic line)
        onSubmit?.(task.topic, { type: task.detectedType });

        // 2️⃣ show assistant loader bubble
        onResult?.("");

        // 3️⃣ call AI
        const result = await generateContent({
          chatId: null, // each topic independent
          type: task.detectedType,
          topic: task.topic,
          model,
        });

        return result.content;
      },

      // after each generation
      (item) => {
        onResult?.(item.content || "Failed to generate content.");
      }
    );

    setLoading(false);
    return;
  }

  // =========================
  // NORMAL MODE (UNCHANGED)
  // =========================

  const userPrompt = prompt.trim();
  // Build real LLM prompt preview
const previewPrompt = `
CONTENT TYPE: ${selectedType}

USER TOPIC:
${userPrompt}

TONE: ${tone || "Default"}
AUDIENCE: ${audience || "General"}
KEYWORDS: ${keywords || "None"}
LENGTH: ${length || "Medium"}

${activeTemplate ? `TEMPLATE:\n${activeTemplate.structure}` : ""}
`;

setFinalPrompt(previewPrompt);

  onSubmit?.(userPrompt, {
    tone,
    audience,
    keywords,
    length,
  });

  setPrompt("");
  setLoading(true);

  try {
    const finalUserPrompt = hasCustomPrompt
  ? editablePrompt
  : userPrompt;

const result = await generateContent({
  chatId: isNewSession ? null : chatId,
  type: selectedType,
  topic: userPrompt, // ALWAYS original textbox
  manualPrompt: hasCustomPrompt ? editablePrompt : null,
  tone,
  audience,
  keywords,
  length,
  model,
  selectedTemplate: activeTemplate?.structure || null,
  lockedVariationHint: selectedVariation
    ? `Use this variation as inspiration:\n${selectedVariation}`
    : "",
});


    onResult?.(
      typeof result?.content === "string" && result.content.trim()
        ? result.content
        : "No content generated."
    );

    if (isNewSession && result?.chatId) {
      setActiveChatId(result.chatId);
      setIsNewSession(false);
    }

  } catch (error) {
    console.error("Generation error:", error);
    onResult?.("Failed to generate content. Please try again.");
  } finally {
  setLoading(false);
  setAttachedFiles([]);
  setTone("");
  setAudience("");
  setKeywords("");
  setLength("");
  setShowOptions(false);

  resetPromptPanel(); // ⭐ resets panel for next generation
}

};

useEffect(() => {
  if (!selectedType) return;

  // Do NOT override user custom prompt
  if (hasCustomPrompt) return;

  const basePrompt = prompt || `[No topic yet — ${selectedType}]`;


  const preview = `
CONTENT TYPE: ${selectedType}

USER INPUT:
${basePrompt}

TONE: ${tone || "Default"}
AUDIENCE: ${audience || "General"}
KEYWORDS: ${keywords || "None"}
LENGTH: ${length || "Medium"}

${activeTemplate ? `TEMPLATE:\n${activeTemplate.structure}` : ""}
`;

  setFinalPrompt(preview);

}, [prompt, tone, audience, keywords, length, selectedType, activeTemplate]);


  return (
    <div className="w-full">
      <div
        className="
          bg-gray-200/85 dark:bg-zinc-900/80
          backdrop-blur-xl
          border border-black/10 dark:border-white/10
          rounded-2xl
          shadow-[0_20px_50px_rgba(0,0,0,0.25)]
          p-6
        "
      >
        {/* ================= PROMPT INPUT ================= */}
        <textarea
  ref={inputRef}
  rows={2}
  value={prompt}
  disabled={disabled}
  onChange={(e) => setPrompt(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder={
    isGeneral
      ? "Enter multiple topics (one topic per line)"
      : selectedType
      ? `What should this ${selectedType} be about?`
      : "Choose a content type to get started..."
  }

  className="
    w-full resize-none
    bg-transparent
    text-gray-900 dark:text-white
    placeholder-gray-500 dark:placeholder-white/40
    focus:outline-none
    text-lg
  "
/>

{/* ================= ATTACHMENT PREVIEW ================= */}
{attachedFiles.length > 0 && (
  <div className="mt-3 flex flex-wrap gap-2">

    {attachedFiles.map((file) => {

      const isImage = file.type?.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      const isZip = file.type.includes("zip");
      const isCsv = file.type === "text/csv";

      return (
        <div
          key={file.id}
          className="
            relative group
            w-20 h-20
            rounded-xl
            overflow-hidden
            border border-black/10 dark:border-white/10
            bg-white dark:bg-zinc-900
            flex items-center justify-center
            shadow-sm
          "
        >

          {/* IMAGE PREVIEW */}
          {isImage && (
            <img
              src={file.preview}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          )}

          {/* PDF */}
          {isPdf && (
            <div className="text-center text-xs px-2">
              📄
              <p className="truncate">{file.name}</p>
            </div>
          )}

          {/* ZIP */}
          {isZip && (
            <div className="text-center text-xs px-2">
              🗜️
              <p className="truncate">{file.name}</p>
            </div>
          )}

          {/* CSV */}
          {isCsv && (
            <div className="text-center text-xs px-2">
              📊
              <p className="truncate">{file.name}</p>
            </div>
          )}

          {/* REMOVE BUTTON */}
          <button
            onClick={() =>
              setAttachedFiles(prev => prev.filter(f => f.id !== file.id))
            }
            className="
              absolute top-1 right-1
              w-5 h-5 rounded-full
              bg-black/70 text-white
              text-xs
              opacity-0 group-hover:opacity-100
              transition
            "
          >
            ×
          </button>

        </div>
      );
    })}
  </div>
)}



{activeTemplate && (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="
      mt-3 flex items-center justify-between
      px-4 py-2 rounded-xl
      bg-gradient-to-r from-purple-600/20 to-indigo-500/20
      border border-purple-400/40
      backdrop-blur
    "
  >
    <div className="flex items-center gap-2">
      <Sparkles size={16} className="text-purple-400"/>
      <div>
        <p className="text-sm font-medium text-purple-300">
          {activeTemplate.title}
        </p>
        <p className="text-xs text-white/50">
          Template applied to AI generation
        </p>
      </div>
    </div>

    <div className="flex gap-2">
  <button
    onClick={onRemoveTemplate}
    className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-red-500/30 transition"
  >
    Remove
  </button>

  <button
    onClick={() => window.dispatchEvent(new Event("openTemplates"))}
    className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-purple-500/30 transition"
  >
    Change
  </button>
</div>

  </motion.div>
)}

        {/* ================= TYPE + OPTIONS ================= */}
        {/* ================= CONTENT TYPE CHIP ================= */}
{selectedType && (
  <div className="flex items-center justify-between mt-4">

    {/* TYPE CHIP (works for General too) */}
    <button
      onClick={handleTypeChange}
      title="Change content type"
      className="
        group flex items-center gap-2
        px-4 py-1.5 text-sm font-medium rounded-full
        bg-purple-600/15 text-purple-600
        dark:bg-purple-600/20 dark:text-purple-300
        hover:bg-purple-600 hover:text-white
        transition-all duration-200
      "
    >
      <span>{selectedType}</span>
    </button>

    {/* OPTIONS BUTTON — ONLY NON GENERAL */}
    {!isGeneral && (
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400"
      >
        {showOptions ? "Hide options" : "Show options"}
        {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    )}
  </div>
)}


        {/* ================= OPTIONS ================= */}
        {showOptions && selectedType && !isGeneral && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tone */}
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border"
                >
                  <option>Select Tone</option>
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Friendly</option>
                  <option>Persuasive</option>
                </select>
              </div>
            
              {/* Audience */}
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">
                  Audience
                </label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Students, CEOs"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">
                  Keywords
                </label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Comma separated"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border"
                />
              </div>
            </div>

            {/* Length */}
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50">
                Content Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border"
              >
                <option>Choose length</option>
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Long">Long</option>
              </select>
            </div>
          </div>
          
        )}

        {/* ================= FOOTER ================= */}
        {/* ================= FOOTER ================= */}
<div className="flex items-center justify-between mt-6">

  {/* LEFT: ATTACH */}
<div className="flex items-center gap-4">

  {/* HIDDEN FILE INPUT */}
  <input
    ref={fileInputRef}
    type="file"
    multiple
    accept=".png,.jpg,.jpeg,.webp,.pdf,.csv,.zip"
    onChange={handleFileUpload}
    className="hidden"
  />

  {/* ATTACH BUTTON */}
  <button
    onClick={() => fileInputRef.current?.click()}
    className="
      flex items-center gap-2
      px-3 py-2 rounded-xl
      text-purple-600 dark:text-purple-400
      transition
    "
  >
    <Paperclip size={18} />
    Attach
  </button>

</div>




  {/* RIGHT: MODEL + SEND */}
  <div className="relative flex items-center gap-3">

  {/* ⚡ VARIATION BUTTON */}
  <button
    type="button"
    onClick={async (e) => {
      e.stopPropagation();
      if (!prompt.trim() || !selectedType) return;

      setVariationOpen(prev => !prev);

      if (variations.length === 0) {
        setLoadingVariations(true);

        const result = await generateContent({
          chatId: null,
          type: selectedType,
          topic: prompt,
          tone,
          audience,
          keywords,
          length,
          model,
          variationMode: true,
        });

        const parts =
          typeof result?.content === "string"
            ? result.content
                .split(/===\s*VARIATION\s*[A-Z]\s*===/i)
                .map(v => v.trim())
                .filter(v => v.length > 40)
            : [];

        setVariations(parts);
        setLoadingVariations(false);
      }
    }}
    className="p-2 rounded-full bg-yellow-400/20 text-yellow-500 hover:bg-yellow-400 hover:text-black transition"
  >
    <Zap size={18} />
  </button>

  {/* ✅ VARIATION DROPDOWN */}
  <AnimatePresence>
    {variationOpen && (
      <motion.div
        ref={variationRef}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="
          absolute bottom-12 right-0
          w-80 max-h-72 overflow-y-auto
          rounded-xl
          bg-white dark:bg-[#0b0c10]
          border border-black/10 dark:border-white/10
          shadow-2xl z-50
        "
      >
        {loadingVariations ? (
          <p className="text-center text-sm py-6 opacity-60">
            Generating variations…
          </p>
        ) : variations.length === 0 ? (
          <p className="text-center text-sm py-6 opacity-60">
            No variations found
          </p>
        ) : (
          variations.map((v, i) => (
            <button
              key={i}
              onClick={() => {
                onResult?.(v);
                setVariationOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-purple-600/10 border-b last:border-none"
            >
              {v.slice(0, 120)}…
            </button>
          ))
        )}
      </motion.div>
    )}
  </AnimatePresence>

    {/* MODEL SELECTOR */}
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setModelOpen(!modelOpen);
        }}
        className="
          flex items-center gap-2
          px-3 py-1.5
          rounded-lg
          text-xs font-medium
          text-gray-600 dark:text-gray-300
          bg-black/5 dark:bg-white/5
          hover:bg-purple-600/10
          transition
        "
      >
        <Cpu size={14} className="text-purple-500" />
        {model === "gpt-3.4"
          ? "GPT-3.4"
          : model === "flash-2.5"
          ? "Flash 2.5"
          : "Mistral"}
      </button>

      {/* DROPDOWN */}
      <AnimatePresence>
        {modelOpen && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="
              absolute bottom-12 right-0
              w-44 rounded-xl
              bg-white dark:bg-[#0b0c10]
              border border-black/10 dark:border-white/10
              shadow-2xl overflow-hidden z-50
            "
          >
            {[
              { id: "gpt-3.4", label: "GPT-3.4", sub: "OpenAI" },
              { id: "flash-2.5", label: "Flash 2.5", sub: "Gemini" },
              { id: "mistral", label: "Mistral", sub: "HuggingFace" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setModel(item.id);
                  setModelOpen(false);
                }}
                className="
                  w-full px-4 py-3 text-left
                  flex items-center justify-between
                  hover:bg-purple-600/10 transition
                "
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs opacity-60">{item.sub}</p>
                </div>
                {model === item.id && (
                  <Check size={16} className="text-purple-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* SEND BUTTON */}
    <button
  onClick={handleGenerate}
  disabled={loading || !selectedType || !prompt.trim() || disabled}
  className="
    bg-purple-600 p-3 rounded-full text-white
    hover:scale-110 transition
    disabled:opacity-40 disabled:cursor-not-allowed
  "
>
  <Send size={18} />
</button>


  </div>
      </div>
    </div>
    </div>
  );
}
