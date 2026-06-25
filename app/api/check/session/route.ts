import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getBackendApiUrl } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await req.json();

    const backendRes = await fetch(`${getBackendApiUrl()}/api/v1/check/session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await backendRes.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    console.log('[check/session] backend status:', backendRes.status);
    console.log('[check/session] backend response:', data);

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('[check/session] route failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create session',
      },
      { status: 500 },
    );
  }
}
