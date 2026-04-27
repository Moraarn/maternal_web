import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    // TODO: Implement actual authentication logic
    // For now, we'll simulate a successful login
    
    // In a real implementation, you would:
    // 1. Validate the input
    // 2. Check credentials against database
    // 3. Generate JWT token
    // 4. Return user data and token
    
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone number and password are required' },
        { status: 400 }
      )
    }

    // For demo purposes, accept any phone/password combination
    // In production, validate against database with proper password hashing
    if (phone && password) {
      // Mock user data based on phone number
      const user = {
        id: 'user-' + Date.now(),
        phone: phone,
        fullName: 'Demo User',
        status: 'pregnant' as const,
        trimester: 'second' as const,
        weeksCount: 14,
        chwName: 'Nurse Fatuma Wanjiku',
        chwPhone: '+254711111111',
        emergencyContactName: 'Margaret',
        emergencyContactPhone: '+254722222222',
        location: 'Kibera, Nairobi',
      }

      // Mock JWT token (in production, use proper JWT library)
      const token = 'mock-jwt-token-' + Date.now()

      return NextResponse.json({
        user,
        token,
        message: 'Login successful'
      })
    }

    return NextResponse.json(
      { error: 'Invalid phone number or password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
