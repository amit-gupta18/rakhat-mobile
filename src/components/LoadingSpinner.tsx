import { View, ActivityIndicator, Text } from "react-native";

type LoadingSpinnerProps = {
  message?: string;
  size?: "small" | "large";
};

export function LoadingSpinner({ message, size = "large" }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <ActivityIndicator size={size} color="#0052CC" />
      {message && <Text className="text-gray-600 mt-2">{message}</Text>}
    </View>
  );
}
