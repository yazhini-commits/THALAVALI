import { motion, AnimatePresence } from "framer-motion";

export default function VariationModal({
  open,
  variations = [],
  onClose,
  onSelect,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-full max-w-5xl bg-white dark:bg-[#0b0c10] rounded-2xl p-6 shadow-2xl relative"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Choose a Variation
              </h2>
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm rounded-full bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white transition"
              >
                Close
              </button>
            </div>

            {/* BODY */}
            {variations.length === 0 ? (
              <p className="text-center text-sm opacity-60 py-20">
                Generating variations…
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {variations.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl p-4 bg-gray-50 dark:bg-black/60 border border-black/10 dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition"
                  >
                    <p className="text-sm whitespace-pre-wrap mb-4">{v}</p>

                    <button
                      onClick={() => onSelect(v)}
                      className="w-full py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:scale-105 transition"
                    >
                      Use this variation
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
