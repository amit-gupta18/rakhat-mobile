import ky from "ky";
import { api, apiCall } from "../client";
import type { AuthResponse } from "../../types";
import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  storeSession,
} from "../../utils/secureStore";
import { useAuthStore } from "../../stores/authStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.raseed.in/v1";

export type SignupPayload = {
  email: string;
  password: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  phone: string;
};

export type VerifyOtpPayload = {
  phone: string;
  otp: string;
};

export type ResetPasswordPayload = {
  resetToken: string;
  newPassword: string;
};

type AuthResponseWithRefresh = AuthResponse & {
  refreshToken: string;
};

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  return apiCall(async () => {
    const response = await ky
      .post(`${BASE_URL}/auth/signup`, {
        json: payload,
        timeout: 30000,
      })
      .json<AuthResponseWithRefresh>();

    await storeSession({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      userId: response.user.id,
      email: response.user.email,
      businessId: response.memberships[0]?.businessId,
    });

    return response;
  });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiCall(async () => {
    const response = await ky
      .post(`${BASE_URL}/auth/login`, {
        json: payload,
        timeout: 30000,
      })
      .json<AuthResponseWithRefresh>();

    await storeSession({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      userId: response.user.id,
      email: response.user.email,
      businessId: response.memberships[0]?.businessId,
    });

    return response;
  });
}

export async function logout(): Promise<void> {
  return apiCall(async () => {
    const refreshToken = await getRefreshToken();
    try {
      await api.post("auth/logout", {
        json: refreshToken ? { refreshToken } : {},
      });
    } catch {
      // Ignore errors on logout - we'll clear local state anyway
    }
  });
}

export async function refreshSession(): Promise<AuthResponse | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await ky
      .post(`${BASE_URL}/auth/refresh`, {
        json: { refreshToken },
        timeout: 30000,
      })
      .json<AuthResponseWithRefresh>();

    await setAccessToken(response.accessToken);
    if (response.refreshToken) {
      await setRefreshToken(response.refreshToken);
    }

    return response;
  } catch {
    return null;
  }
}

export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<{ message: string }> {
  return apiCall(async () => {
    return ky
      .post(`${BASE_URL}/auth/forgot-password`, {
        json: payload,
        timeout: 30000,
      })
      .json<{ message: string }>();
  });
}

export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<{ resetToken: string }> {
  return apiCall(async () => {
    return ky
      .post(`${BASE_URL}/auth/verify-otp`, {
        json: payload,
        timeout: 30000,
      })
      .json<{ resetToken: string }>();
  });
}

export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<{ message: string }> {
  return apiCall(async () => {
    return ky
      .post(`${BASE_URL}/auth/reset-password`, {
        json: payload,
        timeout: 30000,
      })
      .json<{ message: string }>();
  });
}
