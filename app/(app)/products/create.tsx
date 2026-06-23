import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProduct } from "../../../src/hooks/useProducts";
import { Input } from "../../../src/components/Input";
import { Button } from "../../../src/components/Button";
import { Select } from "../../../src/components/Select";
import { ErrorMessage } from "../../../src/components/ErrorMessage";
import { GST_RATES } from "../../../src/utils/gst";
import type { GstRate } from "../../../src/types";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sellingPrice: z.string().min(1, "Price is required"),
  gstRate: z.string(),
  unit: z.string().min(1, "Unit is required"),
  hsnCode: z.string().optional(),
  quantity: z.string().optional(),
  location: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function CreateProductScreen() {
  const createProduct = useCreateProduct();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sellingPrice: "",
      gstRate: "18",
      unit: "",
      hsnCode: "",
      quantity: "",
      location: "",
    },
  });

  const onSubmit = (data: ProductForm) => {
    createProduct.mutate(
      {
        name: data.name,
        sellingPrice: parseFloat(data.sellingPrice),
        gstRate: parseInt(data.gstRate, 10) as GstRate,
        unit: data.unit,
        hsnCode: data.hsnCode || undefined,
        quantity: data.quantity ? parseFloat(data.quantity) : undefined,
        location: data.location || undefined,
      },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  const gstOptions = GST_RATES.map((rate) => ({
    value: String(rate),
    label: `${rate}%`,
  }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Add Product</Text>
        <View className="w-6" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {createProduct.error && (
            <View className="mb-4">
              <ErrorMessage message={createProduct.error.message} />
            </View>
          )}

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Product Name *"
                placeholder="e.g. Basmati Rice 5kg"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="sellingPrice"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Selling Price *"
                placeholder="0.00"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.sellingPrice?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="gstRate"
            render={({ field: { onChange, value } }) => (
              <Select
                label="GST Rate *"
                value={value}
                options={gstOptions}
                onChange={onChange}
                error={errors.gstRate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="unit"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Unit *"
                placeholder="e.g. PCS, KG, BAG"
                autoCapitalize="characters"
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.toUpperCase())}
                value={value}
                error={errors.unit?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="hsnCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="HSN Code"
                placeholder="e.g. 1006"
                keyboardType="number-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.hsnCode?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Stock Quantity"
                placeholder="0"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.quantity?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Storage Location"
                placeholder="e.g. Shelf A"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.location?.message}
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={createProduct.isPending}
            className="mt-4"
          >
            Save Product
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
