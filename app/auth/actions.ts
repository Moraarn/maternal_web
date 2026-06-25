'use server'

import { cookies } from 'next/headers'

export async function loginAction(payload: unknown) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      success: false,
      message: data?.message ?? 'Login failed',
    };
  }

  return {
    success: true,
    user: data?.user ?? null,
  };
}

export async function registerAction(payload: unknown) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      success: false,
      message: data?.message ?? 'Registration failed',
    };
  }

  return {
    success: true,
    user: data?.user ?? null,
  };
}

export async function logout() {
  const cookieStore = cookies()
  
  // Clear all auth cookies
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('CystaNiva_token')
  cookieStore.delete('nab_CystaNiva_token')
  
  return { success: true }
}
