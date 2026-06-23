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
import { useCustomers } from "../../../src/hooks/useCustomers";
import { useActiveRole } from "../../../src/stores/authStore";
import { Card, CardContent } from "../../../src/components/Card";
import { Button } from "../../../src/components/Button";
import { LoadingSpinner } from "../../../src/components/LoadingSpinner";
import { EmptyState } from "../../../src/components/EmptyState";
import type { Customer } from "../../../src/types";

export default function CustomersScreen() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const role = useActiveRole();

  const { data, isLoading, refetch } = useCustomers(search || undefined);
  const customers = data?.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/customers/${item.id}`)}
      className="mb-3"
    >
      <Card>
        <CardContent className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mr-3">
            <Text className="text-primary font-semibold">
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-medium text-gray-900">{item.name}</Text>
            {item.phone && (
              <Text className="text-sm text-gray-500">{item.phone}</Text>
            )}
            {item.gstin && (
              <Text className="text-xs text-gray-400">GSTIN: {item.gstin}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
          <Text className="text-xl font-bold text-gray-900">Customers</Text>
          <View className="w-6" />
        </View>

        <View className="flex-row items-center bg-white border border-gray-200 rounded-md px-3 mb-4">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-2.5 px-2 text-base text-gray-900"
            placeholder="Search customers..."
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
            onPress={() => router.push("/(app)/customers/create")}
            className="mb-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">Add Customer</Text>
            </View>
          </Button>
        )}
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner message="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No customers yet"
          description="Add your first customer to get started"
          actionLabel={role === "OWNER" || role === "ACCOUNTANT" ? "Add Customer" : undefined}
          onAction={
            role === "OWNER" || role === "ACCOUNTANT"
              ? () => router.push("/(app)/customers/create")
              : undefined
          }
        />
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomer}
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
