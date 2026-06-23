import { create } from "zustand";
import type { Membership, Role } from "../types";
import {
  setAccessToken as storeAccessToken,
  setBusinessId as storeBusinessId,
  clearAllTokens,
  storeSession as storeSessionToSecure,
} from "../utils/secureStore";

type AuthState = {
  userId: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  memberships: Membership[];
  activeBusinessId: string | null;
  isHydrated: boolean;

  setSession: (p: {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    memberships: Membership[];
  }) => Promise<void>;
  setAccessToken: (accessToken: string) => Promise<void>;
  setActiveBusiness: (businessId: string) => Promise<void>;
  addMembership: (m: Membership) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: (p: {
    userId: string | null;
    email: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    activeBusinessId: string | null;
    memberships: Membership[];
  }) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  email: null,
  accessToken: null,
  refreshToken: null,
  memberships: [],
  activeBusinessId: null,
  isHydrated: false,

  setSession: async ({ userId, email, accessToken, refreshToken, memberships }) => {
    const activeBusinessId = memberships.length > 0 ? memberships[0].businessId : null;

    await storeSessionToSecure({
      accessToken: accessToken || undefined,
      refreshToken: refreshToken || undefined,
      userId: userId || undefined,
      email: email || undefined,
      businessId: activeBusinessId || undefined,
    });

    set({
      userId,
      email,
      accessToken,
      refreshToken,
      memberships,
      activeBusinessId,
      isHydrated: true,
    });
  },

  setAccessToken: async (accessToken) => {
    await storeAccessToken(accessToken);
    set({ accessToken });
  },

  setActiveBusiness: async (businessId) => {
    await storeBusinessId(businessId);
    set({ activeBusinessId: businessId });
  },

  addMembership: async (membership) => {
    await storeBusinessId(membership.businessId);
    set((state) => ({
      memberships: [...state.memberships, membership],
      activeBusinessId: membership.businessId,
    }));
  },

  clearAuth: async () => {
    await clearAllTokens();
    set({
      userId: null,
      email: null,
      accessToken: null,
      refreshToken: null,
      memberships: [],
      activeBusinessId: null,
    });
  },

  hydrate: ({ userId, email, accessToken, refreshToken, activeBusinessId, memberships }) => {
    set({
      userId,
      email,
      accessToken,
      refreshToken,
      activeBusinessId,
      memberships,
      isHydrated: true,
    });
  },
}));

export const useActiveRole = (): Role | null => {
  return useAuthStore((s) =>
    s.activeBusinessId
      ? s.memberships.find((m) => m.businessId === s.activeBusinessId)?.role ?? null
      : null
  );
};

export const useActiveMembership = (): Membership | null => {
  return useAuthStore((s) =>
    s.activeBusinessId
      ? s.memberships.find((m) => m.businessId === s.activeBusinessId) ?? null
      : null
  );
};

export const useIsAuthenticated = (): boolean => {
  return useAuthStore((s) => s.accessToken !== null);
};
