'use client';

import { useEffect, useState } from 'react';
import { StatsBar } from './components/StatsBar';
import { FeedbackTable } from './components/FeedbackTable';

interface Stats {
  total_feedback: number;
  avg_app_rating: number;
  avg_module_rating: number;
  pct_approved: number;
  total_codes_generated: number;
  total_codes_redeemed: number;
}

interface AdminFeedbackResponse {
  data: Array<{
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
  }>;
  pagination: { page: number; limit: number; total: number };
  stats: Stats;
}

export default function AdminFeedbackPage() {
  const [response, setResponse] = useState<AdminFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterApproval, setFilterApproval] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchFeedback() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sort: sortColumn,
          order: sortOrder,
          ...(filterApproval && { filter_approval: filterApproval }),
          ...(filterUserType && { filter_user_type: filterUserType }),
          ...(search && { search }),
        });

        const response = await fetch(`/api/admin/feedback?${params}`);
        if (!response.ok) throw new Error('Failed to fetch feedback');

        const data = await response.json();
        setResponse(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, [page, limit, sortColumn, sortOrder, filterApproval, filterUserType, search]);

  if (loading && !response) {
    return <div className="text-gray-600">Loading...</div>;
  }

  if (error && !response) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Feedback</h1>

      {response && <StatsBar stats={response.stats} />}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-700"
          />

          <select
            value={filterApproval}
            onChange={(e) => {
              setFilterApproval(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-700"
          >
            <option value="">All Approval Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterUserType}
            onChange={(e) => {
              setFilterUserType(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-700"
          >
            <option value="">All Users</option>
            <option value="registered">Registered</option>
            <option value="anonymous">Anonymous</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-700"
          >
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {response && (
        <>
          <FeedbackTable
            data={response.data}
            onSort={(column) => {
              setSortColumn(column);
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            currentSort={sortColumn}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, response.pagination.total)} of{' '}
              {response.pagination.total} feedback
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage(Math.min(Math.ceil(response.pagination.total / limit), page + 1))
                }
                disabled={page >= Math.ceil(response.pagination.total / limit)}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
