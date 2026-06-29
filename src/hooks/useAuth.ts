import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  signup,
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  type SignupPayload,
  type LoginPayload,
  type ForgotPasswordPayload,
  type VerifyOtpPayload,
  type ResetPasswordPayload,
} from "../api/endpoints/auth";
import { useAuthStore } from "../stores/authStore";

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),
    onSuccess: async (data) => {
      await setSession({
        userId: data.user.id,
        email: data.user.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        memberships: data.memberships,
      });
      router.replace("/(app)/(tabs)");
    },
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async (data) => {
      await setSession({
        userId: data.user.id,
        email: data.user.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        memberships: data.memberships,
      });

      if (data.memberships.length === 0) {
        router.replace("/(app)/onboarding");
      } else {
        router.replace("/(app)/(tabs)");
      }
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: async () => {
      await clearAuth();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
    onSuccess: (_, variables) => {
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: variables.email },
      });
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    onSuccess: (data) => {
      router.push({
        pathname: "/(auth)/reset-password",
        params: { token: data.resetToken },
      });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
    onSuccess: () => {
      router.replace("/(auth)/login");
    },
  });
}
