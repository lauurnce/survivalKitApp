'use client';

interface Stats {
  total_feedback: number;
  avg_app_rating: number;
  avg_module_rating: number;
  pct_approved: number;
  total_codes_generated: number;
  total_codes_redeemed: number;
}

export function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Feedback</div>
        <div className="text-2xl font-bold">{stats.total_feedback}</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Avg App Rating</div>
        <div className="text-2xl font-bold">{stats.avg_app_rating.toFixed(1)} ⭐</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Module Rating</div>
        <div className="text-2xl font-bold">{stats.avg_module_rating.toFixed(1)} ⭐</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Approved %</div>
        <div className="text-2xl font-bold">{stats.pct_approved}%</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Codes Generated</div>
        <div className="text-2xl font-bold">{stats.total_codes_generated}</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Codes Redeemed</div>
        <div className="text-2xl font-bold">{stats.total_codes_redeemed}</div>
      </div>
    </div>
  );
}
