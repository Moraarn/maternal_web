'use server';

import { redirect } from 'next/navigation';
import { api } from '@/server/api';
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
  const body = getCleanFormData(data, { delete: ['redirectPath'] });
  const response = await api.post('/auth/login', body);

  if (response.success) {
    redirect(validateRedirectPath(data.get('redirectPath') as string));
  }

  return { formdata: body, ...response } as ApiBridgeResponse<AuthResponse['user']>;
}

export async function signUp(_prev: unknown, data: FormData) {
  const body = getCleanFormData(data, { delete: ['redirectPath'] });
  const response = await api.post('/auth/register', body);

  if (response.success) {
    redirect(validateRedirectPath(data.get('redirectPath') as string));
  }

  return { formdata: body, ...response } as ApiBridgeResponse<AuthResponse['user']>;
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
  const response = await api.post('/auth/logout');
  return response;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response;
}

export async function createOtp(phoneNumber: string) {
  const response = await api.post('/auth/otp/create', { phoneNumber });
  return response;
}

export async function verifyOtp(phoneNumber: string, code: string) {
  const response = await api.post('/auth/otp/verify', { phoneNumber, code });
  return response;
}
