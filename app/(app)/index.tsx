import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useInvoices } from "../../src/hooks/useInvoices";
import { useCustomers } from "../../src/hooks/useCustomers";
import { useActiveBusiness } from "../../src/hooks/useBusiness";
import { useLogout } from "../../src/hooks/useAuth";
import { useAuthStore, useActiveRole } from "../../src/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { Badge } from "../../src/components/Badge";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { EmptyState } from "../../src/components/EmptyState";
import { formatCurrency, formatDate, getMonthStartEnd } from "../../src/utils/format";

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const role = useActiveRole();
  const logout = useLogout();
  const { data: business } = useActiveBusiness();
  const { start, end } = getMonthStartEnd();

  const {
    data: recentInvoices,
    isLoading: loadingRecent,
    refetch: refetchRecent,
  } = useInvoices({ limit: 5 });

  const {
    data: monthInvoices,
    isLoading: loadingMonth,
    refetch: refetchMonth,
  } = useInvoices({ from: start, to: end, limit: 100 });

  const {
    data: customers,
    isLoading: loadingCustomers,
    refetch: refetchCustomers,
  } = useCustomers();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchRecent(), refetchMonth(), refetchCustomers()]);
    setRefreshing(false);
  };

  const monthTotal = monthInvoices?.data
    .filter((inv) => inv.status === "ISSUED")
    .reduce((sum, inv) => sum + inv.grandTotal, 0) ?? 0;

  const monthInvoiceCount = monthInvoices?.data.filter(
    (inv) => inv.status === "ISSUED"
  ).length ?? 0;

  const customerCount = customers?.data.length ?? 0;

  const isLoading = loadingRecent || loadingMonth || loadingCustomers;

  if (isLoading && !refreshing) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {business?.tradeName ?? "Dashboard"}
              </Text>
              <Text className="text-gray-500 text-sm">
                {role === "OWNER" ? "Owner" : role === "ACCOUNTANT" ? "Accountant" : "Viewer"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push("/(app)/settings")}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="settings-outline" size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => logout.mutate()}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="log-out-outline" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row gap-3 mb-6">
            <Card className="flex-1">
              <CardContent className="p-3">
                <Text className="text-xs text-gray-500 mb-1">This Month</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {formatCurrency(monthTotal)}
                </Text>
                <Text className="text-xs text-gray-500">
                  {monthInvoiceCount} invoices
                </Text>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="p-3">
                <Text className="text-xs text-gray-500 mb-1">Customers</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {customerCount}
                </Text>
                <Text className="text-xs text-gray-500">total</Text>
              </CardContent>
            </Card>
          </View>

          {(role === "OWNER" || role === "ACCOUNTANT") && (
            <Button
              onPress={() => router.push("/(app)/invoices/create")}
              className="mb-6"
            >
              <View className="flex-row items-center">
                <Ionicons name="add" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">New Invoice</Text>
              </View>
            </Button>
          )}

          <Card className="mb-4">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Link href="/(app)/invoices" asChild>
                <TouchableOpacity>
                  <Text className="text-primary text-sm font-medium">View all</Text>
                </TouchableOpacity>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentInvoices?.data.length === 0 ? (
                <View className="p-4">
                  <EmptyState
                    icon="document-text-outline"
                    title="No invoices yet"
                    description="Create your first invoice to get started"
                    actionLabel="Create Invoice"
                    onAction={() => router.push("/(app)/invoices/create")}
                  />
                </View>
              ) : (
                recentInvoices?.data.map((invoice, index) => (
                  <TouchableOpacity
                    key={invoice.id}
                    onPress={() => router.push(`/(app)/invoices/${invoice.id}`)}
                    className={`px-4 py-3 flex-row items-center justify-between ${
                      index < (recentInvoices.data.length - 1) ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {invoice.customerName ?? "Walk-in"} • {formatDate(invoice.invoiceDate)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-semibold text-gray-900">
                        {formatCurrency(invoice.grandTotal)}
                      </Text>
                      <Badge
                        variant={invoice.status === "ISSUED" ? "success" : "destructive"}
                      >
                        {invoice.status}
                      </Badge>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </CardContent>
          </Card>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(app)/products")}
              className="flex-1"
            >
              <Card>
                <CardContent className="p-4 items-center">
                  <Ionicons name="cube-outline" size={24} color="#0052CC" />
                  <Text className="text-gray-900 font-medium mt-2">Products</Text>
                </CardContent>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(app)/customers")}
              className="flex-1"
            >
              <Card>
                <CardContent className="p-4 items-center">
                  <Ionicons name="people-outline" size={24} color="#0052CC" />
                  <Text className="text-gray-900 font-medium mt-2">Customers</Text>
                </CardContent>
              </Card>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
