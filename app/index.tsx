import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/stores/authStore";

export default function Index() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const memberships = useAuthStore((s) => s.memberships);

  useEffect(() => {
    if (!isHydrated) return;

    if (accessToken) {
      if (memberships.length === 0) {
        router.replace("/(app)/onboarding");
      } else {
        router.replace("/(app)");
      }
    } else {
      router.replace("/(auth)/login");
    }
  }, [isHydrated, accessToken, memberships]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#0052CC" />
    </View>
  );
}
