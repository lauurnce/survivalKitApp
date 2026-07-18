import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  // Check admin access
  const authed = await getAdminSession();
  if (!authed) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";
    const filterAppRating = searchParams.get("filter_app_rating");
    const filterModuleId = searchParams.get("filter_module_id");
    const filterApproval = searchParams.get("filter_approval");
    const filterUserType = searchParams.get("filter_user_type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const supabase = createServerClient();

    // Build query with exact count
    let query = supabase.from("user_feedback").select(
      `
        id,
        created_at,
        module_id,
        modules!inner(name),
        app_rating,
        module_rating,
        feedback_text,
        user_id,
        is_anonymous,
        is_quality_approved,
        coupon_code,
        coupon_expires_at
      `,
      { count: "exact" }
    );

    // Apply filters
    if (filterAppRating) {
      query = query.eq("app_rating", parseInt(filterAppRating, 10));
    }

    if (filterModuleId) {
      query = query.eq("module_id", filterModuleId);
    }

    if (filterApproval === "approved") {
      query = query.eq("is_quality_approved", true);
    } else if (filterApproval === "rejected") {
      query = query.eq("is_quality_approved", false);
    }

    if (filterUserType === "registered") {
      query = query.not("user_id", "is", null);
    } else if (filterUserType === "anonymous") {
      query = query.is("user_id", null);
    }

    if (search) {
      query = query.or(
        `feedback_text.ilike.%${search}%,modules.name.ilike.%${search}%`
      );
    }

    // Sort and paginate
    query = query
      .order(sort, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin feedback fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch feedback" },
        { status: 500 }
      );
    }

    // Fetch stats from full dataset
    const { data: statsData, error: statsError } = await supabase
      .from("user_feedback")
      .select("app_rating, module_rating, is_quality_approved, coupon_code");

    if (statsError) {
      console.error("Admin feedback stats error:", statsError);
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }

    const stats = statsData
      ? {
          total_feedback: statsData.length,
          avg_app_rating:
            statsData.length > 0
              ? parseFloat(
                  (
                    statsData.reduce((sum: number, r: any) => sum + r.app_rating, 0) /
                    statsData.length
                  ).toFixed(2)
                )
              : 0,
          avg_module_rating:
            statsData.length > 0
              ? parseFloat(
                  (
                    statsData.reduce(
                      (sum: number, r: any) => sum + r.module_rating,
                      0
                    ) / statsData.length
                  ).toFixed(2)
                )
              : 0,
          pct_approved:
            statsData.length > 0
              ? Math.round(
                  (statsData.filter((r: any) => r.is_quality_approved).length /
                    statsData.length) *
                    100
                )
              : 0,
          total_codes_generated: statsData.filter((r: any) => r.coupon_code)
            .length,
          // Note: tracking redemptions requires additional column or separate tracking
          total_codes_redeemed: 0, // TODO: add redemption tracking
        }
      : {
          total_feedback: 0,
          avg_app_rating: 0,
          avg_module_rating: 0,
          pct_approved: 0,
          total_codes_generated: 0,
          total_codes_redeemed: 0,
        };

    // Transform response
    const transformedData =
      data?.map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        module_id: item.module_id,
        module_name: item.modules?.name || "Unknown Module",
        app_rating: item.app_rating,
        module_rating: item.module_rating,
        feedback_text: item.feedback_text,
        user_id: item.user_id || null,
        is_anonymous: item.is_anonymous,
        is_quality_approved: item.is_quality_approved,
        coupon_code: item.coupon_code,
        coupon_expires_at: item.coupon_expires_at,
      })) || [];

    return NextResponse.json({
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
      stats,
    });
  } catch (error) {
    console.error("Admin feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
