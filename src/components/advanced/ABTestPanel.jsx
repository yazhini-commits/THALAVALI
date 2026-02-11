import { motion, AnimatePresence } from "framer-motion";
import { X, FlaskConical } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { ABContext } from "../../context/ABContext";
import { useNavigate } from "react-router-dom";

export default function ABTestPanel({ open, onClose, selectedType }) {

  const [promptA, setPromptA] = useState("");
  const [promptB, setPromptB] = useState("");
  const { startABTest } = useContext(ABContext);
const navigate = useNavigate();

  // reset when opened
  useEffect(() => {
    if (open) {
      setPromptA("");
      setPromptB("");
    }
  }, [open]);

  const handleGenerate = () => {
  if (!promptA.trim() || !promptB.trim()) return;

  startABTest({
    type: selectedType,
    promptA,
    promptB,
  });

  onClose();
  navigate(`${BASE}/home`);;
};


  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-md"
            onClick={onClose}
          />

          {/* PANEL */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="
              fixed z-[90]
              top-40 right-[90px] -translate-y-1/2
              w-[560px]
              rounded-2xl
              bg-white/95 dark:bg-[#0b0c10]/95 backdrop-blur-2xl
              border border-black/10 dark:border-white/10
              shadow-[0_30px_80px_rgba(0,0,0,0.45)]
              p-6
            "
          >

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400">
                  <FlaskConical size={18}/>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    A/B Prompt Testing
                  </h2>
                  <p className="text-xs opacity-60">
                    Compare two prompt styles for {selectedType}
                  </p>
                </div>
              </div>

              <button onClick={onClose}>
                <X/>
              </button>
            </div>

            {/* PROMPT A */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block text-purple-500">
                Prompt A
              </label>

              <textarea
                value={promptA}
                onChange={(e)=>setPromptA(e.target.value)}
                placeholder="Write your first prompt version..."
                className="
                  w-full h-28 resize-none
rounded-xl p-3
bg-gray-100 dark:bg-white/5
border border-gray-200 dark:border-white/10
focus:outline-none
focus:ring-2 focus:ring-purple-500/40
text-gray-800 dark:text-white
placeholder-gray-400
                "
              />
            </div>

            {/* PROMPT B */}
            <div>
              <label className="text-sm font-medium mb-2 block text-indigo-400">
                Prompt B
              </label>

              <textarea
                value={promptB}
                onChange={(e)=>setPromptB(e.target.value)}
                placeholder="Write an alternative approach..."
                className="
                  w-full h-28 resize-none
                  rounded-xl p-3
                  bg-black/5 dark:bg-white/5
                  border border-white/10
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                "
              />
            </div>

            {/* GENERATE BUTTON */}
            <button
              onClick={handleGenerate}
              className="
                mt-6 w-full py-3 rounded-xl
                bg-gradient-to-r from-purple-600 to-indigo-500
                text-white font-semibold
                hover:scale-[1.02] active:scale-[0.98]
                transition
              "
            >
              Generate Comparison
            </button>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
