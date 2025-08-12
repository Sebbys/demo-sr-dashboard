import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Please upload a CSV file" }, { status: 400 })
    }

    const apiEndpoint = process.env.FITNESS_API_URL || "https://your-api-endpoint.com"

    // Create form data for the external API
    const apiFormData = new FormData()
    apiFormData.append("file", file)

    // Call the external AI Fitness Planner API
    const response = await fetch(`${apiEndpoint}/assign-programs/csv`, {
      method: "POST",
      body: apiFormData,
      headers: {
        // Add any required API headers here
        ...(process.env.FITNESS_API_KEY && {
          Authorization: `Bearer ${process.env.FITNESS_API_KEY}`,
        }),
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("External API error:", errorText)

      if (response.status === 422) {
        return NextResponse.json(
          {
            error: "Invalid CSV format. Please check your file structure.",
          },
          { status: 422 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to process CSV file. Please try again.",
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Validate response data structure
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format from API")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing CSV:", error)
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
      },
      { status: 500 },
    )
  }
}
