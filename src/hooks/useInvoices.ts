import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { router } from "expo-router";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  getInvoicePdf,
  cancelInvoice,
} from "../api/endpoints/invoices";
import type {
  Invoice,
  InvoicesResponse,
  InvoiceFilters,
  CreateInvoicePayload,
} from "../types";
import { useAuthStore } from "../stores/authStore";

export function useInvoices(
  filters: InvoiceFilters = {},
  options?: Omit<UseQueryOptions<InvoicesResponse>, "queryKey" | "queryFn">
) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["invoices", activeBusinessId, filters],
    queryFn: () => getInvoices(filters),
    enabled: !!activeBusinessId,
    staleTime: 60000,
    ...options,
  });
}

export function useInvoice(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Invoice>, "queryKey" | "queryFn">
) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["invoice", activeBusinessId, id],
    queryFn: () => getInvoice(id!),
    enabled: !!activeBusinessId && !!id,
    staleTime: 60000,
    ...options,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["invoices", activeBusinessId],
      });
      router.push(`/(app)/invoices/${data.id}`);
    },
  });
}

export function useInvoicePdf(id: string | undefined, enabled: boolean = false) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["invoice-pdf", activeBusinessId, id],
    queryFn: () => getInvoicePdf(id!),
    enabled: !!activeBusinessId && !!id && enabled,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: (id: string) => cancelInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["invoices", activeBusinessId],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice", activeBusinessId, id],
      });
    },
  });
}
