import { generatePlans } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'
import { MemberWithProgram } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const { members }: { members: MemberWithProgram[] } = await request.json()
    
    if (!members || !Array.isArray(members)) {
      return NextResponse.json({ error: 'Invalid members data' }, { status: 400 })
    }
    
    const enrichedMembers = await generatePlans(members)
    
    return NextResponse.json({ success: true, data: enrichedMembers })
  } catch (error: any) {
    console.error('Generate plans error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate plans' }, 
      { status: 500 }
    )
  }
}
