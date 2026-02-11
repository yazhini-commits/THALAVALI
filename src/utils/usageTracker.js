/* =========================================================
   AI USAGE TRACKER
   Handles:
   1) Total usage stats
   2) Usage by type
   3) Daily heatmap activity (GitHub style)
   ========================================================= */

const STATS_KEY = "creator-usage";

/* ---------- SAFE JSON PARSE ---------- */
const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
};

/* ---------- HEATMAP STORAGE ---------- */
const updateDailyUsage = () => {
  const year = new Date().getFullYear();
  const key = `ai_usage_${year}`;

  const data = safeParse(localStorage.getItem(key), {});

  const today = new Date().toISOString().slice(0, 10);

  data[today] = (data[today] || 0) + 1;

  localStorage.setItem(key, JSON.stringify(data));
};

/* ---------- MAIN TRACKER ---------- */
export function trackGeneration(type = "general") {

  /* ---- normal stats ---- */
  const stats = safeParse(localStorage.getItem(STATS_KEY), {
    total: 0,
    byType: {}
  });

  stats.total += 1;
  stats.byType[type] = (stats.byType[type] || 0) + 1;

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));

  /* ---- HEATMAP UPDATE ---- */
  updateDailyUsage();
}

/* ---------- READ STATS ---------- */
export function getUsageStats() {
  return safeParse(localStorage.getItem(STATS_KEY), {
    total: 0,
    byType: {}
  });
}
