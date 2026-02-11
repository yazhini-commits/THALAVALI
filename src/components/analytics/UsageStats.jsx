import { getChatPrimaryType } from "../../utils/historyStorage";

export default function UsageStats({ history }) {
  const stats = history.reduce(
    (acc, chat) => {
      acc.total += 1;

      const type = getChatPrimaryType(chat); // ✅ FIXED
      acc.byType[type] = (acc.byType[type] || 0) + 1;

      return acc;
    },
    { total: 0, byType: {} }
  );

  return (
    <div
      className="bg-white/80 dark:bg-black/60 backdrop-blur-xl
      border border-black/10 dark:border-white/10
      rounded-2xl p-6 shadow-xl
      transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <h2 className="text-lg font-semibold mb-4">Usage Analytics</h2>

      <p className="text-sm mb-4 opacity-80">
        Total Generations: <b>{stats.total}</b>
      </p>

      {Object.keys(stats.byType).length === 0 && (
        <p className="text-sm opacity-60">No usage data yet</p>
      )}

      <div className="space-y-4">
        {Object.entries(stats.byType).map(([type, count]) => {
          const percentage = Math.round((count / stats.total) * 100);

          return (
            <div key={type} className="space-y-1 group">
              <div className="flex justify-between text-sm font-medium">
                <span className="capitalize">{type}</span>
                <span className="opacity-70">
                  {count} • {percentage}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-2 rounded-full
                  bg-gradient-to-r from-purple-500 to-pink-500
                  transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
