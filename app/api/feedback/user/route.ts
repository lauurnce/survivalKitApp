import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get authenticated user from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's feedback with module names
    const { data, error } = await supabase
      .from('user_feedback')
      .select(`
        id,
        module_id,
        modules!inner(name),
        app_rating,
        module_rating,
        feedback_text,
        created_at,
        coupon_code,
        coupon_expires_at,
        is_quality_approved
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Feedback fetch error:', error);
      return Response.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Transform response
    const feedback = data?.map((item: any) => ({
      id: item.id,
      module_id: item.module_id,
      module_name: item.modules?.name || 'Unknown Module',
      app_rating: item.app_rating,
      module_rating: item.module_rating,
      feedback_text: item.feedback_text,
      created_at: item.created_at,
      coupon_code: item.coupon_code,
      coupon_expires_at: item.coupon_expires_at,
      is_quality_approved: item.is_quality_approved,
    })) || [];

    return Response.json({ feedback });
  } catch (error) {
    console.error('Feedback user API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
