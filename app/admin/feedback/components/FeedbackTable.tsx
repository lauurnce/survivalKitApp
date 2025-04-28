'use client';

import { useState } from 'react';
import { formatManilaDate } from '@/lib/manilaTime';

interface Feedback {
  id: string;
  created_at: string;
  module_name: string;
  app_rating: number;
  module_rating: number;
  feedback_text: string;
  user_id?: string | null;
  user_email: string | null;
  user_name?: string | null;
  is_anonymous: boolean;
  is_quality_approved: boolean;
  coupon_code: string | null;
}

const COLUMN_COUNT = 8;

function CopyCode({ code }: { code: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={async () => {
          // Confirm only once the write actually landed; clipboard access is
          // refused on insecure origins and in some embedded browsers.
          try {
            await navigator.clipboard.writeText(code);
            setStatus('copied');
          } catch {
            setStatus('failed');
          }
        }}
        className="hover:underline text-blue-600 dark:text-blue-400"
      >
        {code}
      </button>
      <span role="status" className="text-[10px] text-gray-500 dark:text-gray-400">
        {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed, select the code instead' : ''}
      </span>
    </span>
  );
}

export function FeedbackTable({
  data,
  onSort,
  currentSort,
  currentOrder = 'desc',
}: {
  data: Feedback[];
  onSort: (column: string) => void;
  currentSort: string;
  currentOrder?: 'asc' | 'desc';
}) {
  const arrow = (column: string) => (currentSort === column ? (currentOrder === 'asc' ? ' ↑' : ' ↓') : '');
  const ariaSort = (column: string) =>
    currentSort === column ? (currentOrder === 'asc' ? 'ascending' : 'descending') : 'none';
  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left px-4 py-3" aria-sort={ariaSort('created_at')}>
              <button onClick={() => onSort('created_at')} className="font-semibold hover:underline">
                Date{arrow('created_at')}
              </button>
            </th>
            <th className="text-left px-4 py-3" aria-sort={ariaSort('module')}>
              <button onClick={() => onSort('module')} className="font-semibold hover:underline">
                Module{arrow('module')}
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
          {data.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No feedback matches these filters.
              </td>
            </tr>
          )}
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <td className="px-4 py-3 text-xs">
                {formatManilaDate(item.created_at, 'short')}
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {item.module_name}
              </td>
              <td className="px-4 py-3 text-center">{item.app_rating} ⭐</td>
              <td className="px-4 py-3 text-center">{item.module_rating} ⭐</td>
              <td className="px-4 py-3 text-xs">
                {item.is_anonymous ? (
                  'Anonymous'
                ) : item.user_email || item.user_name ? (
                  <>
                    {item.user_name && <span className="block font-medium">{item.user_name}</span>}
                    {item.user_email && <span className="block text-gray-500 dark:text-gray-400">{item.user_email}</span>}
                  </>
                ) : item.user_id ? (
                  <span className="font-mono" title={item.user_id}>{item.user_id.slice(0, 8)}…</span>
                ) : (
                  'Guest'
                )}
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
                  <CopyCode code={item.coupon_code} />
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
