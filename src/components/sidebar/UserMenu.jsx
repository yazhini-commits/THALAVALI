import { LogOut, User, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserMenu({ isOpen }) {
  const navigate = useNavigate();

  return (
    <div className="relative group">
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center">
          S
        </div>

        {isOpen && (
          <div>
            <p className="text-sm font-medium">Siddharth</p>
            <p className="text-xs text-gray-500">
              siddharthb7009@gmail.com
            </p>
          </div>
        )}
      </div>

      {/* DROPDOWN */}
      <div
        className="
          absolute bottom-12 left-0
          w-full rounded-xl
          bg-white dark:bg-[#111]
          border border-black/10 dark:border-white/10
          shadow-xl
          opacity-0 group-hover:opacity-100
          pointer-events-none group-hover:pointer-events-auto
          transition
        "
      >
        {/* Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-purple-600/10"
        >
          <User size={14} />
          Profile
        </button>

        {/* Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-purple-600/10"
        >
          <LayoutDashboard size={14} />
          Dashboard
        </button>

        {/* Divider */}
        <div className="h-px bg-black/10 dark:bg-white/10 my-1" />

        {/* Sign Out */}
        <button
          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-500 hover:text-white"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
