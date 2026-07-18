import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: { id: 'test-id-123' },
            error: null,
          })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(async (token) => {
        // Mock valid token
        if (token === 'valid-token') {
          return {
            data: { user: { id: 'user-456' } },
            error: null,
          };
        }
        // Mock invalid token
        return {
          data: { user: null },
          error: { message: 'Invalid token' },
        };
      }),
    },
  };

  return {
    createClient: vi.fn(() => mockSupabase),
  };
});

import { POST } from './route';

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates feedback with quality approval and coupon', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        app_rating: 5,
        module_rating: 4,
        feedback_text: 'Great examples, very clear and helpful!',
        is_anonymous: false,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.coupon_code).toMatch(/^FEEDBACK-[A-Z0-9]{6}$/);
    expect(json.is_quality_approved).toBe(true);
    expect(json.id).toBe('test-id-123');
    expect(json.message).toContain('₱100 discount code');
  });

  it('creates feedback without coupon if not approved', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        app_rating: 3,
        module_rating: 2,
        feedback_text: 'Bad', // Too short
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.coupon_code).toBeNull();
    expect(json.is_quality_approved).toBe(false);
    expect(json.message).toBe('Thanks for your feedback!');
  });

  it('creates feedback with empty text and approves (silent submission)', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        app_rating: 4,
        module_rating: 3,
        feedback_text: '',
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.is_quality_approved).toBe(true);
    expect(json.coupon_code).toMatch(/^FEEDBACK-[A-Z0-9]{6}$/);
  });

  it('validates rating bounds - app_rating too high', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        app_rating: 10, // Invalid
        module_rating: 2,
        feedback_text: '',
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain('Ratings must be between 1 and 5');
  });

  it('validates rating bounds - module_rating too low', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        app_rating: 3,
        module_rating: 0, // Invalid
        feedback_text: 'Long enough text for approval here',
        is_anonymous: false,
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain('Ratings must be between 1 and 5');
  });

  it('requires device_id and module_id', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        app_rating: 5,
        module_rating: 5,
        feedback_text: '',
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain('Missing required fields');
  });

  it('requires app_rating and module_rating', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        feedback_text: 'Good feedback',
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain('Missing required fields');
  });

  it('handles anonymous submission correctly', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-456',
        module_id: 'module-101',
        app_rating: 4,
        module_rating: 4,
        feedback_text: 'Great explanations and helpful examples!',
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.is_quality_approved).toBe(true);
  });

  it('rejects non-anonymous submission without Bearer token', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-456',
        module_id: 'module-101',
        app_rating: 4,
        module_rating: 4,
        feedback_text: 'Great explanations and helpful examples!',
        is_anonymous: false,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toContain('Bearer token required');
  });

  it('rejects non-anonymous submission with invalid Bearer token', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer invalid-token',
      },
      body: JSON.stringify({
        device_id: 'device-456',
        module_id: 'module-101',
        app_rating: 4,
        module_rating: 4,
        feedback_text: 'Great explanations and helpful examples!',
        is_anonymous: false,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toContain('Unauthorized');
  });

  it('rejects feedback with spam (repeated chars)', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        app_rating: 2,
        module_rating: 1,
        feedback_text: 'This is aaaaaaa bad feedback',
        is_anonymous: false,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.is_quality_approved).toBe(false);
    expect(json.coupon_code).toBeNull();
  });
});
