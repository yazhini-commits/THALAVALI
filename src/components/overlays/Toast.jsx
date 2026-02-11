import { useEffect } from "react";

export default function Toast({
  show,
  message,
  type = "success",
  duration = 2500,
  onClose,
}) {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
  <div className="pointer-events-none fixed inset-0 z-[9999] flex justify-center items-start pt-8">
    <div
      className={`
        pointer-events-auto
        px-6 py-3 rounded-xl text-white font-medium shadow-2xl
        backdrop-blur-lg border
        animate-[toastSlide_0.35s_ease,toastFade_0.35s_ease]
        ${type === "error"
          ? "bg-red-600/95 border-red-400/40"
          : "bg-green-600/95 border-green-400/40"}
      `}
    >
      {message}
    </div>
  </div>
);

}
