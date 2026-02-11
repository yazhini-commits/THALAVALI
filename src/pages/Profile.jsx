import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, saveProfile } from "../utils/profileStorage";
import { ArrowLeft, CheckCircle2, Globe, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

/* ================= LANGUAGES ================= */
const languages = [
  "English",
  "Tamil",
  "Hindi",
  "Malayalam",
  "Telugu",
  "Kannada",
  "Urdu",
];

/* ================= TONES ================= */
const tones = [
  "Professional",
  "Casual",
  "Friendly",
  "Persuasive",
];

/* ================= HEATMAP HELPERS ================= */
const getUsageData = (year) => {
  const raw = localStorage.getItem(`ai_usage_${year}`);
  return raw ? JSON.parse(raw) : {};
};


const getColor = (count) => {
  // empty day (visible cell)
  if (!count)
  return "bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10";
  


  if (count === 1) return "bg-purple-900";
  if (count === 2) return "bg-purple-700";
  if (count === 3) return "bg-purple-500";
  return "bg-purple-400";
};



const generateCalendar = (year) => {
  const usage = getUsageData(year);
  const weeks = [];

  const end = new Date(year, 11, 31);
  const start = new Date(end);
  start.setDate(end.getDate() - 364);

  for (let w = 0; w < 53; w++) {
    const week = [];

    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + (w * 7 + d));

      const key = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 10);

      week.push({
        dateObj: new Date(date),
        date: key,
        count: usage[key] || 0,
      });
    }

    weeks.push(week);
  }

  return weeks;
};

