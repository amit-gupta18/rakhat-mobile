import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignup } from "../../src/hooks/useAuth";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorMessage } from "../../src/components/ErrorMessage";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const signup = useSignup();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterForm) => {
    signup.mutate({
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
    });
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
                Create account
              </Text>
              <Text className="text-gray-600">
                Get started with GST-compliant invoicing
              </Text>
            </View>

            {signup.error && (
              <View className="mb-4">
                <ErrorMessage message={signup.error.message} />
              </View>
            )}

            <View className="space-y-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Phone (optional)"
                    placeholder="9876543210"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.phone?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Minimum 8 characters"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={signup.isPending}
                className="mt-4"
              >
                Create account
              </Button>
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold">Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
