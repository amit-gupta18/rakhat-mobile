import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "../../../src/hooks/useProducts";
import { useActiveRole } from "../../../src/stores/authStore";
import { Card, CardContent } from "../../../src/components/Card";
import { Button } from "../../../src/components/Button";
import { LoadingSpinner } from "../../../src/components/LoadingSpinner";
import { EmptyState } from "../../../src/components/EmptyState";
import { formatCurrency } from "../../../src/utils/format";
import type { Product } from "../../../src/types";

export default function ProductsScreen() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const role = useActiveRole();

  const { data, isLoading, refetch } = useProducts(search || undefined);
  const products = data?.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/products/${item.id}`)}
      className="mb-3"
    >
      <Card>
        <CardContent className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-medium text-gray-900">{item.name}</Text>
            <Text className="text-sm text-gray-500">
              {item.hsnCode ? `HSN: ${item.hsnCode} • ` : ""}
              {item.unit} • GST {item.gstRate}%
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-semibold text-gray-900">
              {formatCurrency(item.sellingPrice)}
            </Text>
            <Text className="text-xs text-gray-500">
              Stock: {item.quantity}
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Products</Text>
          <View className="w-6" />
        </View>

        <View className="flex-row items-center bg-white border border-gray-200 rounded-md px-3 mb-4">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-2.5 px-2 text-base text-gray-900"
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {(role === "OWNER" || role === "ACCOUNTANT") && (
          <Button
            onPress={() => router.push("/(app)/products/create")}
            className="mb-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">Add Product</Text>
            </View>
          </Button>
        )}
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="No products yet"
          description="Add your first product to get started"
          actionLabel={role === "OWNER" || role === "ACCOUNTANT" ? "Add Product" : undefined}
          onAction={
            role === "OWNER" || role === "ACCOUNTANT"
              ? () => router.push("/(app)/products/create")
              : undefined
          }
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
