import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg";

type ButtonProps = TouchableOpacityProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
};

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  default: {
    container: "bg-primary",
    text: "text-white",
  },
  outline: {
    container: "border border-gray-300 bg-white",
    text: "text-gray-900",
  },
  secondary: {
    container: "bg-gray-100",
    text: "text-gray-900",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-gray-900",
  },
  destructive: {
    container: "bg-red-600",
    text: "text-white",
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: "px-3 py-1.5",
    text: "text-sm",
  },
  default: {
    container: "px-4 py-2.5",
    text: "text-base",
  },
  lg: {
    container: "px-6 py-3",
    text: "text-lg",
  },
};

export function Button({
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`rounded-md flex-row items-center justify-center ${variantStyle.container} ${sizeStyle.container} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "default" || variant === "destructive" ? "#fff" : "#0052CC"}
          style={{ marginRight: 8 }}
        />
      )}
      {typeof children === "string" ? (
        <Text
          className={`font-semibold ${variantStyle.text} ${sizeStyle.text}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
