'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCleanFormData, validateRedirectPath } from 'next-api-bridge/form';
import { UserStatus, Trimester } from '@/store/useStore';

export interface LoginCredentials {
  phone: string
  password: string
}

export interface RegisterData {
  fullName: string
  phone: string
  location: string
  password: string
  status: string
  trimester?: string
  chwName?: string
  chwPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export interface AuthResponse {
  user: {
    id: string
    phone: string
    fullName: string
    status: UserStatus
    trimester?: Trimester
    weeksCount?: number
    chwName?: string
    chwPhone?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    location?: string
  }
  token: string
  message: string
}

export interface ApiBridgeResponse<T = any> {
  success: boolean
  message: string
  body: T | null
  formdata?: any
}

export async function signIn(_prev: unknown, data: FormData) {
  const redirectPath = data.get('redirectPath') as string;
  const body = getCleanFormData(data, { delete: ['redirectPath'] });

  const API_URL = process.env.API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { success: false, message: errorText || 'Login failed', body: null, formdata: body, redirectPath } as ApiBridgeResponse<AuthResponse['user']>;
  }

  const result = await res.json();

  // Forward cookies from backend to browser
  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader) {
    const cookieStore = await cookies();
    setCookieHeader.split(',').forEach((cookie) => {
      const [cookiePart] = cookie.trim().split(';');
      const [name, value] = cookiePart.split('=');
      if (name && value) {
        cookieStore.set(name.trim(), value.trim(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60, // 15 minutes for access token
        });
      }
    });
  }

  return { success: true, message: 'Login successful', body: result.user, formdata: body, redirectPath } as ApiBridgeResponse<AuthResponse['user']>;
}

export async function signUp(_prev: unknown, data: FormData) {
  const redirectPath = data.get('redirectPath') as string;
  const body = getCleanFormData(data, { delete: ['redirectPath'] });

  const API_URL = process.env.API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { success: false, message: errorText || 'Registration failed', body: null, formdata: body, redirectPath } as ApiBridgeResponse<AuthResponse['user']>;
  }

  const result = await res.json();

  // Forward cookies from backend to browser
  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader) {
    const cookieStore = await cookies();
    setCookieHeader.split(',').forEach((cookie) => {
      const [cookiePart] = cookie.trim().split(';');
      const [name, value] = cookiePart.split('=');
      if (name && value) {
        cookieStore.set(name.trim(), value.trim(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60, // 15 minutes for access token
        });
      }
    });
  }

  return { success: true, message: 'Registration successful', body: result.user, formdata: body, redirectPath } as ApiBridgeResponse<AuthResponse['user']>;
}

// Legacy functions for components that haven't been migrated yet
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('phone', credentials.phone);
  formData.append('password', credentials.password);
  
  const response = await signIn(null, formData);
  
  if (!response.success || !response.body) {
    throw new Error(response.message || 'Login failed');
  }
  
  return {
    user: response.body,
    token: 'handled-by-bridge',
    message: response.message
  };
}

export async function register(userData: RegisterData): Promise<AuthResponse> {
  const formData = new FormData();
  Object.entries(userData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });
  
  const response = await signUp(null, formData);
  
  if (!response.success || !response.body) {
    throw new Error(response.message || 'Registration failed');
  }
  
  return {
    user: response.body,
    token: 'handled-by-bridge',
    message: response.message
  };
}

export async function validateToken(): Promise<boolean> {
  try {
    const response = await getCurrentUser();
    return response.success && !!response.body;
  } catch (error) {
    return false;
  }
}

export async function signOut() {
  const API_URL = process.env.API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');

  const result = await res.json();
  return result;
}

export async function getCurrentUser() {
  const API_URL = process.env.API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    return { success: false, message: 'Failed to fetch user', body: null };
  }

  const user = await res.json();
  return { success: true, message: 'User fetched', body: user };
}

export async function createOtp(phoneNumber: string) {
  const API_URL = process.env.API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_URL}/auth/otp/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
    credentials: 'include',
  });

  return await res.json();
}

export async function verifyOtp(phoneNumber: string, code: string) {
  const API_URL = process.env.API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, code }),
    credentials: 'include',
  });

  return await res.json();
}