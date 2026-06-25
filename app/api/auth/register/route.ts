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
    const backendUrl = `${getBackendApiUrl()}/api/v1/auth/register`;

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

    console.log('[auth/register] backend status:', backendRes.status);
    console.log('[auth/register] backend response:', data);

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message ?? 'Registration failed',
          backendStatus: backendRes.status,
          backendError: data,
        },
        { status: backendRes.status },
      );
    }

    const accessToken = data?.accessToken ?? data?.access_token ?? data?.token;
    const refreshToken = data?.refreshToken ?? data?.refresh_token;

    const res = NextResponse.json({
      success: true,
      user: data?.user ?? null,
      requiresVerification: data?.requiresVerification ?? false,
      nextStep: data?.nextStep,
    });

    if (accessToken) {
      res.cookies.set(AUTH_COOKIE_NAME, accessToken, authCookieOptions);
    }

    if (refreshToken) {
      res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
        ...authCookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (error) {
    console.error('[auth/register] route failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      },
      { status: 500 },
    );
  }
}
