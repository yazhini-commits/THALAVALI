export default function KeyHint({ keys = [] }) {
  return (
    <span className="ml-2 inline-flex items-center gap-1">
      {keys.map((k, i) => (
        <kbd
          key={i}
          className="
            px-1.5 py-0.5
            text-[10px] font-semibold
            rounded-md
            text-gray-700 dark:text-gray-300
            backdrop-blur
            shadow-sm
          "
        >
          {k}
        </kbd>
      ))}
    </span>
  );
}
