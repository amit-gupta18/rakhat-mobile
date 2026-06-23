import { View, Text } from "react-native";

type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <View className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
      <Text className="text-sm text-red-700">{message}</Text>
    </View>
  );
}
