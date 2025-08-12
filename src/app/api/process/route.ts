import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.FITNESS_API_URL) {
      console.error("FITNESS_API_URL environment variable is not configured")
      return NextResponse.json(
        { error: "API configuration missing. Please set FITNESS_API_URL environment variable." },
        { status: 500 },
      )
    }

    const contentType = request.headers.get("content-type")
    console.log("Received content-type:", contentType)
    console.log("All headers:", Object.fromEntries(request.headers.entries()))

    // Check if it's FormData by trying to parse it
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (formDataError) {
      console.error("Failed to parse as FormData:", formDataError)
      return NextResponse.json({ error: "Expected CSV file upload (multipart/form-data)" }, { status: 400 })
    }

    const csvFile = formData.get("file") as File

    if (!csvFile) {
      console.error("No file found in FormData. Available keys:", Array.from(formData.keys()))
      return NextResponse.json({ error: "No CSV file provided" }, { status: 400 })
    }

    if (!csvFile.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "Please upload a CSV file" }, { status: 400 })
    }

    console.log("Processing CSV file:", csvFile.name, "Size:", csvFile.size, "Type:", csvFile.type)

    const apiFormData = new FormData()
    apiFormData.append("file", csvFile)

    try {
      const csvResponse = await fetch(`${process.env.FITNESS_API_URL}/assign-programs/csv`, {
        method: "POST",
        body: apiFormData,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      const csvResponseText = await csvResponse.text()
      console.log("CSV Response status:", csvResponse.status)
      console.log("CSV Response headers:", Object.fromEntries(csvResponse.headers.entries()))
      console.log("CSV Response text (first 500 chars):", csvResponseText.substring(0, 500))

      if (!csvResponse.ok) {
        if (csvResponse.status === 404) {
          return NextResponse.json(
            { error: "API endpoint not found. Please check FITNESS_API_URL configuration." },
            { status: 500 },
          )
        }

        let errorData
        try {
          errorData = JSON.parse(csvResponseText)
        } catch {
          errorData = { detail: csvResponseText || `HTTP ${csvResponse.status}: ${csvResponse.statusText}` }
        }
        return NextResponse.json({ error: errorData.detail }, { status: csvResponse.status })
      }

      if (!csvResponseText.trim()) {
        return NextResponse.json({ error: "Empty response from CSV processing API" }, { status: 500 })
      }

      try {
        const csvData = JSON.parse(csvResponseText)
        return NextResponse.json(csvData)
      } catch (parseError) {
        console.error("Failed to parse CSV response as JSON:", parseError)
        console.error("Response content type:", csvResponse.headers.get("content-type"))
        return NextResponse.json(
          {
            error:
              "Invalid CSV response format. Expected JSON but received: " + csvResponseText.substring(0, 100) + "...",
          },
          { status: 500 },
        )
      }
    } catch (fetchError: any) {
      console.error("Failed to fetch CSV endpoint:", fetchError)
      if (fetchError.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout. The API took too long to respond." }, { status: 408 })
      }
      return NextResponse.json(
        { error: "Failed to connect to fitness API. Please check if the service is running." },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Process API error:", error)
    return NextResponse.json({ error: "Internal server error: " + (error as Error).message }, { status: 500 })
  }
}
