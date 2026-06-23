import { api, apiCall } from "../client";
import type { Customer, CreateCustomerPayload } from "../../types";

export async function getCustomers(
  search?: string
): Promise<{ data: Customer[] }> {
  return apiCall(async () => {
    const searchParams = new URLSearchParams();
    if (search) searchParams.set("search", search);

    return api
      .get("customers", { searchParams })
      .json<{ data: Customer[] }>();
  });
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiCall(async () => {
    return api.get(`customers/${id}`).json<Customer>();
  });
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<Customer> {
  return apiCall(async () => {
    return api.post("customers", { json: payload }).json<Customer>();
  });
}

export async function updateCustomer(
  id: string,
  payload: Partial<CreateCustomerPayload>
): Promise<Customer> {
  return apiCall(async () => {
    return api.put(`customers/${id}`, { json: payload }).json<Customer>();
  });
}

export async function deleteCustomer(id: string): Promise<{ id: string }> {
  return apiCall(async () => {
    return api.delete(`customers/${id}`).json<{ id: string }>();
  });
}
