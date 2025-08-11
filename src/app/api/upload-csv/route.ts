import { assignProgramsCsv } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('csvFile') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    const members = await assignProgramsCsv(file)
    
    return NextResponse.json({ success: true, data: members })
  } catch (error: any) {
    console.error('Upload CSV error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process CSV' }, 
      { status: 500 }
    )
  }
}
