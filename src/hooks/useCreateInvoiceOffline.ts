import { useState } from "react";
import { Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { createInvoice } from "../api/endpoints/invoices";
import { addToOfflineQueue } from "../utils/offlineQueue";
import { useAuthStore } from "../stores/authStore";
import type { CreateInvoicePayload, Invoice } from "../types";

export function useCreateInvoiceOffline() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);
  const [isOffline, setIsOffline] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload: CreateInvoicePayload): Promise<Invoice | null> => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        setIsOffline(true);
        await addToOfflineQueue(payload);
        return null;
      }

      setIsOffline(false);
      return createInvoice(payload);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["invoices", activeBusinessId],
        });
        router.push(`/(app)/invoices/${data.id}`);
      } else {
        Alert.alert(
          "Saved Offline",
          "Your invoice has been saved and will be synced when you're back online.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    },
  });

  return {
    ...mutation,
    isOffline,
  };
}
