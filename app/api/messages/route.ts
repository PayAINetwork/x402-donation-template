import { NextRequest, NextResponse } from "next/server";
import { getDonations, getDonationStats } from "@/lib/db";

/**
 * GET /api/messages
 *
 * Retrieve paginated donation messages
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - sort: Sort by 'recent' or 'top' (default: recent)
 *
 * Example: /api/messages?page=1&limit=20&sort=top
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const sort = (searchParams.get("sort") || "recent") as "recent" | "top";

    // Validate parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    if (sort !== "recent" && sort !== "top") {
      return NextResponse.json(
        { success: false, error: "Sort must be 'recent' or 'top'" },
        { status: 400 }
      );
    }

    // Get donations
    const { donations, total } = await getDonations(page, limit, sort);

    // Get stats
    const stats = await getDonationStats();

    return NextResponse.json({
      success: true,
      data: {
        donations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Messages retrieval error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve messages",
      },
      { status: 500 }
    );
  }
}
