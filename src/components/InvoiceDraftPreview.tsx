import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { Business, Customer, GSTOutput, LineItem, PaymentMode } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { INDIAN_STATES } from "../utils/gst";

type InvoiceDraftPreviewProps = {
  visible: boolean;
  onClose: () => void;
  business?: Business | null;
  customer: Customer | null;
  invoiceDate: string;
  paymentMode: PaymentMode;
  notes: string;
  items: LineItem[];
  gstResult: GSTOutput;
};

function stateName(code: string | null | undefined): string {
  if (!code) return "—";
  return INDIAN_STATES.find((s) => s.code === code)?.name ?? code;
}

export function InvoiceDraftPreview({
  visible,
  onClose,
  business,
  customer,
  invoiceDate,
  paymentMode,
  notes,
  items,
  gstResult,
}: InvoiceDraftPreviewProps) {
  const validItems = items.filter((item) => item.name && item.quantity > 0);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-base font-semibold text-gray-900">
            Invoice Preview
          </Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <Text className="text-xs text-gray-500 mb-1">Draft preview</Text>
            <Text className="text-lg font-bold text-gray-900">
              {business?.tradeName ?? "Your Business"}
            </Text>
            {business?.legalName ? (
              <Text className="text-sm text-gray-600">{business.legalName}</Text>
            ) : null}
            {business?.address ? (
              <Text className="text-sm text-gray-500 mt-1">{business.address}</Text>
            ) : null}
            {business?.gstin ? (
              <Text className="text-sm text-gray-500 mt-1">
                GSTIN: {business.gstin}
              </Text>
            ) : null}
            <Text className="text-sm text-gray-500">
              State: {stateName(business?.stateCode)}
            </Text>
          </View>

          <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Invoice Details
            </Text>
            <Text className="text-sm text-gray-600">Date: {formatDate(invoiceDate)}</Text>
            <Text className="text-sm text-gray-600">Payment: {paymentMode}</Text>
            <Text className="text-sm text-gray-600">
              Type: {gstResult.documentType.replace("_", " ")}
            </Text>
          </View>

          <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Bill To</Text>
            {customer ? (
              <>
                <Text className="text-sm text-gray-900">{customer.name}</Text>
                {customer.gstin ? (
                  <Text className="text-sm text-gray-500">
                    GSTIN: {customer.gstin}
                  </Text>
                ) : null}
                {customer.stateCode ? (
                  <Text className="text-sm text-gray-500">
                    State: {stateName(customer.stateCode)}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text className="text-sm text-gray-500">Walk-in Customer</Text>
            )}
          </View>

          <View className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
            <View className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <Text className="text-sm font-semibold text-gray-900">Items</Text>
            </View>
            {validItems.length === 0 ? (
              <View className="px-4 py-6">
                <Text className="text-sm text-gray-500 text-center">
                  Add at least one item to preview totals.
                </Text>
              </View>
            ) : (
              validItems.map((item) => {
                const itemIndex = items.findIndex((entry) => entry.id === item.id);
                const line = gstResult.lines[itemIndex];
                return (
                  <View
                    key={item.id}
                    className={`px-4 py-3 ${
                      item.id !== validItems[validItems.length - 1]?.id
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <View className="flex-row justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">{item.name}</Text>
                        <Text className="text-xs text-gray-500">
                          {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} • GST{" "}
                          {item.gstRate}%
                        </Text>
                      </View>
                      <Text className="font-semibold text-gray-900">
                        {formatCurrency(line?.lineTotal ?? 0)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
            <View className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <Text className="text-sm font-semibold text-gray-900">Summary</Text>
            </View>
            <View className="px-4 py-2 flex-row justify-between border-b border-gray-100">
              <Text className="text-gray-500">Subtotal</Text>
              <Text className="text-gray-900">
                {formatCurrency(gstResult.summary.subtotal)}
              </Text>
            </View>
            <View className="px-4 py-2 flex-row justify-between border-b border-gray-100">
              <Text className="text-gray-500">Taxable Amount</Text>
              <Text className="text-gray-900">
                {formatCurrency(gstResult.summary.taxableAmount)}
              </Text>
            </View>
            {gstResult.transactionType === "INTER_STATE" ? (
              <View className="px-4 py-2 flex-row justify-between border-b border-gray-100">
                <Text className="text-gray-500">IGST</Text>
                <Text className="text-gray-900">
                  {formatCurrency(gstResult.summary.igstTotal)}
                </Text>
              </View>
            ) : (
              <>
                <View className="px-4 py-2 flex-row justify-between border-b border-gray-100">
                  <Text className="text-gray-500">CGST</Text>
                  <Text className="text-gray-900">
                    {formatCurrency(gstResult.summary.cgstTotal)}
                  </Text>
                </View>
                <View className="px-4 py-2 flex-row justify-between border-b border-gray-100">
                  <Text className="text-gray-500">SGST</Text>
                  <Text className="text-gray-900">
                    {formatCurrency(gstResult.summary.sgstTotal)}
                  </Text>
                </View>
              </>
            )}
            <View className="px-4 py-3 flex-row justify-between bg-primary-50">
              <Text className="font-semibold text-gray-900">Grand Total</Text>
              <Text className="font-bold text-primary">
                {formatCurrency(gstResult.summary.grandTotal)}
              </Text>
            </View>
          </View>

          {notes ? (
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
              <Text className="text-sm font-semibold text-gray-900 mb-1">Notes</Text>
              <Text className="text-sm text-gray-600">{notes}</Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
