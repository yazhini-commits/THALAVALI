import { motion } from "framer-motion";

export default function ABLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-10">

      {/* Brain pulse */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 blur-sm"
      />

      {/* typing bars */}
      <div className="w-full space-y-3">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="h-3 rounded bg-purple-400/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <motion.p
  animate={{ opacity: [0.4, 1, 0.4] }}
  transition={{ repeat: Infinity, duration: 2 }}
  className="text-sm tracking-widest font-medium"
>
  TESTING PROMPTS
</motion.p>

<p className="text-xs opacity-60">
  analyzing • comparing • evaluating
</p>
    </div>
  );
}
