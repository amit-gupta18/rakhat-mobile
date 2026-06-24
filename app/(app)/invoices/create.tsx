import { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { generateId } from "../../../src/utils/id";
import { useCreateInvoiceOffline } from "../../../src/hooks/useCreateInvoiceOffline";
import { useCustomerSearch, useCreateCustomer } from "../../../src/hooks/useCustomers";
import { useProductSearch } from "../../../src/hooks/useProducts";
import { useActiveBusiness, useBusinesses } from "../../../src/hooks/useBusiness";
import { useAuthStore } from "../../../src/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../../src/components/Card";
import { Button } from "../../../src/components/Button";
import { Input } from "../../../src/components/Input";
import { Select } from "../../../src/components/Select";
import { ErrorMessage } from "../../../src/components/ErrorMessage";
import { InvoiceDraftPreview } from "../../../src/components/InvoiceDraftPreview";
import { calculateGST, GST_RATES, INDIAN_STATES } from "../../../src/utils/gst";
import { formatCurrency, formatDateForAPI } from "../../../src/utils/format";
import type { LineItem, Customer, Product, GstRate, PaymentMode } from "../../../src/types";

const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "CREDIT", label: "Credit" },
];

function createEmptyItem(): LineItem {
  return {
    id: generateId(),
    name: "",
    hsn: "",
    unit: "PCS",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    gstRate: 18 as GstRate,
  };
}

