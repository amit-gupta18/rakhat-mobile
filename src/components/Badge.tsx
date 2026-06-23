import { View, Text } from "react-native";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: "bg-primary",
    text: "text-white",
  },
  secondary: {
    container: "bg-gray-100",
    text: "text-gray-800",
  },
  destructive: {
    container: "bg-red-100",
    text: "text-red-800",
  },
  outline: {
    container: "border border-gray-300 bg-transparent",
    text: "text-gray-800",
  },
  success: {
    container: "bg-green-100",
    text: "text-green-800",
  },
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <View
      className={`px-2 py-0.5 rounded-full self-start ${styles.container} ${className ?? ""}`}
    >
      <Text className={`text-xs font-medium ${styles.text}`}>{children}</Text>
    </View>
  );
}
