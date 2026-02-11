import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { defaultTemplates, getTemplates, saveTemplate, normalizeTemplates } from "../../utils/templateLibrary";
import { generateContent } from "../../services/aiService";

export default function TemplatesSidebar({
  open,
  onClose,
  selectedType,
  onUseTemplate
}) {

  const [templates, setTemplates] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  /* load templates */
  /* load templates */
useEffect(() => {
  if (!selectedType || !open) return;

  const custom = getTemplates(selectedType);
const defaults = normalizeTemplates(defaultTemplates[selectedType]);

  // merge + remove duplicates
  const combined = [...custom, ...defaults].filter(
  (tpl, index, self) =>
    index === self.findIndex(t => t.structure === tpl.structure)
);

setTemplates(combined);


}, [selectedType, open]);



  /* GENERATE NEW TEMPLATE FROM USER PROMPT */
  const handleGenerateTemplate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);

    const result = await generateContent({
      chatId: null,
      type: selectedType,
      topic: `Create a reusable content template for: ${prompt}.
Return ONLY template with placeholders like {{name}} {{topic}}`,
    });

    const templateText = result.content;

saveTemplate(selectedType, templateText);

// reload properly as object
const updated = getTemplates(selectedType);
setTemplates(prev => [...updated, ...prev]);

setPrompt("");
setGenerating(false);

    setPrompt("");
    setGenerating(false);
  };


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 420 }}
          animate={{ x: 0 }}
          exit={{ x: 420 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="
fixed right-0 top-0 h-full w-[380px] z-50
flex flex-col
bg-white dark:bg-[#0b0c10]
border-l border-gray-200 dark:border-white/10
shadow-2xl
"

        >

          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
            <h2 className="text-base font-semibold flex items-center gap-2 text-gray-800 dark:text-white">

              <Sparkles size={18}/> Templates
            </h2>

            <button
  onClick={onClose}
  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition"
>
  <X size={18}/>
</button>
          </div>

          {/* PROMPT BOX */}
          <div className="p-4 border-b border-white/10">
            <input
              value={prompt}
              onChange={(e)=>setPrompt(e.target.value)}
              placeholder="Describe new template (e.g. internship announcement)"
              className="
w-full px-4 py-3 rounded-xl
border border-gray-200 dark:border-white/10
bg-gray-50 dark:bg-[#111218]
outline-none
focus:ring-2 focus:ring-purple-500/40
"

            />

            <button
              onClick={handleGenerateTemplate}
              className="
mt-3 w-full py-2.5 rounded-xl
bg-gradient-to-r from-purple-600 to-indigo-600
text-white font-medium
hover:opacity-90 transition
"

            >
              {generating ? "Creating..." : "Generate Template"}
            </button>
          </div>

          {/* TEMPLATE LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {templates.map((tpl, i) => (
  <motion.div
    key={tpl.id || i}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => {
  onUseTemplate(tpl);
  onClose();
}}

    className="
      cursor-pointer
      p-4 rounded-xl
      bg-gray-50 hover:bg-white
dark:bg-[#111218] dark:hover:bg-[#16181f]
border border-gray-200 dark:border-white/10
shadow-sm hover:shadow-md

      transition
      group
      relative
      overflow-hidden
    "
  >
    {/* glow effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition blur-2xl bg-purple-500/10"/>

    {/* TITLE */}
    <div className="text-sm font-semibold text-purple-600 dark:text-purple-300 mb-1 relative z-10">
      {tpl.title}
    </div>

    {/* PREVIEW */}
    <div className="text-xs text-gray-600 dark:text-white/60 leading-relaxed line-clamp-3 relative z-10">
      {tpl.structure}
    </div>

    {/* hint */}
    <div className="mt-3 text-[11px] text-purple-400 opacity-0 group-hover:opacity-100 transition relative z-10">
      Click to use template
    </div>
  </motion.div>
))}


          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
