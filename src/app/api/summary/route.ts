import { NextResponse } from 'next/server'

const SCRIPT_ID = process.env.GOOGLE_APP_SCRIPT_ID

export async function GET() {
  if (!SCRIPT_ID) {
    return NextResponse.json({ error: 'GOOGLE_APP_SCRIPT_ID not configured' }, { status: 500 })
  }

  // Apps Script web app exec URL pattern
  const url = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ error: `Upstream error ${res.status}`, details: text }, { status: 502 })
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json') || contentType.includes('text/javascript')) {
      // If the script returned JSONP (text/javascript), try to extract JSON
      const text = await res.text()
      try {
        const json = JSON.parse(text)
        return NextResponse.json(json)
      } catch (e) {
        // Try to strip JSONP wrapper: callback(<json>);
  const match = text.match(/^[^\(]*\(([\s\S]*)\);?\s*$/)
  if (match && match[1]) {
          try {
            const inner = JSON.parse(match[1])
            return NextResponse.json(inner)
          } catch (err) {
            return NextResponse.json({ error: 'Failed to parse upstream response' }, { status: 502 })
          }
        }

        return NextResponse.json({ error: 'Unexpected upstream content' }, { status: 502 })
      }
    }

    // Fallback: try to parse as JSON
    const data = await res.json().catch(() => null)
    if (data) return NextResponse.json(data)

    return NextResponse.json({ error: 'Upstream returned non-JSON response' }, { status: 502 })
  } catch (err) {
    return NextResponse.json({ error: 'Fetch failed', details: String(err) }, { status: 502 })
  }
}
