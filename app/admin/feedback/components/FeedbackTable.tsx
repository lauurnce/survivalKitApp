'use client';

interface Feedback {
  id: string;
  created_at: string;
  module_name: string;
  app_rating: number;
  module_rating: number;
  feedback_text: string;
  user_email: string | null;
  is_anonymous: boolean;
  is_quality_approved: boolean;
  coupon_code: string | null;
}

export function FeedbackTable({
  data,
  onSort,
  currentSort,
}: {
  data: Feedback[];
  onSort: (column: string) => void;
  currentSort: string;
}) {
  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left px-4 py-3">
              <button onClick={() => onSort('created_at')} className="font-semibold hover:underline">
                Date {currentSort === 'created_at' ? '↓' : ''}
              </button>
            </th>
            <th className="text-left px-4 py-3">
              <button onClick={() => onSort('modules')} className="font-semibold hover:underline">
                Module {currentSort === 'modules' ? '↓' : ''}
              </button>
            </th>
            <th className="text-center px-4 py-3">App ⭐</th>
            <th className="text-center px-4 py-3">Module ⭐</th>
            <th className="text-left px-4 py-3">User</th>
            <th className="text-left px-4 py-3">Feedback</th>
            <th className="text-center px-4 py-3">Approved</th>
            <th className="text-left px-4 py-3">Code</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <td className="px-4 py-3 text-xs">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {item.module_name}
              </td>
              <td className="px-4 py-3 text-center">{item.app_rating} ⭐</td>
              <td className="px-4 py-3 text-center">{item.module_rating} ⭐</td>
              <td className="px-4 py-3 text-xs">
                {item.is_anonymous ? 'Anonymous' : item.user_email || 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                {item.feedback_text || '(no feedback)'}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    item.is_quality_approved
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {item.is_quality_approved ? '✓' : '✗'}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {item.coupon_code ? (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.coupon_code!);
                      alert('Code copied!');
                    }}
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {item.coupon_code}
                  </button>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
