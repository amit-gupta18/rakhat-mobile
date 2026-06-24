import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { router } from "expo-router";
import {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  uploadLogo,
} from "../api/endpoints/business";
import type {
  Business,
  Membership,
  CreateBusinessPayload,
  UpdateBusinessPayload,
} from "../types";
import { useAuthStore } from "../stores/authStore";

export function useBusinesses(
  options?: Omit<
    UseQueryOptions<{ memberships: Membership[] }>,
    "queryKey" | "queryFn"
  >
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["businesses"],
    queryFn: () => getBusinesses(),
    enabled: !!accessToken,
    staleTime: 60000,
    ...options,
  });
}

export function useBusiness(
  id?: string,
  options?: Omit<UseQueryOptions<Business>, "queryKey" | "queryFn">
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusiness(id!),
    enabled: !!accessToken && !!id,
    staleTime: 60000,
    ...options,
  });
}

export function useActiveBusiness() {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);
  return useBusiness(activeBusinessId ?? undefined);
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  const addMembership = useAuthStore((s) => s.addMembership);

  return useMutation({
    mutationFn: (payload: CreateBusinessPayload) => createBusiness(payload),
    onSuccess: async (data) => {
      await addMembership(data.membership);
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      router.replace("/(app)/(tabs)");
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBusinessPayload;
    }) => updateBusiness(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", id] });
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: ({ businessId, imageUri }: { businessId: string; imageUri: string }) =>
      uploadLogo(businessId, imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      if (activeBusinessId) {
        queryClient.invalidateQueries({
          queryKey: ["business", activeBusinessId],
        });
      }
    },
  });
}
