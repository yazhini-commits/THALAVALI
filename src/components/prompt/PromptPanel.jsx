import { useContext, useEffect } from "react";
import { PromptContext } from "../../context/PromptContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";

export default function PromptPanel() {

  const {
    promptPanelOpen,
    setPromptPanelOpen,
    editablePrompt,
    setEditablePrompt,
    finalPrompt,
    setHasCustomPrompt
  } = useContext(PromptContext);

  // load generated prompt when panel opens
  useEffect(() => {
  if (!promptPanelOpen) return;

  // load preview only first open
  setEditablePrompt(prev =>
    prev && prev.length > 5 ? prev : finalPrompt
  );

}, [promptPanelOpen]);

useEffect(() => {
  setPromptPanelOpen(false);
}, [finalPrompt === ""]);

  const handleSave = () => {
    setHasCustomPrompt(true);
    setPromptPanelOpen(false);
  };

  return (
    <AnimatePresence>
      {promptPanelOpen && (
        <motion.div
          initial={{ x: 450 }}
          animate={{ x: 0 }}
          exit={{ x: 450 }}
          transition={{ duration: 0.35 }}
          className="fixed right-8 top-20 h-full w-[520px] z-[70]
          bg-white dark:bg-[#0b0c10]
          border-l border-black/10 dark:border-white/10
          shadow-2xl flex flex-col"
        >
          {/* Header */}

          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="font-semibold text-lg">LLM Prompt Editor</h2>
            <div className="mt-2 flex items-center gap-2 text-xs">
  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
  <span className="opacity-60">Manual Prompt Override Active</span>
</div>


            <button onClick={() => setPromptPanelOpen(false)}>
              <X/>
            </button>
          </div>

          {/* Editor */}
          <div className="flex-1 p-5">
            <textarea
              value={editablePrompt}
              onChange={(e) => setEditablePrompt(e.target.value)}
              className="w-full h-full resize-none
              bg-black/5 dark:bg-white/5
              border border-white/10
              rounded-xl p-4 text-sm leading-relaxed
              focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          {/* Save */}
          <div className="p-5 border-t border-white/10">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl
              bg-gradient-to-r from-purple-600 to-indigo-500
              text-white font-medium flex items-center justify-center gap-2"
            >
              <Save size={18}/>
              Save Prompt
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
