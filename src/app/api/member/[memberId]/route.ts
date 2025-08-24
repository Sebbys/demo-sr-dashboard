import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const { memberId } = await params

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    // Since the detailed plans are generated in the dashboard and stored in localStorage,
    // we'll return a response that tells the client to use localStorage data
    // This avoids the "member not found" issue since the data flows from CSV -> dashboard -> individual pages

    return NextResponse.json({
      message: "Member plan should be loaded from client-side storage",
      memberId: memberId,
    })
  } catch (error) {
    console.error("Error fetching member plan:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
