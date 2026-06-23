import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { File, Directory, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useInvoice, useInvoicePdf, useCancelInvoice } from "../../../src/hooks/useInvoices";
import { useActiveRole } from "../../../src/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../../src/components/Card";
import { Button } from "../../../src/components/Button";
import { Badge } from "../../../src/components/Badge";
import { LoadingSpinner } from "../../../src/components/LoadingSpinner";
import { formatCurrency, formatDate } from "../../../src/utils/format";

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const role = useActiveRole();

  const { data: invoice, isLoading } = useInvoice(id);
  const { data: pdfData, refetch: fetchPdf } = useInvoicePdf(id, false);
  const cancelInvoice = useCancelInvoice();

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const { data } = await fetchPdf();
      if (data?.url && invoice) {
        const pdfDir = new Directory(Paths.cache, "pdfs");
        if (!pdfDir.exists) {
          pdfDir.create();
        }
        const pdfFile = await File.downloadFileAsync(data.url, pdfDir);
        await Sharing.shareAsync(pdfFile.uri, { mimeType: "application/pdf" });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCancelInvoice = () => {
    if (!id) return;

    Alert.alert(
      "Cancel Invoice",
      "Are you sure you want to cancel this invoice? This action cannot be undone. The invoice number will not be reused (GST compliance).",
      [
        { text: "No, Keep It", style: "cancel" },
        {
          text: "Yes, Cancel Invoice",
          style: "destructive",
          onPress: () => {
            cancelInvoice.mutate(id);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading invoice..." />;
  }

  if (!invoice) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Invoice not found</Text>
      </SafeAreaView>
    );
  }

  const canCancel =
    invoice.status === "ISSUED" && (role === "OWNER" || role === "ACCOUNTANT");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          {invoice.invoiceNumber}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              {invoice.invoiceNumber}
            </Text>
            <Text className="text-gray-500">{formatDate(invoice.invoiceDate)}</Text>
          </View>
          <Badge
            variant={invoice.status === "ISSUED" ? "success" : "destructive"}
          >
            {invoice.status}
          </Badge>
        </View>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">Invoice Number</Text>
              <Text className="font-medium text-gray-900">
                {invoice.invoiceNumber}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">Date</Text>
              <Text className="font-medium text-gray-900">
                {formatDate(invoice.invoiceDate)}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">Document Type</Text>
              <Text className="font-medium text-gray-900">
                {invoice.documentType.replace("_", " ")}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">Transaction Type</Text>
              <Text className="font-medium text-gray-900">
                {invoice.transactionType.replace("_", "-")}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 py-2">
              <Text className="text-gray-500">Payment Mode</Text>
              <Text className="font-medium text-gray-900">
                {invoice.paymentMode}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.customer ? (
              <>
                <Text className="font-medium text-gray-900">
                  {invoice.customer.name}
                </Text>
                {invoice.customer.gstin && (
                  <Text className="text-sm text-gray-500">
                    GSTIN: {invoice.customer.gstin}
                  </Text>
                )}
                {invoice.customer.billingAddress && (
                  <Text className="text-sm text-gray-500 mt-1">
                    {invoice.customer.billingAddress}
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-gray-500">Walk-in Customer</Text>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoice.items.map((item, index) => (
              <View
                key={item.id}
                className={`px-4 py-3 ${
                  index < invoice.items.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {item.nameSnapshot}
                    </Text>
                    {item.hsnSnapshot && (
                      <Text className="text-xs text-gray-400">
                        HSN: {item.hsnSnapshot}
                      </Text>
                    )}
                    <Text className="text-sm text-gray-500">
                      {item.quantity} {item.unitSnapshot} × {formatCurrency(item.unitPrice)}
                    </Text>
                  </View>
                  <Text className="font-semibold text-gray-900">
                    {formatCurrency(item.lineTotal)}
                  </Text>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">Subtotal</Text>
              <Text className="font-medium text-gray-900">
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>
            {invoice.discountTotal > 0 && (
              <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                <Text className="text-gray-500">Discount</Text>
                <Text className="font-medium text-gray-900">
                  -{formatCurrency(invoice.discountTotal)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">Taxable Amount</Text>
              <Text className="font-medium text-gray-900">
                {formatCurrency(invoice.taxableAmount)}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">CGST</Text>
              <Text className="font-medium text-gray-900">
                {formatCurrency(invoice.cgstTotal)}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">SGST</Text>
              <Text className="font-medium text-gray-900">
                {formatCurrency(invoice.sgstTotal)}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-gray-500">IGST</Text>
              <Text className="font-medium text-gray-900">
                {formatCurrency(invoice.igstTotal)}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 py-3 bg-gray-50">
              <Text className="font-semibold text-gray-900">Grand Total</Text>
              <Text className="font-bold text-lg text-gray-900">
                {formatCurrency(invoice.grandTotal)}
              </Text>
            </View>
          </CardContent>
        </Card>

        {invoice.notes && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-gray-700">{invoice.notes}</Text>
            </CardContent>
          </Card>
        )}

        <View className="flex-row gap-3 mb-8">
          <Button
            variant="outline"
            onPress={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex-1"
          >
            {downloadingPdf ? (
              <ActivityIndicator size="small" color="#0052CC" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="share-outline" size={18} color="#374151" />
                <Text className="text-gray-900 font-semibold ml-2">Share PDF</Text>
              </View>
            )}
          </Button>

          {canCancel && (
            <Button
              variant="destructive"
              onPress={handleCancelInvoice}
              loading={cancelInvoice.isPending}
              className="flex-1"
            >
              Cancel Invoice
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
