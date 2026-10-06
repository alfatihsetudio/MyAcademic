import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser';
import axiosInstance from './axios';
import { setToken, setStoredUser } from './api';
import { User } from './types';

export interface PasskeyItem {
  id: number;
  credential_id: string;
  name: string;
  algorithm: number;
  sign_count: number;
  last_used_at: string | null;
  created_at: string;
}

/**
 * Check if the current browser and OS support WebAuthn / Biometrics
 */
export async function checkBiometricSupport(): Promise<{
  supported: boolean;
  platformAuthenticator: boolean;
}> {
  if (typeof window === 'undefined') {
    return { supported: false, platformAuthenticator: false };
  }

  const supported = browserSupportsWebAuthn();
  let platformAuthenticator = false;

  if (supported) {
    try {
      platformAuthenticator = await platformAuthenticatorIsAvailable();
    } catch {
      platformAuthenticator = false;
    }
  }

  return { supported, platformAuthenticator };
}

/**
 * Fetch list of registered passkeys for the current authenticated user
 */
export async function fetchUserPasskeys(): Promise<PasskeyItem[]> {
  const response = await axiosInstance.get('/webauthn/passkeys');
  if (response.data && response.data.success) {
    return response.data.passkeys || [];
  }
  return [];
}

/**
 * Register a new fingerprint / passkey on current device
 */
export async function registerBiometricPasskey(customName?: string): Promise<{
  success: boolean;
  message: string;
  passkey?: any;
}> {
  try {
    // 1. Get options from backend
    const optionsRes = await axiosInstance.post('/webauthn/register/options');
    const options = optionsRes.data;

    if (!options || !options.challenge) {
      throw new Error(optionsRes.data?.message || 'Gagal membuat tantangan biometrik.');
    }

    // 2. Prompt browser & device fingerprint sensor
    const attResp = await startRegistration({ optionsJSON: options });

    // 3. Send response back to backend for verification & saving
    const verifyRes = await axiosInstance.post('/webauthn/register/verify', {
      ...attResp,
      name: customName || undefined,
    });

    return verifyRes.data;
  } catch (error: any) {
    let msg = error?.response?.data?.message || error.message || 'Pendaftaran sidik jari dibatalkan atau gagal.';
    if (error.name === 'NotAllowedError') {
      msg = 'Pendaftaran dibatalkan atau waktu pemindaian habis.';
    } else if (error.name === 'InvalidStateError') {
      msg = 'Sidik jari perangkat ini sudah pernah didaftarkan pada akun Anda.';
    }
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Login using Fingerprint / Passkey
 */
export async function loginWithBiometrics(identifier?: string): Promise<{
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}> {
  try {
    // 1. Get login assertion options from backend
    const optionsRes = await axiosInstance.post('/webauthn/login/options', {
      identifier: identifier?.trim() || undefined,
    });
    const options = optionsRes.data;

    if (!options || !options.challenge) {
      throw new Error(optionsRes.data?.message || 'Gagal memulai autentikasi sidik jari.');
    }

    // 2. Prompt browser & fingerprint sensor
    const asseResp = await startAuthentication({ optionsJSON: options });

    // 3. Send assertion response to backend to verify signature & issue token
    const verifyRes = await axiosInstance.post('/webauthn/login/verify', asseResp);

    if (verifyRes.data.success && verifyRes.data.token) {
      setToken(verifyRes.data.token);
      setStoredUser(verifyRes.data.user);
    }

    return verifyRes.data;
  } catch (error: any) {
    let msg = error?.response?.data?.message || error.message || 'Login sidik jari gagal.';
    if (error.name === 'NotAllowedError') {
      msg = 'Pemindaian sidik jari dibatalkan atau sensor tidak disentuh.';
    }
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Delete a registered passkey
 */
export async function deleteUserPasskey(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const res = await axiosInstance.delete(`/webauthn/passkeys/${id}`);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || 'Gagal menghapus sidik jari.',
    };
  }
}
