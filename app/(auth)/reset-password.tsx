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
import { useResetPassword } from "../../src/hooks/useAuth";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorMessage } from "../../src/components/ErrorMessage";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const resetPassword = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) return;
    resetPassword.mutate({ resetToken: token, newPassword: data.newPassword });
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
                Reset password
              </Text>
              <Text className="text-gray-600">
                Enter your new password
              </Text>
            </View>

            {resetPassword.error && (
              <View className="mb-4">
                <ErrorMessage message={resetPassword.error.message} />
              </View>
            )}

            <View className="space-y-4">
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="New password"
                    placeholder="Minimum 8 characters"
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.newPassword?.message}
                  />
                )}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={resetPassword.isPending}
                className="mt-4"
              >
                Reset password
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
