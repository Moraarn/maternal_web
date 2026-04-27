import { NextRequest, NextResponse } from 'next/server'
import { calculateRisk } from '@/lib/riskEngine'

export async function POST(request: NextRequest) {
  try {
    const { answers, userStatus } = await request.json()

    // Validate input
    if (!Array.isArray(answers) || !userStatus) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Calculate risk using the risk engine
    const result = calculateRisk(answers, userStatus)

    // In a real implementation, you might:
    // 1. Save the checkup to database
    // 2. Notify health workers if high risk
    // 3. Update user's health record

    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Check API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
