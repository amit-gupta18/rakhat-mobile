import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardContent } from "../../src/components/Card";

export default function InsightsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 ml-4">Insights</Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Card className="w-full">
          <CardContent className="items-center py-12">
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Ionicons name="bar-chart-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              Coming Soon
            </Text>
            <Text className="text-gray-500 text-center">
              Analytics and insights will be available in the next update. View
              monthly revenue charts, top products, customer-wise billing, and
              GSTR-ready reports.
            </Text>
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  );
}
