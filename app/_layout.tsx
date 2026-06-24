import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/stores/authStore";
import { getStoredSession } from "../src/utils/secureStore";
import { refreshSession } from "../src/api/endpoints/auth";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);
  const setSession = useAuthStore((s) => s.setSession);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        const stored = await getStoredSession();

        if (stored.refreshToken) {
          const refreshed = await refreshSession();
          if (refreshed) {
            await setSession({
              userId: refreshed.user.id,
              email: refreshed.user.email,
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken ?? stored.refreshToken,
              memberships: refreshed.memberships,
            });
          } else {
            await clearAuth();
          }
        } else {
          hydrate({
            userId: null,
            email: null,
            accessToken: null,
            refreshToken: null,
            activeBusinessId: null,
            memberships: [],
          });
        }
      } catch {
        hydrate({
          userId: null,
          email: null,
          accessToken: null,
          refreshToken: null,
          activeBusinessId: null,
          memberships: [],
        });
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View className="flex-1 bg-white">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
          <StatusBar style="dark" />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
