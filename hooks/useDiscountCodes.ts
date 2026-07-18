'use client';

import { useEffect, useState } from 'react';

interface DiscountCode {
  coupon_code: string;
  created_at: string;
  coupon_expires_at: string;
  is_quality_approved: boolean;
  status: 'active' | 'expired' | 'used';
}

export function useDiscountCodes(token: string | null) {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchCodes() {
      try {
        const response = await fetch('/api/feedback/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch discount codes');
        }

        const data = await response.json();
        const processedCodes = data.feedback
          .filter((f: any) => f.coupon_code)
          .map((f: any) => ({
            coupon_code: f.coupon_code,
            created_at: f.created_at,
            coupon_expires_at: f.coupon_expires_at,
            is_quality_approved: f.is_quality_approved,
            status: new Date(f.coupon_expires_at) < new Date() ? 'expired' : 'active',
          }));

        setCodes(processedCodes);
        setError(null);
      } catch (err) {
        console.error('Error fetching discount codes:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCodes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCodes();
  }, [token]);

  return { codes, loading, error };
}
