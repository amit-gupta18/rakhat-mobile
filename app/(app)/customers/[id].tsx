import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCustomer } from "../../../src/hooks/useCustomers";
import { Card, CardContent, CardHeader, CardTitle } from "../../../src/components/Card";
import { LoadingSpinner } from "../../../src/components/LoadingSpinner";

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: customer, isLoading } = useCustomer(id);

  if (isLoading) {
    return <LoadingSpinner message="Loading customer..." />;
  }

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Customer not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Customer Details</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary-50 items-center justify-center mr-3">
                <Text className="text-primary text-xl font-semibold">
                  {customer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <CardTitle>{customer.name}</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            {customer.phone && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500">Phone</Text>
                <Text className="font-medium text-gray-900">{customer.phone}</Text>
              </View>
            )}
            {customer.gstin && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500">GSTIN</Text>
                <Text className="font-medium text-gray-900">{customer.gstin}</Text>
              </View>
            )}
            {customer.stateCode && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500">State Code</Text>
                <Text className="font-medium text-gray-900">{customer.stateCode}</Text>
              </View>
            )}
            {customer.billingAddress && (
              <View className="py-2">
                <Text className="text-gray-500 mb-1">Billing Address</Text>
                <Text className="font-medium text-gray-900">
                  {customer.billingAddress}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
