import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.FITNESS_API_URL) {
      return NextResponse.json(
        { status: "error", message: "FITNESS_API_URL not configured on the server" },
        { status: 500 },
      )
    }

    const response = await fetch(`${process.env.FITNESS_API_URL}/health`)

    if (!response.ok) {
      return NextResponse.json({ status: "error", message: "Health check failed" }, { status: 503 })
    }

    const healthData = await response.json()
    return NextResponse.json(healthData)
  } catch (error) {
    console.error("Health route error:", error)
    return NextResponse.json(
      {
        status: "error",
        models_loaded: false,
        azure_openai: false,
        message: "API unavailable",
      },
      { status: 503 },
    )
  }
}
