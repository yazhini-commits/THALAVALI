import { X, Minus } from "lucide-react";

export default function FloatingPanel({
  title,
  content,
  onClose,
  onMinimize,
}) {
  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2
    w-[720px] backdrop-blur-xl bg-black/70 border border-white/10
    rounded-2xl shadow-2xl z-30">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-sm font-medium">{title}</span>

        <div className="flex gap-2">
          <button onClick={onMinimize}>
            <Minus size={16}/>
          </button>
          <button onClick={onClose}>
            <X size={16}/>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-auto text-sm">
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="prose prose-invert max-w-none"
        />
      </div>
    </div>
  );
}
