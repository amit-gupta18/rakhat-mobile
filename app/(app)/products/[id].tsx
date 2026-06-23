import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProduct } from "../../../src/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../src/components/Card";
import { LoadingSpinner } from "../../../src/components/LoadingSpinner";
import { formatCurrency } from "../../../src/utils/format";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return <LoadingSpinner message="Loading product..." />;
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Product Details</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-500">Selling Price</Text>
              <Text className="font-medium text-gray-900">
                {formatCurrency(product.sellingPrice)}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-500">GST Rate</Text>
              <Text className="font-medium text-gray-900">{product.gstRate}%</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-500">Unit</Text>
              <Text className="font-medium text-gray-900">{product.unit}</Text>
            </View>
            {product.hsnCode && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500">HSN Code</Text>
                <Text className="font-medium text-gray-900">{product.hsnCode}</Text>
              </View>
            )}
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-500">Stock Quantity</Text>
              <Text className="font-medium text-gray-900">{product.quantity}</Text>
            </View>
            {product.location && (
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-500">Location</Text>
                <Text className="font-medium text-gray-900">{product.location}</Text>
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
