import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function SideBySideCompare({ results, onSelect }) {
  const [copied, setCopied] = useState(null);

  return (
    <div className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur flex items-center justify-center">
      <div className="bg-white dark:bg-black rounded-2xl w-[90%] max-w-6xl p-6
        border border-black/10 dark:border-white/10">

        <h2 className="text-xl font-semibold mb-6 text-center">
          Compare Generated Variations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((text, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-white/5 p-5 rounded-xl
              border border-black/10 dark:border-white/10"
            >
              <div className="whitespace-pre-wrap text-sm mb-4 max-h-[300px] overflow-y-auto">
                {text}
              </div>

              <div className="flex justify-between text-xs opacity-70">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(text);
                    setCopied(i);
                    setTimeout(() => setCopied(null), 1000);
                  }}
                  className="flex items-center gap-1"
                >
                  {copied === i ? <Check size={14} /> : <Copy size={14} />}
                  Copy
                </button>

                <button
                  onClick={() => onSelect(text)}
                  className="text-purple-600 font-medium"
                >
                  Use this
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
