import { describe, it, expect, vi, beforeEach } from 'vitest';

let queryResult: { data: unknown[] | null; error: { message: string } | null } = {
  data: [],
  error: null,
};

vi.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      returns: vi.fn(async () => queryResult),
    })),
    auth: {
      getUser: vi.fn(async (token: string) => {
        if (token === 'valid-token') {
          return { data: { user: { id: 'user-456' } }, error: null };
        }
        return { data: { user: null }, error: { message: 'Invalid token' } };
      }),
    },
  };
  return { createClient: vi.fn(() => mockSupabase) };
});

import { GET } from './route';

function makeReq(token?: string) {
  return new Request('http://localhost/api/feedback/user', {
    method: 'GET',
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

describe('GET /api/feedback/user', () => {
  beforeEach(() => {
    queryResult = { data: [], error: null };
  });

  it('rejects requests without a Bearer token', async () => {
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await GET(makeReq('bad-token'));
    expect(res.status).toBe(401);
  });

  it('returns the user feedback with module names flattened', async () => {
    queryResult = {
      data: [
        {
          id: 'f1',
          module_id: 'm1',
          modules: { title: 'Intro to Programming' },
          app_rating: 5,
          module_rating: 4,
          feedback_text: 'Very helpful!',
          created_at: '2026-07-18T10:00:00Z',
          coupon_code: 'FEEDBACK-ABC12345',
          coupon_expires_at: '2026-08-18T10:00:00Z',
          is_quality_approved: true,
        },
      ],
      error: null,
    };

    const res = await GET(makeReq('valid-token'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.feedback).toHaveLength(1);
    expect(json.feedback[0].module_name).toBe('Intro to Programming');
    expect(json.feedback[0].coupon_code).toBe('FEEDBACK-ABC12345');
  });

  it('falls back to Unknown Module when the join is missing', async () => {
    queryResult = {
      data: [
        {
          id: 'f2',
          module_id: 'm2',
          modules: null,
          app_rating: 3,
          module_rating: 3,
          feedback_text: '',
          created_at: '2026-07-18T10:00:00Z',
          coupon_code: null,
          coupon_expires_at: null,
          is_quality_approved: false,
        },
      ],
      error: null,
    };

    const res = await GET(makeReq('valid-token'));
    const json = await res.json();

    expect(json.feedback[0].module_name).toBe('Unknown Module');
  });

  it('returns 500 when the query fails', async () => {
    queryResult = { data: null, error: { message: 'boom' } };
    const res = await GET(makeReq('valid-token'));
    expect(res.status).toBe(500);
  });
});
