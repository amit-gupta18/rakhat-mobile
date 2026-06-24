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
import { useInvoices } from "../../../src/hooks/useInvoices";
import { useActiveRole } from "../../../src/stores/authStore";
import { Card, CardContent } from "../../../src/components/Card";
import { Button } from "../../../src/components/Button";
import { Badge } from "../../../src/components/Badge";
import { LoadingSpinner } from "../../../src/components/LoadingSpinner";
import { EmptyState } from "../../../src/components/EmptyState";
import { formatCurrency, formatDate } from "../../../src/utils/format";
import type { InvoiceListItem, InvoiceStatus } from "../../../src/types";

const STATUS_FILTERS: { value: InvoiceStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ISSUED", label: "Issued" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function SalesScreen() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const role = useActiveRole();

  const { data, isLoading, refetch } = useInvoices({
    page,
    limit: 20,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: search || undefined,
  });

  const invoices = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasMore = page * 20 < total;

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const renderInvoice = ({ item }: { item: InvoiceListItem }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/invoices/${item.id}`)}
      className="mb-3"
    >
      <Card>
        <CardContent className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">
              {item.invoiceNumber}
            </Text>
            <Text className="text-sm text-gray-500">
              {item.customerName ?? "Walk-in"} • {formatDate(item.invoiceDate)}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              {item.paymentMode}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-bold text-gray-900">
              {formatCurrency(item.grandTotal)}
            </Text>
            <Badge
              variant={item.status === "ISSUED" ? "success" : "destructive"}
              className="mt-1"
            >
              {item.status}
            </Badge>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Invoices</Text>

        <View className="flex-row items-center bg-white border border-gray-200 rounded-md px-3 mb-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-2.5 px-2 text-base text-gray-900"
            placeholder="Search invoice number..."
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

        <View className="flex-row gap-2 mb-4">
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              onPress={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full ${
                statusFilter === filter.value
                  ? "bg-primary"
                  : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  statusFilter === filter.value ? "text-white" : "text-gray-700"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(role === "OWNER" || role === "ACCOUNTANT") && (
          <Button
            onPress={() => router.push("/(app)/invoices/create")}
            className="mb-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">New Invoice</Text>
            </View>
          </Button>
        )}
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner message="Loading invoices..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No invoices found"
          description={
            search || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Create your first invoice to get started"
          }
          actionLabel={
            !search && statusFilter === "ALL" && (role === "OWNER" || role === "ACCOUNTANT")
              ? "Create Invoice"
              : undefined
          }
          onAction={
            !search && statusFilter === "ALL" && (role === "OWNER" || role === "ACCOUNTANT")
              ? () => router.push("/(app)/invoices/create")
              : undefined
          }
        />
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderInvoice}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={() => {
            if (hasMore && !isLoading) {
              setPage((p) => p + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View className="py-4">
                <Text className="text-center text-gray-500">Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
