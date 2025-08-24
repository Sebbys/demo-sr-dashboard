import { assignProgramsCsv } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    // Accept both "file" and "csvFile" keys to be more forgiving
    const file = (formData.get('file') ?? formData.get('csvFile')) as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded (expected form field "file" or "csvFile")' }, { status: 400 })
    }

    if (!file.name || !file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Please upload a CSV file' }, { status: 400 })
    }

    // Delegate to shared helper which calls the external service
    const members = await assignProgramsCsv(file)

    return NextResponse.json({ success: true, data: members })
  } catch (error: any) {
    console.error('Upload CSV error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process CSV' },
      { status: 500 }
    )
  }
}
