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
import { useCreateCustomer } from "../../../src/hooks/useCustomers";
import { Input } from "../../../src/components/Input";
import { Button } from "../../../src/components/Button";
import { ErrorMessage } from "../../../src/components/ErrorMessage";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  gstin: z.string().optional(),
  billingAddress: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function CreateCustomerScreen() {
  const createCustomer = useCreateCustomer();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      gstin: "",
      billingAddress: "",
    },
  });

  const onSubmit = (data: CustomerForm) => {
    createCustomer.mutate(
      {
        name: data.name,
        phone: data.phone || undefined,
        gstin: data.gstin?.toUpperCase() || undefined,
        billingAddress: data.billingAddress || undefined,
      },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Add Customer</Text>
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
          {createCustomer.error && (
            <View className="mb-4">
              <ErrorMessage message={createCustomer.error.message} />
            </View>
          )}

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Customer Name *"
                placeholder="e.g. ABC Traders"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone"
                placeholder="9876543210"
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="gstin"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="GSTIN"
                placeholder="27AABCU9603R1ZM"
                autoCapitalize="characters"
                maxLength={15}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.toUpperCase())}
                value={value}
                error={errors.gstin?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="billingAddress"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Billing Address"
                placeholder="123 MG Road, Mumbai"
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.billingAddress?.message}
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={createCustomer.isPending}
            className="mt-4"
          >
            Save Customer
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
