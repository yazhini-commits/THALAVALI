import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Lightbulb,
  Download ,
} from "lucide-react";
import { analyzeContent } from "../services/analysisService";
import UsageStats from "../components/analytics/UsageStats";
import { getHistory } from "../utils/historyStorage";
import { useEffect, useState } from "react";
import { getChatPrimaryType } from "../utils/historyStorage";

export default function Dashboard() {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);
  const [quality, setQuality] = useState(null);
  const [loadingQuality, setLoadingQuality] = useState(false);
  const history = getHistory();
  
  const latestContent = (() => {
  if (!history.length) return "";

  const latestChat = [...history]
  .reverse()
  .find(chat =>
    chat.messages?.some(m => m.role === "assistant" && m.content?.trim())
  );

  if (!latestChat?.messages) return "";

  const lastAssistant = [...latestChat.messages]
    .reverse()
    .find((m) => m.role === "assistant");

  return lastAssistant?.content || "";
})();
  
useEffect(() => {
  if (!latestContent) return;
  setPulse(true);
  setLoadingQuality(true);

  analyzeContent(latestContent)
    .then((res) => {
const rawSuggestions =
  res.suggestions ||
  res.metrics?.suggestions ||
  res.metrics?.improvements ||
  [];

const normalizedSuggestions = Array.isArray(rawSuggestions)
  ? rawSuggestions
  : typeof rawSuggestions === "string"
  ? rawSuggestions.split(".").filter(Boolean)
  : [];

const safeSuggestions = normalizedSuggestions
  .map((s) => {
    if (typeof s === "string") return s;
    if (typeof s === "object" && s !== null) {
      return s.text || s.suggestion || "";
    }
    return "";
  })
  .filter(Boolean);

const enrichedSuggestions =
  safeSuggestions.length > 0
    ? safeSuggestions.map((text) => {
        const lower = text.toLowerCase();
        let severity = "Low";

        if (lower.includes("clarity") || lower.includes("structure")) {
          severity = "High";
        } else if (lower.includes("engage") || lower.includes("hook")) {
          severity = "Medium";
        }

        return {
          text,
          severity,
          reason:
            severity === "High"
              ? "This issue strongly impacts readability and comprehension."
              : severity === "Medium"
              ? "This can improve engagement and reader retention."
              : "This is a minor enhancement for polish.",
        };
      })
    : [
        {
          text: "Improve clarity by shortening long sentences",
          severity: "High",
          reason: "Long sentences reduce readability and clarity.",
        },
        {
          text: "Add a stronger opening hook to engage readers",
          severity: "Medium",
          reason: "A strong opening improves reader engagement.",
        },
        {
          text: "Use subheadings or bullet points for better readability",
          severity: "Low",
          reason: "Formatting helps users scan content easily.",
        },
      ];

setQuality({
  readability: Math.max(res.metrics?.readability || 0, 1),
  sentiment: res.metrics?.sentiment?.label || "Neutral",
  sentiment_score: Math.abs(res.metrics?.sentiment?.score || 0.3),
  keywords: res.metrics?.keywords || [],
  engagement: res.metrics?.engagement || 0,
  suggestions: enrichedSuggestions,
});



    })
    .catch(console.error)
    .finally(() => {
  setLoadingQuality(false);
  setTimeout(() => setPulse(false), 1200);
});

}, [latestContent]);


  const today = new Date().toDateString();

  /* ---------------- AGGREGATIONS ---------------- */

  // Total generations
  const totalGenerations = history.length;

  // Content type count
  const contentStats = history.reduce((acc, chat) => {
  const type = getChatPrimaryType(chat);
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

  // Most used content type
  const mostUsedType =
    Object.entries(contentStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // Words generated today
  const wordsToday = history.reduce((total, chat) => {
    if (new Date(chat.createdAt).toDateString() === today) {
      const words =
        chat.messages?.reduce(
          (sum, m) => sum + (m.content?.split(/\s+/).length || 0),
          0
        ) || 0;
      return total + words;
    }
    return total;
  }, 0);


  /* ---------------- PIE CHART DATA ---------------- */

  const pieData = Object.entries(contentStats);
  const totalForPie = pieData.reduce((s, [, v]) => s + v, 0);

  let cumulative = 0;
  const pieSlices = pieData.map(([type, count], i) => {
    const value = (count / totalForPie) * 100;
    const start = cumulative;
    cumulative += value;

    const colors = [
      "#7c3aed",
      "#22c55e",
      "#0ea5e9",
      "#f97316",
      "#ec4899",
    ];

    return {
      type,
      value,
      start,
      color: colors[i % colors.length],
    };
  });

  const yesterdayWords = history.reduce((total, chat) => {
  const d = new Date(chat.createdAt);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === yesterday.toDateString()) {
    return (
      total +
      (chat.messages?.reduce(
        (s, m) => s + (m.content?.split(/\s+/).length || 0),
        0
      ) || 0)
    );
  }
  return total;
}, 0);

const productivityUp = wordsToday >= yesterdayWords;
const handleDownloadAnalysis = () => {
  if (!quality) return;

  const data = {
    readability: quality.readability,
    sentiment: quality.sentiment,
    engagement: quality.engagement,
    keywords: quality.keywords,
    suggestions: quality.suggestions,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content-analysis-report.json";
  a.click();
  URL.revokeObjectURL(url);
};

  return (
    <div
      className="min-h-screen text-gray-900 dark:text-white p-10 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bg-content.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        <div className="flex items-center justify-between mb-4">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
    <p className="text-sm opacity-70 mt-1">
      AI-powered insights from your content generation
    </p>
  </div>

  <div className="flex items-center gap-4">
    {pulse && (
      <span className="flex items-center gap-2 text-xs px-3 py-1 rounded-full
      bg-green-500/10 text-green-600 border border-green-500/20">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
        Live analytics
      </span>
    )}

    <button
      onClick={() => navigate(`${BASE}/home`)}
      className="px-5 py-2 rounded-xl text-sm font-medium
      bg-gradient-to-r from-purple-500 to-pink-500 text-white
      hover:scale-105 transition shadow-lg"
    >
      + Generate Content
    </button>
  </div>
</div>


        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`transition-all duration-500 ${
  pulse ? "ring-2 ring-green-400/40" : ""
}`}>
  <UsageStats history={history} />
</div>


          {/* INSIGHTS */}
          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <h2 className="text-lg font-semibold mb-4">Insights</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
  <p className="text-xs opacity-60">Total Generations</p>
  <p className="text-xl font-semibold">{totalGenerations}</p>
</div>

<div>
  <p className="text-xs opacity-60">Top Format</p>
  <p className="text-xl font-semibold">{mostUsedType}</p>
</div>

<div>
  <p className="text-xs opacity-60">Words Today</p>
  <p className="text-xl font-semibold">{wordsToday}</p>
</div>

<div>
  <p className="text-xs opacity-60">Productivity</p>
  <p
    className={`text-xl font-semibold ${
      productivityUp ? "text-green-600" : "text-red-500"
    }`}
  >
    {productivityUp ? (
  <span className="flex items-center gap-1 text-green-500">
    <TrendingUp size={16} /> Up
  </span>
) : (
  <span className="flex items-center gap-1 text-red-500">
    <TrendingDown size={16} /> Down
  </span>
)}

  </p>
</div>
</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-10 mb-4">
  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
    Content Quality Analysis
  </h2>

  {quality && (
    <button
      onClick={handleDownloadAnalysis}
      className="flex items-center gap-2 px-4 py-2 rounded-lg
      bg-purple-500/10 text-purple-600
      hover:bg-purple-500 hover:text-white
      transition-all duration-300 shadow-sm"
    >
      <Download size={16} />
      Download Report
    </button>
  )}
</div>


{loadingQuality && (
  <div className="text-center text-sm opacity-60 animate-pulse">
    Analyzing latest content quality…
  </div>
)}

{!loadingQuality && quality && (
  <p className="text-xs text-center opacity-50">
    Analysis based on your most recent generated content
  </p>
)}



{/* ================= ANALYTICS ================= */}
{quality && (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* READABILITY */}
    <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <h2 className="font-semibold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Readability
      </h2>

      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full rotate-[-90deg]">
          <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="#7c3aed"
            strokeWidth="12"
            fill="none"
            strokeDasharray={440}
            strokeDashoffset={440 - (440 * quality.readability) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{quality.readability}</span>
          <span className="text-xs opacity-60">Readability</span>
        </div>
      </div>
    </div>

    {/* ENGAGEMENT & SENTIMENT */}
    <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <h2 className="font-semibold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Engagement & Sentiment
      </h2>

      <span className={`inline-block px-3 py-1 rounded-full text-xs mb-3
        ${quality.sentiment === "Positive"
          ? "bg-green-500/10 text-green-600"
          : quality.sentiment === "Negative"
          ? "bg-red-500/10 text-red-600"
          : "bg-blue-500/10 text-blue-600"
        }`}>
        {quality.sentiment} Sentiment
      </span>

      <div className="h-3 rounded-full bg-black/10 dark:bg-white/10 mb-6">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${
            quality.sentiment === "Positive"
              ? "bg-green-500"
              : quality.sentiment === "Negative"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${Math.abs(quality.sentiment_score) * 100}%` }}
        />
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-purple-600">
          {quality.engagement}%
        </div>
        <p className="text-xs opacity-60">Engagement Potential</p>
      </div>
    </div>

    {/* KEYWORDS */}
    <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <h2 className="font-semibold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Keyword Density
      </h2>

      {quality.keywords.map((k) => (
        <div key={k.keyword} className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>{k.keyword}</span>
            <span>{k.density}%</span>
          </div>
          <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full">
            <div
              className="h-2 bg-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${k.density}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    {/* SUGGESTIONS */}
    <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <h2 className="font-semibold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Suggestions
      </h2>

      {quality.suggestions.length === 0 ? (
  <div className="text-sm opacity-60 text-center py-6">
    No actionable suggestions available for this content.
  </div>
) : (
  <ul className="space-y-3 text-sm">
    {quality.suggestions.map((s, i) => (
      <li
        key={i}
        onClick={() =>
          navigate("/home", {
            state: { improveWith: s.text },
          })
        }
        className="cursor-pointer group flex flex-col gap-2
        bg-purple-500/10 px-4 py-3 rounded-xl
        transition-all duration-300
        hover:bg-purple-500/20 hover:scale-[1.02]"
      >
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="text-purple-500 mt-0.5" />

          <span className="flex-1">{s.text}</span>

          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${
              s.severity === "High"
                ? "bg-red-500/20 text-red-600"
                : s.severity === "Medium"
                ? "bg-yellow-500/20 text-yellow-700"
                : "bg-green-500/20 text-green-600"
            }`}
          >
            {s.severity}
          </span>
        </div>

        <p className="text-xs opacity-60 pl-7">
          {s.reason}
        </p>

        <p className="text-[11px] text-purple-600 opacity-0 group-hover:opacity-100 transition">
          Click to improve content →
        </p>
      </li>
    ))}
  </ul>
)}


    </div>
  </div>
)}

