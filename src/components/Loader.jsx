import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-[#0b0b14] flex items-center justify-center z-[9999]">
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-4 h-4 bg-purple-500 rounded-full"
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