/* ====== create usage storage if missing ====== */
const ensureUsageExists = () => {
  const year = new Date().getFullYear();
  const key = `ai_usage_${year}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify({}));
  }
};

/* ===== DEFAULT AVATAR (AUTO GENERATED INITIALS) ===== */
const getDefaultAvatar = (name = "User") => {
  const initials = name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#4f46e5"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="100" fill="url(#grad)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
      font-size="80" font-family="Inter, Arial" fill="white" font-weight="600">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    tone: "Professional",
    industry: "",
    style: "",
    language: "English",
    avatar: "",
  });

  const [saved, setSaved] = useState(false);
  const [toneOpen, setToneOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const toneRef = useRef(null);
  const langRef = useRef(null);

  const [calendarData, setCalendarData] = useState([]);
  /* ===== DATE FILTER ===== */
const today = new Date();
const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


const [selectedDate, setSelectedDate] = useState(formatDate(today));

const parsedDate = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();

const selectedDay = parsedDate.getDate();
const selectedMonth = parsedDate.getMonth();
const selectedYear = parsedDate.getFullYear();



useEffect(() => {
  if (!selectedDate) return;

  ensureUsageExists();
  const year = new Date(selectedDate).getFullYear();
  setCalendarData(generateCalendar(year));
}, [selectedDate]);





  /* LOAD PROFILE */
  useEffect(() => {
  try {
    const stored = getProfile();

    if (stored && typeof stored === "object") {
      setProfile(prev => ({
        ...prev,
        ...stored
      }));
    }
  } catch (e) {
    console.warn("Profile corrupted. Resetting.");
    localStorage.removeItem("userProfile");
  }
}, []);



  /* CLOSE DROPDOWNS */
  useEffect(() => {
    const handler = (e) => {
      if (toneRef.current && !toneRef.current.contains(e.target))
        setToneOpen(false);
      if (langRef.current && !langRef.current.contains(e.target))
        setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* CLOSE DROPDOWN WITH ESC KEY */
useEffect(() => {
  const keyHandler = (e) => {
    if (e.key === "Escape") {
      setToneOpen(false);
      setLangOpen(false);
    }
  };

  window.addEventListener("keydown", keyHandler);
  return () => window.removeEventListener("keydown", keyHandler);
}, []);


  /* SAVE */
  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => navigate(`${BASE}/home`), 1200);
  };

  return (
    <div className="relative min-h-screen text-gray-900 dark:text-white overflow-hidden">

  {/* Background Image */}
  <div
    className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat scale-105"
    style={{ backgroundImage: "url('/profile-bg.jpg')" }}
  />

  {/* PROFESSIONAL BACKGROUND TINT SYSTEM */}
<div className="absolute inset-0 -z-20 pointer-events-none">

  {/* blur layer */}
  <div className="absolute inset-0 backdrop-blur-[6px]" />

  {/* LIGHT MODE TINT (very important) */}
  <div className="
    absolute inset-0
    bg-white/85
    dark:bg-black/65
  " />

  {/* subtle color depth */}
  <div className="
    absolute inset-0
    bg-gradient-to-br
    from-indigo-100/40
    via-transparent
    to-purple-100/40
    dark:from-indigo-900/20
    dark:to-purple-900/20
  " />

</div>



      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 px-5 py-2.5 rounded-xl
bg-white dark:bg-black/40
border border-gray-200 dark:border-white/10
text-gray-800 dark:text-white
shadow-md hover:shadow-xl
hover:scale-105
transition-all duration-300
hover:scale-105 hover:shadow-2xl
transition-all duration-300 flex items-center gap-2"

      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* PAGE CONTAINER */}
      <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-12 gap-10"
>

                {/* ================= LEFT PROFILE PANEL ================= */}
        <div className="col-span-12 md:col-span-4 space-y-6">

          {/* PROFILE CARD */}
          <div className="rounded-2xl p-6
bg-white dark:bg-[#0f172a]/60
border border-gray-200 dark:border-white/10
shadow-lg dark:shadow-black/40
backdrop-blur-xl
transition-all duration-300">



            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="relative group">

                <img
                  src={profile.avatar || getDefaultAvatar()}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                />

                {/* Upload overlay */}
                <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs cursor-pointer transition">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfile(prev => ({
                          ...prev,
                          avatar: reader.result
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <button
  onClick={() => setProfile(prev => ({ ...prev, avatar: "" }))}
  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded-md bg-white/70 dark:bg-black/40
border border-white/20 dark:border-white/10
backdrop-blur-md
focus:outline-none
focus:ring-2 focus:ring-purple-500
"
>
  Remove
</button>


              </div>

              <div>
                <h2 className="text-lg font-semibold">Your AI Profile</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personalization dashboard
                </p>
              </div>
            </div>

            {/* Language Display */}
            <div className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3
bg-gray-50 dark:bg-black/40
border border-gray-200 dark:border-white/10
backdrop-blur-md shadow-inner">

              <Globe size={18}/>
              <div>
                <p className="text-sm font-medium">Output Language</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{profile.language}</p>
              </div>
            </div>

          </div>


          {/* ================= ACTIVITY HEATMAP ================= */}
          <div className="rounded-2xl p-6
bg-white dark:bg-[#0f172a]/60
border border-gray-200 dark:border-white/10
shadow-lg dark:shadow-black/40
backdrop-blur-xl
transition-all duration-300">



            <h3 className="text-sm font-medium mb-4">
              Content Creation Activity
            </h3>
            {/* ===== DATE PICKER ===== */}
<div className="mb-4 flex items-center justify-between">

  <div className="text-xs text-gray-600 dark:text-gray-400">
    Select Date
  </div>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="
rounded-lg
px-3 py-1.5
text-xs
text-gray-900 dark:text-white
bg-gray-50 dark:bg-black/40
border border-gray-300 dark:border-white/10
focus:outline-none
focus:ring-2 focus:ring-purple-500
focus:bg-white dark:focus:bg-black/60
transition-all duration-200"


  />

</div>


            {/* Months */}
            <div className="grid grid-cols-12 text-[10px] text-gray-600 dark:text-gray-400 mb-2 px-1">
              <span className="text-center">Jan</span>
              <span className="text-center">Feb</span>
              <span className="text-center">Mar</span>
              <span className="text-center">Apr</span>
              <span className="text-center">May</span>
              <span className="text-center">Jun</span>
              <span className="text-center">Jul</span>
              <span className="text-center">Aug</span>
              <span className="text-center">Sep</span>
              <span className="text-center">Oct</span>
              <span className="text-center">Nov</span>
              <span className="text-center">Dec</span>
            </div>

            {/* Heatmap */}
            <div className="flex gap-[2px] overflow-hidden">
              {calendarData.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={`${day.date} • ${day.count} generations`}
                      className={`w-[12px] h-[12px] rounded-[4px] shadow-inner transition-all duration-200
${getColor(day.count)}
${day.date === selectedDate
  ? "ring-2 ring-purple-400 scale-125"
  : "hover:scale-125 hover:shadow-lg"}
`}

                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-4">
              <span>Less</span>
              <div className="w-3 h-3 bg-[#161b22] border border-[#30363d] rounded-sm"/>
              <div className="w-3 h-3 bg-purple-900 rounded-sm"/>
              <div className="w-3 h-3 bg-purple-700 rounded-sm"/>
              <div className="w-3 h-3 bg-purple-500 rounded-sm"/>
              <div className="w-3 h-3 bg-purple-400 rounded-sm"/>
              <span>More</span>
            </div>

          </div>

        </div>
                {/* ================= RIGHT SETTINGS PANEL ================= */}
        <div className="col-span-12 md:col-span-8">

          <div className="rounded-2xl p-6
bg-white dark:bg-[#0f172a]/60
border border-gray-200 dark:border-white/10
shadow-lg dark:shadow-black/40
backdrop-blur-xl
transition-all duration-300
overflow-visible">




            {/* PAGE TITLE */}
            <div className="border-b border-gray-200 dark:border-[#30363d] pb-5">
              <h1 className="text-2xl font-semibold">Profile Preferences</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Control how AI generates content for you
              </p>
            </div>

            {/* DEFAULT TONE */}
            <div ref={toneRef} className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
                Default Tone
              </label>

              <button
                type="button"
                onClick={() => setToneOpen(!toneOpen)}
                className="relative z-10 w-full flex items-center justify-between px-4 py-3 rounded-lg
bg-white/70 dark:bg-black/40
border border-white/20 dark:border-white/10
backdrop-blur-md
hover:bg-white/80 dark:hover:bg-black/60
transition-all duration-200"
              >
                <span>{profile.tone}</span>
                <ChevronDown
                  size={18}
                  className={`transition ${toneOpen ? "rotate-180" : ""}`}
                />
              </button>

              {toneOpen && (
  <div
    className="
    absolute left-0 top-full mt-2 w-full
    rounded-xl
    bg-white dark:bg-[#0b1220]
    border border-gray-200 dark:border-white/10
    shadow-2xl
    z-[100]
    overflow-hidden
    animate-in fade-in zoom-in-95 duration-150
    "
  >

                  {tones.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => {
                        setProfile({ ...profile, tone });
                        setToneOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm
hover:bg-white/70 dark:hover:bg-white/10
transition ${
                        profile.tone === tone
  ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
  : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* OUTPUT LANGUAGE SELECTOR */}
            <div ref={langRef} className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
                Output Language (Content Generation Language)
              </label>

              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="relative z-10 w-full flex items-center justify-between px-4 py-3 rounded-lg
bg-gray-50 dark:bg-black/40
border border-gray-300 dark:border-white/10
text-gray-900 dark:text-white
hover:bg-white dark:hover:bg-black/60
focus:ring-2 focus:ring-purple-500
transition-all duration-200"


              >
                <span className="flex items-center gap-2">
                  <Globe size={16} />
                  {profile.language}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition ${langOpen ? "rotate-180" : ""}`}
                />
              </button>

              {langOpen && (
  <div
    className="
    absolute left-0 top-full mt-2 w-full
    rounded-xl
    bg-white dark:bg-[#0b1220]
    border border-gray-200 dark:border-white/10
    shadow-2xl
    z-[100]
    overflow-y-auto max-h-64
    animate-in fade-in zoom-in-95 duration-150
    "
  >

                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setProfile({ ...profile, language: lang });
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm
hover:bg-white/70 dark:hover:bg-white/10
transition ${

                        profile.language === lang 
  ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
  : "text-gray-700 dark:text-gray-200"

                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500">
                AI will generate the final content in this language automatically.
              </p>
            </div>

            {/* INDUSTRY */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
                Industry / Domain
              </label>

              <input
                value={profile.industry}
                onChange={(e) =>
                  setProfile({ ...profile, industry: e.target.value })
                }
                placeholder="Example: Marketing, Education, SaaS, Finance"
                className="w-full px-4 py-3 rounded-lg
text-gray-900 dark:text-white
bg-gray-50 dark:bg-black/40
border border-gray-300 dark:border-white/10
focus:outline-none
focus:ring-2 focus:ring-purple-500
focus:bg-white dark:focus:bg-black/60
placeholder:text-gray-400
transition-all duration-200"


              />

              <p className="text-xs text-gray-500">
                Helps AI tailor vocabulary and examples.
              </p>
            </div>

            {/* WRITING STYLE */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
                Writing Style
              </label>

              <input
                value={profile.style}
                onChange={(e) =>
                  setProfile({ ...profile, style: e.target.value })
                }
                placeholder="Example: Storytelling, Analytical, Minimal, Conversational"
                className="w-full px-4 py-3 rounded-lg
text-gray-900 dark:text-white
bg-gray-50 dark:bg-black/40
border border-gray-300 dark:border-white/10
focus:outline-none
focus:ring-2 focus:ring-purple-500
focus:bg-white dark:focus:bg-black/60
placeholder:text-gray-400
transition-all duration-200"


              />

              <p className="text-xs text-gray-500">
                Defines how the AI structures sentences and tone.
              </p>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-6 border-t border-gray-200 dark:border-[#30363d]">
              <motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.07 }}
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.35 }}

                onClick={handleSave}
                className="w-full py-3 rounded-xl
bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600
hover:from-purple-600 hover:via-indigo-600 hover:to-purple-700
shadow-lg hover:shadow-2xl
transition-all duration-300
font-semibold tracking-wide
text-white"

              >
                Save Preferences
              </motion.button>

              {saved && (
                <div className="flex items-center gap-2 text-green-400 text-sm mt-4 justify-center">
                  <CheckCircle2 size={18} />
                  Preferences saved successfully
                </div>
              )}
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}
