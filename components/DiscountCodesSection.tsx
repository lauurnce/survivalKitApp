'use client';

import { useDiscountCodes } from '@/hooks/useDiscountCodes';

interface DiscountCodesSectionProps {
  userToken: string | null;
}

export function DiscountCodesSection({ userToken }: DiscountCodesSectionProps) {
  const { codes, loading, error } = useDiscountCodes(userToken);

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading discount codes...</div>;
  }

  if (error) {
    return <div className="text-red-600">Failed to load codes: {error}</div>;
  }

  if (codes.length === 0) {
    return (
      <div className="text-gray-600 dark:text-gray-400">
        No discount codes yet. Submit quality feedback to earn ₱100 discount codes!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">My Discount Codes</h3>
      <div className="space-y-2">
        {codes
          .sort((a, b) => new Date(a.coupon_expires_at).getTime() - new Date(b.coupon_expires_at).getTime())
          .map((code) => {
            const expiresAt = new Date(code.coupon_expires_at);
            const isExpired = expiresAt < new Date();
            const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={code.coupon_code}
                className={`border rounded-lg p-4 ${
                  isExpired
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                    : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono font-bold text-lg">{code.coupon_code}</div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      isExpired
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200'
                    }`}
                  >
                    {isExpired ? 'Expired' : `${daysUntilExpiry} days left`}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  ₱100 discount on any module unlock
                </p>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code.coupon_code);
                    alert('Code copied to clipboard!');
                  }}
                  disabled={isExpired}
                  className={`w-full py-2 rounded text-sm font-medium transition ${
                    isExpired
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700'
                  }`}
                >
                  {isExpired ? 'Expired' : 'Copy Code'}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
