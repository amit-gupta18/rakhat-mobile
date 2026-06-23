import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = "document-text-outline",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="bg-gray-100 rounded-full p-4 mb-4">
        <Ionicons name={icon} size={48} color="#6B7280" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-gray-600 text-center mb-4">{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction}>{actionLabel}</Button>
      )}
    </View>
  );
}
