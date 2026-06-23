import { api, apiCall } from "../client";
import type { Product, CreateProductPayload } from "../../types";

export async function getProducts(
  search?: string
): Promise<{ data: Product[] }> {
  return apiCall(async () => {
    const searchParams = new URLSearchParams();
    if (search) searchParams.set("search", search);

    return api
      .get("products", { searchParams })
      .json<{ data: Product[] }>();
  });
}

export async function getProduct(id: string): Promise<Product> {
  return apiCall(async () => {
    return api.get(`products/${id}`).json<Product>();
  });
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  return apiCall(async () => {
    return api.post("products", { json: payload }).json<Product>();
  });
}

export async function updateProduct(
  id: string,
  payload: Partial<CreateProductPayload>
): Promise<Product> {
  return apiCall(async () => {
    return api.put(`products/${id}`, { json: payload }).json<Product>();
  });
}

export async function deleteProduct(id: string): Promise<{ id: string }> {
  return apiCall(async () => {
    return api.delete(`products/${id}`).json<{ id: string }>();
  });
}
