import { useEffect, useRef, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { createInvoice } from "../api/endpoints/invoices";
import {
  getOfflineQueue,
  removeFromOfflineQueue,
  incrementRetryCount,
  shouldRetry,
} from "../utils/offlineQueue";
import { useAuthStore } from "../stores/authStore";

export function useOfflineSync() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);
  const isSyncing = useRef(false);

  const syncQueue = useCallback(async () => {
    if (isSyncing.current) return;
    if (!activeBusinessId) return;

    const queue = await getOfflineQueue();
    if (queue.length === 0) return;

    isSyncing.current = true;

    let successCount = 0;
    let failCount = 0;

    for (const item of queue) {
      try {
        await createInvoice(item.payload);
        await removeFromOfflineQueue(item.id);
        successCount++;
      } catch (error) {
        await incrementRetryCount(item.id);
        if (!shouldRetry(item)) {
          await removeFromOfflineQueue(item.id);
          failCount++;
        }
      }
    }

    isSyncing.current = false;

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["invoices", activeBusinessId] });
    }

    if (successCount > 0 || failCount > 0) {
      const message = [];
      if (successCount > 0) {
        message.push(`${successCount} invoice(s) synced successfully`);
      }
      if (failCount > 0) {
        message.push(`${failCount} invoice(s) failed after max retries`);
      }
      Alert.alert("Offline Sync", message.join("\n"));
    }
  }, [activeBusinessId, queryClient]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncQueue();
      }
    });

    NetInfo.fetch().then((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncQueue();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [syncQueue]);

  return {
    syncQueue,
  };
}
