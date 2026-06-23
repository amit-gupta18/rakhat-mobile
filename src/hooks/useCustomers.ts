import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/endpoints/customers";
import type { Customer, CreateCustomerPayload } from "../types";
import { useAuthStore } from "../stores/authStore";

export function useCustomers(
  search?: string,
  options?: Omit<UseQueryOptions<{ data: Customer[] }>, "queryKey" | "queryFn">
) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["customers", activeBusinessId, search],
    queryFn: () => getCustomers(search),
    enabled: !!activeBusinessId,
    staleTime: 60000,
    ...options,
  });
}

export function useCustomerSearch(search: string, enabled: boolean = true) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["customers", activeBusinessId, "search", search],
    queryFn: () => getCustomers(search),
    enabled: !!activeBusinessId && enabled && search.length > 0,
    staleTime: 30000,
  });
}

export function useCustomer(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Customer>, "queryKey" | "queryFn">
) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["customer", activeBusinessId, id],
    queryFn: () => getCustomer(id!),
    enabled: !!activeBusinessId && !!id,
    staleTime: 60000,
    ...options,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers", activeBusinessId],
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCustomerPayload>;
    }) => updateCustomer(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["customers", activeBusinessId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer", activeBusinessId, id],
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers", activeBusinessId],
      });
    },
  });
}