export default function CreateInvoiceScreen() {
  const clientBillIdRef = useRef(generateId());
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);
  const storeMembership = useAuthStore((s) =>
    s.memberships.find((m) => m.businessId === s.activeBusinessId)
  );
  const { data: business } = useActiveBusiness();
  const { data: businessesData } = useBusinesses();
  const apiMembership = businessesData?.memberships.find(
    (m) => m.businessId === activeBusinessId
  );
  const createInvoice = useCreateInvoiceOffline();
  const createCustomer = useCreateCustomer();

  const sellerGSTIN =
    business?.gstin ?? apiMembership?.gstin ?? storeMembership?.gstin ?? null;
  const sellerStateCode =
    business?.stateCode ?? apiMembership?.stateCode ?? storeMembership?.stateCode ?? "00";

  const [customerId, setCustomerId] = useState<string | undefined>();
  const [customerName, setCustomerName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    gstin: "",
    stateCode: "",
  });

  const [invoiceDate, setInvoiceDate] = useState(formatDateForAPI(new Date()));
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);

  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: customersData } = useCustomerSearch(customerQuery, customerQuery.length > 0);
  const { data: productsData } = useProductSearch(productQuery, productQuery.length > 0);

  const customers = customersData?.data ?? [];
  const products = productsData?.data ?? [];

  const gstResult = useMemo(() => {
    return calculateGST({
      sellerGSTIN,
      sellerStateCode,
      buyerStateCode: selectedCustomer?.stateCode ?? null,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        gstRate: item.gstRate,
      })),
    });
  }, [items, sellerGSTIN, sellerStateCode, selectedCustomer]);

  const selectCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setSelectedCustomer(customer);
    setCustomerQuery("");
    setShowCustomerDropdown(false);
  };

  const clearCustomer = () => {
    setCustomerId(undefined);
    setCustomerName("");
    setSelectedCustomer(null);
    setCustomerQuery("");
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.name) {
      Alert.alert("Error", "Customer name is required");
      return;
    }

    createCustomer.mutate(
      {
        name: newCustomer.name,
        phone: newCustomer.phone || undefined,
        gstin: newCustomer.gstin?.toUpperCase() || undefined,
        stateCode: newCustomer.stateCode || undefined,
      },
      {
        onSuccess: (customer) => {
          selectCustomer(customer);
          setShowNewCustomerForm(false);
          setNewCustomer({ name: "", phone: "", gstin: "", stateCode: "" });
        },
      }
    );
  };

  const selectProduct = (product: Product, itemIndex: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              productId: product.id,
              name: product.name,
              hsn: product.hsnCode ?? "",
              unit: product.unit,
              unitPrice: product.sellingPrice,
              gstRate: product.gstRate as GstRate,
            }
          : item
      )
    );
    setProductQuery("");
    setShowProductDropdown(false);
    setActiveItemIndex(null);
  };

  const updateItem = (index: number, updates: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const validItems = items.filter(
      (item) => item.name.trim() && item.quantity > 0
    );

    if (validItems.length === 0) {
      Alert.alert("Error", "Add at least one item with name and quantity");
      return;
    }

    createInvoice.mutate({
      clientBillId: clientBillIdRef.current,
      customerId,
      invoiceDate,
      paymentMode,
      notes: notes || undefined,
      items: validItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        hsn: item.hsn || undefined,
        unit: item.unit || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        gstRate: item.gstRate,
      })),
    });
  };

  const stateOptions = INDIAN_STATES.map((state) => ({
    value: state.code,
    label: `${state.code} - ${state.name}`,
  }));

  const gstOptions = GST_RATES.map((rate) => ({
    value: String(rate),
    label: `${rate}%`,
  }));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">New Invoice</Text>
        <TouchableOpacity onPress={() => setShowPreview(true)}>
          <Text className="text-primary font-semibold">Preview</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          {createInvoice.error && (
            <View className="mb-4">
              <ErrorMessage message={createInvoice.error.message} />
            </View>
          )}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-medium text-gray-900">
                      {selectedCustomer.name}
                    </Text>
                    {selectedCustomer.gstin && (
                      <Text className="text-sm text-gray-500">
                        GSTIN: {selectedCustomer.gstin}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={clearCustomer}>
                    <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-md px-3">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 py-2.5 px-2 text-base text-gray-900"
                      placeholder="Search customer or leave empty for walk-in"
                      value={customerQuery}
                      onChangeText={(text) => {
                        setCustomerQuery(text);
                        setShowCustomerDropdown(text.length > 0);
                      }}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {showCustomerDropdown && customers.length > 0 && (
                    <View className="mt-2 bg-white border border-gray-200 rounded-md">
                      {customers.slice(0, 5).map((customer) => (
                        <TouchableOpacity
                          key={customer.id}
                          onPress={() => selectCustomer(customer)}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text className="font-medium text-gray-900">
                            {customer.name}
                          </Text>
                          {customer.phone && (
                            <Text className="text-sm text-gray-500">
                              {customer.phone}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => setShowNewCustomerForm(true)}
                    className="mt-3"
                  >
                    <Text className="text-primary font-medium">
                      + Add new customer
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Invoice Date"
                value={invoiceDate}
                onChangeText={setInvoiceDate}
                placeholder="YYYY-MM-DD"
              />
              <Select
                label="Payment Mode"
                value={paymentMode}
                options={PAYMENT_MODES}
                onChange={(value) => setPaymentMode(value as PaymentMode)}
              />
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <TouchableOpacity onPress={addItem}>
                <Text className="text-primary font-medium">+ Add Item</Text>
              </TouchableOpacity>
            </CardHeader>
            <CardContent className="p-0">
              {items.map((item, index) => (
                <View
                  key={item.id}
                  className={`p-4 ${
                    index < items.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <Text className="text-sm font-medium text-gray-500">
                      Item {index + 1}
                    </Text>
                    {items.length > 1 && (
                      <TouchableOpacity onPress={() => removeItem(index)}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="mb-3">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">
                      Item Name
                    </Text>
                    <View className="flex-row items-center bg-white border border-gray-300 rounded-md px-3">
                      <TextInput
                        className="flex-1 py-2.5 text-base text-gray-900"
                        placeholder="Search or type product name"
                        value={activeItemIndex === index ? productQuery : item.name}
                        onFocus={() => {
                          setActiveItemIndex(index);
                          setProductQuery(item.name);
                        }}
                        onChangeText={(text) => {
                          setProductQuery(text);
                          setShowProductDropdown(text.length > 0);
                          updateItem(index, { name: text, productId: undefined });
                        }}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    {activeItemIndex === index &&
                      showProductDropdown &&
                      products.length > 0 && (
                        <View className="mt-2 bg-white border border-gray-200 rounded-md">
                          {products.slice(0, 5).map((product) => (
                            <TouchableOpacity
                              key={product.id}
                              onPress={() => selectProduct(product, index)}
                              className="px-4 py-3 border-b border-gray-100"
                            >
                              <Text className="font-medium text-gray-900">
                                {product.name}
                              </Text>
                              <Text className="text-sm text-gray-500">
                                {formatCurrency(product.sellingPrice)} • GST {product.gstRate}%
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                  </View>

                  <View className="flex-row gap-3 mb-3">
                    <View className="flex-1">
                      <Input
                        label="HSN"
                        value={item.hsn}
                        onChangeText={(text) => updateItem(index, { hsn: text })}
                        placeholder="HSN Code"
                      />
                    </View>
                    <View className="flex-1">
                      <Input
                        label="Unit"
                        value={item.unit}
                        onChangeText={(text) =>
                          updateItem(index, { unit: text.toUpperCase() })
                        }
                        placeholder="PCS"
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-3 mb-3">
                    <View className="flex-1">
                      <Input
                        label="Qty"
                        value={String(item.quantity)}
                        onChangeText={(text) =>
                          updateItem(index, {
                            quantity: parseFloat(text) || 0,
                          })
                        }
                        keyboardType="decimal-pad"
                        placeholder="1"
                      />
                    </View>
                    <View className="flex-1">
                      <Input
                        label="Price"
                        value={String(item.unitPrice)}
                        onChangeText={(text) =>
                          updateItem(index, {
                            unitPrice: parseFloat(text) || 0,
                          })
                        }
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Input
                        label="Discount"
                        value={String(item.discount)}
                        onChangeText={(text) =>
                          updateItem(index, {
                            discount: parseFloat(text) || 0,
                          })
                        }
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                      />
                    </View>
                    <View className="flex-1">
                      <Select
                        label="GST %"
                        value={String(item.gstRate)}
                        options={gstOptions}
                        onChange={(value) =>
                          updateItem(index, {
                            gstRate: parseInt(value, 10) as GstRate,
                          })
                        }
                      />
                    </View>
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <TextInput
                className="border border-gray-300 rounded-md px-3 py-2.5 text-base text-gray-900 bg-white"
                placeholder="Optional notes for this invoice"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                <Text className="text-gray-500">Document Type</Text>
                <Text className="font-medium text-gray-900">
                  {gstResult.documentType.replace("_", " ")}
                </Text>
              </View>
              {!sellerGSTIN && (
                <View className="px-4 py-2 border-b border-gray-100">
                  <Text className="text-xs text-amber-700">
                    Add your business GSTIN in Settings to calculate CGST/SGST on tax invoices.
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                <Text className="text-gray-500">Transaction Type</Text>
                <Text className="font-medium text-gray-900">
                  {gstResult.transactionType.replace("_", "-")}
                </Text>
              </View>
              <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                <Text className="text-gray-500">Subtotal</Text>
                <Text className="font-medium text-gray-900">
                  {formatCurrency(gstResult.summary.subtotal)}
                </Text>
              </View>
              {gstResult.summary.discountTotal > 0 && (
                <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                  <Text className="text-gray-500">Discount</Text>
                  <Text className="font-medium text-gray-900">
                    -{formatCurrency(gstResult.summary.discountTotal)}
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                <Text className="text-gray-500">Taxable Amount</Text>
                <Text className="font-medium text-gray-900">
                  {formatCurrency(gstResult.summary.taxableAmount)}
                </Text>
              </View>
              {gstResult.transactionType === "INTER_STATE" ? (
                <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                  <Text className="text-gray-500">IGST</Text>
                  <Text className="font-medium text-gray-900">
                    {formatCurrency(gstResult.summary.igstTotal)}
                  </Text>
                </View>
              ) : (
                <>
                  <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                    <Text className="text-gray-500">CGST</Text>
                    <Text className="font-medium text-gray-900">
                      {formatCurrency(gstResult.summary.cgstTotal)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between px-4 py-2 border-b border-gray-100">
                    <Text className="text-gray-500">SGST</Text>
                    <Text className="font-medium text-gray-900">
                      {formatCurrency(gstResult.summary.sgstTotal)}
                    </Text>
                  </View>
                </>
              )}
              <View className="flex-row justify-between px-4 py-3 bg-primary-50">
                <Text className="font-semibold text-gray-900">Grand Total</Text>
                <Text className="font-bold text-xl text-primary">
                  {formatCurrency(gstResult.summary.grandTotal)}
                </Text>
              </View>
            </CardContent>
          </Card>

          <View className="flex-row gap-3 mb-8">
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit}
              loading={createInvoice.isPending}
              className="flex-1"
            >
              Create Invoice
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showNewCustomerForm} transparent animationType="slide">
        <SafeAreaView className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">New Customer</Text>
              <TouchableOpacity onPress={() => setShowNewCustomerForm(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
              <Input
                label="Name *"
                value={newCustomer.name}
                onChangeText={(text) =>
                  setNewCustomer((prev) => ({ ...prev, name: text }))
                }
                placeholder="Customer name"
              />
              <Input
                label="Phone"
                value={newCustomer.phone}
                onChangeText={(text) =>
                  setNewCustomer((prev) => ({ ...prev, phone: text }))
                }
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
              <Input
                label="GSTIN"
                value={newCustomer.gstin}
                onChangeText={(text) =>
                  setNewCustomer((prev) => ({ ...prev, gstin: text.toUpperCase() }))
                }
                placeholder="GSTIN (optional)"
                autoCapitalize="characters"
                maxLength={15}
              />
              <Select
                label="State"
                value={newCustomer.stateCode}
                options={stateOptions}
                onChange={(value) =>
                  setNewCustomer((prev) => ({ ...prev, stateCode: value }))
                }
                placeholder="Select state (optional)"
              />
              <Button
                onPress={handleCreateCustomer}
                loading={createCustomer.isPending}
                className="mt-4 mb-8"
              >
                Add Customer
              </Button>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <InvoiceDraftPreview
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        business={business}
        customer={selectedCustomer}
        invoiceDate={invoiceDate}
        paymentMode={paymentMode}
        notes={notes}
        items={items}
        gstResult={gstResult}
      />
    </SafeAreaView>
  );
}
