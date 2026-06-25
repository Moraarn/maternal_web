import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  authCookieOptions,
  getBackendApiUrl,
} from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backendUrl = `${getBackendApiUrl()}/api/v1/auth/login`;

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
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

    console.log('[auth/login] backend status:', backendRes.status);
    console.log('[auth/login] backend response:', data);

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message ?? 'Login failed',
          backendStatus: backendRes.status,
          backendError: data,
        },
        { status: backendRes.status },
      );
    }

    const accessToken = data?.accessToken ?? data?.access_token ?? data?.token;
    const refreshToken = data?.refreshToken ?? data?.refresh_token;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Login succeeded but no access token was returned by the backend.',
        },
        { status: 502 },
      );
    }

    const res = NextResponse.json({
      success: true,
      user: data?.user ?? null,
    });

    res.cookies.set(AUTH_COOKIE_NAME, accessToken, authCookieOptions);

    if (refreshToken) {
      res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
        ...authCookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (error) {
    console.error('[auth/login] route failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 500 },
    );
  }
}
