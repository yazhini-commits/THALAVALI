import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutTemplate, FlaskConical } from "lucide-react";

export default function TemplatesBar({
  selectedType,
  onOpenTemplates,
  onOpenAB,
}) {
  const { advancedMode } = useContext(ThemeContext);

  if (!advancedMode || !selectedType) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 70 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 70 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          fixed right-7 top-1/2 -translate-y-1/2
          z-[70]
          flex flex-col gap-4
        "
      >

        {/* ================= TEMPLATE ICON ================= */}
        <motion.button
          whileHover={{ y: -4, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenTemplates}
          className="
            relative group
            w-14 h-14 rounded-2xl
            flex items-center justify-center

            backdrop-blur-2xl
            bg-white/70 dark:bg-white/5
            border border-black/10 dark:border-white/10

            text-purple-600 dark:text-purple-400
            shadow-lg dark:shadow-[0_10px_30px_rgba(139,92,246,0.35)]
            transition-all duration-300
          "
        >
          <LayoutTemplate size={22} />

          {/* hover glow */}
          <span className="
            absolute inset-0 rounded-2xl
            opacity-0 group-hover:opacity-100
            blur-xl bg-purple-500/30
            transition duration-500
          "/>

          {/* tooltip */}
          <span className="
            pointer-events-none
            absolute right-16 top-1/2 -translate-y-1/2
            opacity-0 group-hover:opacity-100
            px-3 py-1.5 rounded-lg
            text-xs font-medium
            bg-black text-white
            whitespace-nowrap
            transition duration-300
          ">
            Templates
          </span>
        </motion.button>


        {/* ================= A/B TEST ICON ================= */}
        <motion.button
          whileHover={{ y: -4, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenAB}
          className="
            relative group
            w-14 h-14 rounded-2xl
            flex items-center justify-center

            backdrop-blur-2xl
            bg-white/70 dark:bg-white/5
            border border-black/10 dark:border-white/10

            text-indigo-600 dark:text-indigo-400
            shadow-lg dark:shadow-[0_10px_30px_rgba(99,102,241,0.35)]
            transition-all duration-300
          "
        >
          <FlaskConical size={22} />

          <span className="
            absolute inset-0 rounded-2xl
            opacity-0 group-hover:opacity-100
            blur-xl bg-indigo-500/30
            transition duration-500
          "/>

          <span className="
            pointer-events-none
            absolute right-16 top-1/2 -translate-y-1/2
            opacity-0 group-hover:opacity-100
            px-3 py-1.5 rounded-lg
            text-xs font-medium
            bg-black text-white
            whitespace-nowrap
            transition duration-300
          ">
            A/B Testing
          </span>
        </motion.button>

      </motion.div>
    </AnimatePresence>
  );
}
