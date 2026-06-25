import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getBackendApiUrl } from '@/lib/auth';

async function fetchWithAuth(url: string, token: string): Promise<Response> {
  return fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
}

async function tryRefresh(): Promise<{ success: boolean; newToken: string | null }> {
  try {
    const refreshRes = await fetch(`${getBackendApiUrl()}/api/auth/refresh`, {
      method: 'POST',
      cache: 'no-store',
    });

    if (!refreshRes.ok) {
      return { success: false, newToken: null };
    }

    const cookieStore = await cookies();
    const newToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    return { success: true, newToken: newToken ?? null };
  } catch {
    return { success: false, newToken: null };
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, user: null, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    let backendRes = await fetchWithAuth(`${getBackendApiUrl()}/api/v1/auth/me`, token);

    let text = await backendRes.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    console.log('[auth/me] backend status:', backendRes.status);
    console.log('[auth/me] backend response:', data);

    // If 401, try refresh and retry once
    if (backendRes.status === 401) {
      console.log('[auth/me] Access token expired, attempting refresh...');
      const refreshResult = await tryRefresh();

      if (refreshResult.success && refreshResult.newToken) {
        console.log('[auth/me] Refresh successful, retrying with new token');
        token = refreshResult.newToken;
        backendRes = await fetchWithAuth(`${getBackendApiUrl()}/api/v1/auth/me`, token);

        text = await backendRes.text();
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = { message: text };
        }

        console.log('[auth/me] retry backend status:', backendRes.status);
        console.log('[auth/me] retry backend response:', data);
      } else {
        console.log('[auth/me] Refresh failed');
      }
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          message: data?.message ?? 'Unauthorized',
        },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      user: data?.user ?? data,
    });
  } catch (error) {
    console.error('[auth/me] route failed:', error);

    return NextResponse.json(
      {
        success: false,
        user: null,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      },
      { status: 500 },
    );
  }
}
