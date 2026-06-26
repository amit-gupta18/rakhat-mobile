import ky, { HTTPError } from "ky";
import { useAuthStore } from "../stores/authStore";
import {
  getAccessToken,
  getRefreshToken,
  getBusinessId,
  setAccessToken,
  setRefreshToken,
  clearAllTokens,
} from "../utils/secureStore";
import { router } from "expo-router";
import { API_BASE_URL } from "../config/env";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await ky
      .post(`${API_BASE_URL}/auth/refresh`, {
        json: { refreshToken },
        timeout: 30000,
      })
      .json<{
        accessToken: string;
        refreshToken?: string;
        user: { id: string; email: string };
        memberships: Array<{
          businessId: string;
          tradeName: string;
          role: "OWNER" | "ACCOUNTANT" | "VIEWER";
          gstin: string | null;
          stateCode: string;
        }>;
      }>();

    await setAccessToken(response.accessToken);
    if (response.refreshToken) {
      await setRefreshToken(response.refreshToken);
    }
    useAuthStore.getState().setAccessToken(response.accessToken);

    return response.accessToken;
  } catch {
    return null;
  }
}

async function handleTokenRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken();

  try {
    const token = await refreshPromise;
    return token;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

async function handleAuthFailure(): Promise<void> {
  await clearAllTokens();
  await useAuthStore.getState().clearAuth();
  router.replace("/(auth)/login");
}

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      async (request) => {
        const accessToken = await getAccessToken();
        const businessId = await getBusinessId();

        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        if (businessId) {
          request.headers.set("X-Business-Id", businessId);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401) {
          const newToken = await handleTokenRefresh();

          if (newToken) {
            const retryHeaders = new Headers(request.headers);
            retryHeaders.set("Authorization", `Bearer ${newToken}`);

            const retryOptions: RequestInit = {
              method: request.method,
              headers: retryHeaders,
              credentials: request.credentials,
            };

            if (
              request.method !== "GET" &&
              request.method !== "HEAD" &&
              !request.bodyUsed
            ) {
              retryOptions.body = request.body;
            }

            return fetch(request.url, retryOptions);
          } else {
            await handleAuthFailure();
            throw new Error("Session expired. Please log in again.");
          }
        }
        return response;
      },
    ],
  },
});

export const apiWithRetryBody = (body: unknown) => {
  return ky.create({
    prefixUrl: API_BASE_URL,
    timeout: 30000,
    hooks: {
      beforeRequest: [
        async (request) => {
          const accessToken = await getAccessToken();
          const businessId = await getBusinessId();

          if (accessToken) {
            request.headers.set("Authorization", `Bearer ${accessToken}`);
          }
          if (businessId) {
            request.headers.set("X-Business-Id", businessId);
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            const newToken = await handleTokenRefresh();

            if (newToken) {
              return ky(request.url, {
                ...options,
                method: request.method,
                headers: {
                  ...Object.fromEntries(request.headers.entries()),
                  Authorization: `Bearer ${newToken}`,
                },
                json: body,
              });
            } else {
              await handleAuthFailure();
              throw new Error("Session expired. Please log in again.");
            }
          }
          return response;
        },
      ],
    },
  });
};

export async function apiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HTTPError) {
      const body = await err.response.json().catch(() => ({})) as { error?: string; message?: string };
      throw new Error(body?.error ?? body?.message ?? "Something went wrong");
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Could not reach the server");
  }
}

export { HTTPError };
