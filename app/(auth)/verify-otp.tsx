import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVerifyOtp } from "../../src/hooks/useAuth";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorMessage } from "../../src/components/ErrorMessage";

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const verifyOtp = useVerifyOtp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = (data: VerifyOtpForm) => {
    if (!email) return;
    verifyOtp.mutate({ email, otp: data.otp });
  };

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
                Verify OTP
              </Text>
              <Text className="text-gray-600">
                Enter the 6-digit code sent to {email}
              </Text>
            </View>

            {verifyOtp.error && (
              <View className="mb-4">
                <ErrorMessage message={verifyOtp.error.message} />
              </View>
            )}

            <View className="space-y-4">
              <Controller
                control={control}
                name="otp"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="OTP"
                    placeholder="Enter 6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                    value={value}
                    error={errors.otp?.message}
                  />
                )}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={verifyOtp.isPending}
                className="mt-4"
              >
                Verify
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
