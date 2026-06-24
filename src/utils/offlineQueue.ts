import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateId } from "./id";
import type { CreateInvoicePayload, OfflineInvoice } from "../types";

const QUEUE_KEY = "@offline_invoice_queue";
const MAX_RETRIES = 3;

export async function getOfflineQueue(): Promise<OfflineInvoice[]> {
  try {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function addToOfflineQueue(payload: CreateInvoicePayload): Promise<OfflineInvoice> {
  const queue = await getOfflineQueue();
  const offlineInvoice: OfflineInvoice = {
    id: generateId(),
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
  queue.push(offlineInvoice);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return offlineInvoice;
}

export async function removeFromOfflineQueue(id: string): Promise<void> {
  const queue = await getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

export async function incrementRetryCount(id: string): Promise<void> {
  const queue = await getOfflineQueue();
  const updated = queue.map((item) =>
    item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
  );
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
}

export function shouldRetry(item: OfflineInvoice): boolean {
  return item.retryCount < MAX_RETRIES;
}

export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function getQueueSize(): Promise<number> {
  const queue = await getOfflineQueue();
  return queue.length;
}
