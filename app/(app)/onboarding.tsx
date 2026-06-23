import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBusiness } from "../../src/hooks/useBusiness";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { Select } from "../../src/components/Select";
import { ErrorMessage } from "../../src/components/ErrorMessage";
import { INDIAN_STATES } from "../../src/utils/gst";

const onboardingSchema = z.object({
  tradeName: z.string().min(1, "Trade name is required"),
  stateCode: z.string().min(1, "State is required"),
  invoicePrefix: z
    .string()
    .min(1, "Invoice prefix is required")
    .max(10, "Invoice prefix must be 10 characters or less"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingScreen() {
  const createBusiness = useCreateBusiness();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      tradeName: "",
      stateCode: "",
      invoicePrefix: "INV",
    },
  });

  const onSubmit = (data: OnboardingForm) => {
    createBusiness.mutate({
      tradeName: data.tradeName,
      stateCode: data.stateCode,
      invoicePrefix: data.invoicePrefix.toUpperCase(),
    });
  };

  const stateOptions = INDIAN_STATES.map((state) => ({
    value: state.code,
    label: `${state.code} - ${state.name}`,
  }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-12 pb-8">
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Set up your business
              </Text>
              <Text className="text-gray-600">
                Enter your business details to get started with invoicing
              </Text>
            </View>

            {createBusiness.error && (
              <View className="mb-4">
                <ErrorMessage message={createBusiness.error.message} />
              </View>
            )}

            <View className="space-y-4">
              <Controller
                control={control}
                name="tradeName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Trade Name"
                    placeholder="e.g. Sharma Traders"
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.tradeName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="stateCode"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="State"
                    value={value}
                    options={stateOptions}
                    onChange={onChange}
                    placeholder="Select your state"
                    error={errors.stateCode?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="invoicePrefix"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Invoice Prefix"
                    placeholder="e.g. INV"
                    autoCapitalize="characters"
                    maxLength={10}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(text.toUpperCase())}
                    value={value}
                    error={errors.invoicePrefix?.message}
                  />
                )}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={createBusiness.isPending}
                className="mt-4"
              >
                Create Business
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