{/* ================= TREND ================= */}
<div className="mt-8 bg-white/80 dark:bg-black/60 rounded-2xl p-6 border border-black/10 dark:border-white/10 shadow-xl">
  <p className="text-sm font-semibold mb-4">Recent Generation Trend</p>

  <svg width="100%" height="90">
    {/* baseline */}
    <line x1="0" y1="70" x2="100%" y2="70" stroke="#e5e7eb" strokeWidth="1" />

    {/* LINE */}
    <polyline
      fill="none"
      stroke="#22c55e"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      points={history.slice(-10).map((chat, i) => {
        const words =
          chat.messages?.reduce(
            (s, m) => s + (m.content?.split(/\s+/).length || 0),
            0
          ) || 0;

        return `${i * 35},${70 - Math.min(words / 5, 55)}`;
      }).join(" ")}
    />

    {/* DOTS */}
    {history.slice(-10).map((chat, i) => {
      const words =
        chat.messages?.reduce(
          (s, m) => s + (m.content?.split(/\s+/).length || 0),
          0
        ) || 0;

      const x = i * 35;
      const y = 70 - Math.min(words / 5, 55);

      return (
        <circle key={chat.chatId} cx={x} cy={y} r="4" fill="#22c55e">
          <title>{`${chat.title || "Session"} – ${words} words`}</title>
        </circle>
      );
    })}
  </svg>

  <p className="text-xs opacity-60 text-center mt-2">
    Based on words generated per session
  </p>
</div>




        {/* RECENT ACTIVITY */}
        <div className="mt-8 bg-white/90 dark:bg-black/70 border border-black/10 dark:border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
  Recent Activity
</h2>


          <div className="space-y-2 text-sm">
            {history.slice(0, 5).map((chat) => (
              <div
  key={chat.chatId}
  onClick={() => navigate(`/history/${chat.chatId}`)}
  className="cursor-pointer flex justify-between items-center px-4 py-3 rounded-xl
  bg-black/5 dark:bg-white/10 hover:bg-purple-500/10
  hover:scale-[1.02] transition-all duration-300"
>


                <span className="truncate">{chat.title || "Untitled content"}</span>
                <span className="px-3 py-1 text-xs rounded-full bg-purple-500/10 text-purple-600">
  {getChatPrimaryType(chat)}
</span>

              </div>
            ))}

            {history.length === 0 && (
              <p className="opacity-60">No activity yet</p>
            )}
            
          </div>
          
        </div>
        <p className="text-center text-xs opacity-50 mt-10">
  Powered by AI-driven content intelligence
</p>

      </div>
    </div>
    
  );
}
