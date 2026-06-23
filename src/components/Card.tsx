import { View, Text, type ViewProps } from "react-native";

type CardProps = ViewProps & {
  children: React.ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-white rounded-md border border-gray-200 ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}

type CardHeaderProps = ViewProps & {
  children: React.ReactNode;
};

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <View className={`p-4 border-b border-gray-200 ${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}

type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Text className={`text-lg font-semibold text-gray-900 ${className ?? ""}`}>
      {children}
    </Text>
  );
}

type CardContentProps = ViewProps & {
  children: React.ReactNode;
};

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <View className={`p-4 ${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}

type CardFooterProps = ViewProps & {
  children: React.ReactNode;
};

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <View
      className={`p-4 border-t border-gray-200 ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}
