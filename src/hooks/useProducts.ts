import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/endpoints/products";
import type { Product, CreateProductPayload } from "../types";
import { useAuthStore } from "../stores/authStore";

export function useProducts(
  search?: string,
  options?: Omit<UseQueryOptions<{ data: Product[] }>, "queryKey" | "queryFn">
) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["products", activeBusinessId, search],
    queryFn: () => getProducts(search),
    enabled: !!activeBusinessId,
    staleTime: 60000,
    ...options,
  });
}

export function useProductSearch(search: string, enabled: boolean = true) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["products", activeBusinessId, "search", search],
    queryFn: () => getProducts(search),
    enabled: !!activeBusinessId && enabled && search.length > 0,
    staleTime: 30000,
  });
}

export function useProduct(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Product>, "queryKey" | "queryFn">
) {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["product", activeBusinessId, id],
    queryFn: () => getProduct(id!),
    enabled: !!activeBusinessId && !!id,
    staleTime: 60000,
    ...options,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", activeBusinessId],
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateProductPayload>;
    }) => updateProduct(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["products", activeBusinessId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product", activeBusinessId, id],
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", activeBusinessId],
      });
    },
  });
}
