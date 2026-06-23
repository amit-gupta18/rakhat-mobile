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
import { useLogin } from "../../src/hooks/useAuth";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorMessage } from "../../src/components/ErrorMessage";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginForm) => {
    login.mutate(data);
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
                Welcome back
              </Text>
              <Text className="text-gray-600">
                Sign in to continue to Rakhat
              </Text>
            </View>

            {login.error && (
              <View className="mb-4">
                <ErrorMessage message={login.error.message} />
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
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />

              <View className="flex-row justify-end">
                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary text-sm font-medium">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={login.isPending}
                className="mt-4"
              >
                Sign in
              </Button>
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600">Don&apos;t have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold">Create one</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
