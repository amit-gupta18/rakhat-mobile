import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../src/stores/authStore";
import { useOfflineSync } from "../../src/hooks/useOfflineSync";

function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  useOfflineSync();
  return <>{children}</>;
}

export default function AppLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (isHydrated && !accessToken) {
      router.replace("/(auth)/login");
    }
  }, [isHydrated, accessToken]);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  if (!accessToken) {
    return null;
  }

  return (
    <OfflineSyncProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="invoices" />
        <Stack.Screen name="products" />
        <Stack.Screen name="customers" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="payments" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="team" />
      </Stack>
    </OfflineSyncProvider>
  );
}
