import {
  Briefcase,
  Mail,
  Megaphone,
  FileText,
  Twitter,
  Layers,
} from "lucide-react";

const cards = [
  { label: "LinkedIn Post", icon: Briefcase },
  { label: "Email Draft", icon: Mail },
  { label: "Ad Copy", icon: Megaphone },
  { label: "Blog Intro", icon: FileText },
  { label: "Tweet", icon: Twitter },
  { label: "General", icon: Layers },
];

export default function ContentCards({ selectedType, onSelect }) {
  return (
    <div className="flex justify-center gap-6">
      {cards.map((item) => {
        const Icon = item.icon;
        const active = selectedType === item.label;

        return (
          <button
            key={item.label}
            onClick={() => onSelect(item.label)}
            className={`
              group w-44 h-28 rounded-2xl
              backdrop-blur-xl
              border
              bg-white/70 dark:bg-white/5
              border-black/10 dark:border-white/10
              flex flex-col items-center justify-center gap-2
              transition-all duration-300 ease-out
              hover:-translate-y-2
              hover:border-purple-500
              hover:bg-white dark:hover:bg-white/10
              ${active ? "border-purple-500 bg-purple-600/10 dark:bg-purple-600/20" : ""}
            `}
          >
            {/* ICON */}
            <div
              className="
                w-11 h-11 rounded-xl
                bg-purple-600/15
                flex items-center justify-center
                group-hover:bg-purple-600
                group-hover:scale-110
                transition
              "
            >
              <Icon
                size={22}
                className="
                  text-purple-600
                  dark:text-purple-400
                  group-hover:text-white
                "
              />
            </div>

            {/* TEXT */}
            <span
              className="
                text-sm font-semibold
                text-gray-900 dark:text-white
              "
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
