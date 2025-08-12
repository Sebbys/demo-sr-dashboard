import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!process.env.FITNESS_API_URL) {
      return NextResponse.json({ error: "Fitness API not configured" }, { status: 503 })
    }

    // Support both { members: [...] } and raw list payloads
    let members
    if (Array.isArray(body)) {
      members = body
    } else if (body.members && Array.isArray(body.members)) {
      members = body.members
    } else {
      return NextResponse.json({ error: "Body must be a list or an object with a 'members' array" }, { status: 422 })
    }

    console.log(`🔥 API: Starting plan generation for ${members.length} members`)
    const apiStartTime = performance.now()

    const apiEndpoint = process.env.FITNESS_API_URL

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes timeout

    try {
      // Call the external AI Fitness Planner API to generate detailed plans
      const response = await fetch(`${apiEndpoint}/generate-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.FITNESS_API_KEY && {
            Authorization: `Bearer ${process.env.FITNESS_API_KEY}`,
          }),
        },
        body: JSON.stringify(members),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("External API error:", errorText)

        if (response.status === 503) {
          return NextResponse.json({ error: "AI service is not available. Please try again later." }, { status: 503 })
        }

        return NextResponse.json(
          { error: "Failed to generate personalized plans. Please try again." },
          { status: response.status },
        )
      }

      const data = await response.json()

      const apiEndTime = performance.now()
      const apiTime = (apiEndTime - apiStartTime) / 1000
      console.log(`🎯 API: External API responded in ${apiTime.toFixed(2)}s`)
      console.log(`📊 API: Processing rate: ${(members.length / apiTime).toFixed(1)} members/second`)

      // Validate response data structure
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from API")
      }

      console.log(`✨ API: Successfully generated ${data.length} detailed plans`)
      return NextResponse.json(data)
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        console.error("🚨 API: Request timed out after 5 minutes")
        return NextResponse.json(
          {
            error: "Plan generation is taking longer than expected. Please try with fewer members or try again later.",
          },
          { status: 408 },
        )
      }

      throw error
    }
  } catch (error) {
    console.error("Error generating plans:", error)
    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 })
  }
}
