import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, authCookieOptions, getBackendApiUrl } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(`${getBackendApiUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await backendRes.json().catch(() => null);

  if (!backendRes.ok) {
    return NextResponse.json(data ?? { message: 'Login failed' }, { status: backendRes.status });
  }

  const accessToken = data?.accessToken ?? data?.access_token ?? data?.token;
  const refreshToken = data?.refreshToken ?? data?.refresh_token;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Login succeeded but no access token was returned by the backend.' },
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
}
