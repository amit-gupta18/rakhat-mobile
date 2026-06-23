import { api, apiCall, apiWithRetryBody } from "../client";
import type {
  Invoice,
  InvoicesResponse,
  InvoiceFilters,
  CreateInvoicePayload,
} from "../../types";

export async function getInvoices(
  filters: InvoiceFilters = {}
): Promise<InvoicesResponse> {
  return apiCall(async () => {
    const searchParams = new URLSearchParams();

    if (filters.page) searchParams.set("page", String(filters.page));
    if (filters.limit) searchParams.set("limit", String(filters.limit));
    if (filters.status) searchParams.set("status", filters.status);
    if (filters.from) searchParams.set("from", filters.from);
    if (filters.to) searchParams.set("to", filters.to);
    if (filters.search) searchParams.set("search", filters.search);

    return api
      .get("invoices", { searchParams })
      .json<InvoicesResponse>();
  });
}

export async function getInvoice(id: string): Promise<Invoice> {
  return apiCall(async () => {
    return api.get(`invoices/${id}`).json<Invoice>();
  });
}

export async function createInvoice(
  payload: CreateInvoicePayload
): Promise<Invoice> {
  return apiCall(async () => {
    const client = apiWithRetryBody(payload);
    return client.post("invoices", { json: payload }).json<Invoice>();
  });
}

export async function getInvoicePdf(id: string): Promise<{ url: string }> {
  return apiCall(async () => {
    return api.get(`invoices/${id}/pdf`).json<{ url: string }>();
  });
}

export async function cancelInvoice(
  id: string
): Promise<{ id: string; status: string }> {
  return apiCall(async () => {
    return api
      .patch(`invoices/${id}/cancel`)
      .json<{ id: string; status: string }>();
  });
}
