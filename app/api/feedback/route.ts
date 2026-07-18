import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { checkFeedbackQuality, generateCouponCode } from '@/lib/feedback';
import { DEVICE_COOKIE, verifyDeviceCookie } from '@/lib/auth/deviceCookie';
import { getClientIp } from '@/lib/rateLimit';
import { isServerRateLimited } from '@/lib/serverRateLimit';

// Coarse per-IP ceiling (campus NAT headroom) and a tight per-device budget.
const RATE_LIMIT_IP = { max: 20, windowSeconds: 3600 };
const RATE_LIMIT_DEVICE = { max: 5, windowSeconds: 3600 };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      device_id: bodyDeviceId,
      module_id,
      app_rating,
      module_rating,
      feedback_text = '',
      is_anonymous,
    } = body;

    // Trust the signed HttpOnly device cookie over the client-supplied body
    // value — the body is forgeable, the HMAC cookie is not.
    const cookieStore = await cookies();
    const cookieDeviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
    const device_id = cookieDeviceId ?? bodyDeviceId;

    // Validation
    if (!device_id || !module_id || app_rating === undefined || app_rating === null || module_rating === undefined || module_rating === null) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get authenticated user from Bearer token
    let authenticatedUserId: string | null = null;
    const authHeader = request.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return Response.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      authenticatedUserId = user.id;
    }

    // For non-anonymous submissions, require Bearer token
    if (!is_anonymous && !authenticatedUserId) {
      return Response.json(
        { error: 'Bearer token required for non-anonymous submissions' },
        { status: 401 }
      );
    }

    if (typeof app_rating !== 'number' || typeof module_rating !== 'number' ||
        app_rating < 1 || app_rating > 5 || module_rating < 1 || module_rating > 5) {
      return Response.json(
        { error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Distributed rate limits, shared across all serverless instances.
    const ip = getClientIp(request);
    const [ipLimited, deviceLimited] = await Promise.all([
      isServerRateLimited(`feedback:ip:${ip}`, RATE_LIMIT_IP),
      isServerRateLimited(`feedback:device:${device_id}`, RATE_LIMIT_DEVICE),
    ]);
    if (ipLimited || deviceLimited) {
      return Response.json(
        {
          error: 'rate_limited',
          message: 'Too many submissions — please try again later.',
        },
        { status: 429 }
      );
    }

    // One feedback per user per module (authenticated) or per device per module
    // (anonymous). The DB unique indexes are the real guarantee; this pre-check
    // exists to return a friendly 409 instead of a raw constraint error.
    let dedupQuery = supabase
      .from('user_feedback')
      .select('id')
      .eq('module_id', module_id)
      .limit(1);
    if (!is_anonymous && authenticatedUserId) {
      dedupQuery = dedupQuery.eq('user_id', authenticatedUserId);
    } else {
      dedupQuery = dedupQuery.is('user_id', null).eq('device_id', device_id);
    }
    const { data: existing } = await dedupQuery.maybeSingle();
    if (existing) {
      return Response.json(
        {
          error: 'already_submitted',
          message: "You've already shared feedback for this module — thank you!",
        },
        { status: 409 }
      );
    }

    // Check feedback quality
    const isQualityApproved = checkFeedbackQuality(feedback_text);

    // Generate coupon if approved
    let coupon_code = null;
    let coupon_expires_at = null;

    if (isQualityApproved) {
      coupon_code = generateCouponCode();
      // 30 days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      coupon_expires_at = expiryDate.toISOString();
    }

    // Insert feedback
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        device_id,
        user_id: is_anonymous ? null : authenticatedUserId,
        module_id,
        app_rating,
        module_rating,
        feedback_text,
        is_anonymous,
        is_quality_approved: isQualityApproved,
        coupon_code,
        coupon_expires_at,
      })
      .select()
      .single();

    if (error) {
      // Unique index caught a concurrent duplicate the pre-check missed.
      if (error.code === '23505') {
        return Response.json(
          {
            error: 'already_submitted',
            message: "You've already shared feedback for this module — thank you!",
          },
          { status: 409 }
        );
      }
      console.error('Feedback insert error:', error);
      return Response.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // Response message
    let message = 'Thanks for your feedback!';
    if (isQualityApproved && coupon_code) {
      message = `Thanks! Your feedback helps us improve. You've earned a ₱100 discount code: ${coupon_code} (valid 30 days)`;
    }

    return Response.json({
      id: data.id,
      coupon_code: isQualityApproved ? coupon_code : null,
      coupon_expires_at: isQualityApproved ? coupon_expires_at : null,
      is_quality_approved: isQualityApproved,
      message,
    });
  } catch (error) {
    console.error('Feedback API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
