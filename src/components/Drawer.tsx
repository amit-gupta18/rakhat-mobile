import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore, useActiveRole, useActiveMembership } from "../stores/authStore";
import { useLogout } from "../hooks/useAuth";
import type { Role } from "../types";

type DrawerItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  roles: Role[];
};

const DRAWER_ITEMS: DrawerItem[] = [
  {
    label: "Payments",
    icon: "wallet-outline",
    route: "/(app)/payments",
    roles: ["OWNER", "ACCOUNTANT"],
  },
  {
    label: "Insights",
    icon: "bar-chart-outline",
    route: "/(app)/insights",
    roles: ["OWNER"],
  },
  {
    label: "Team",
    icon: "people-outline",
    route: "/(app)/team",
    roles: ["OWNER"],
  },
  {
    label: "Settings",
    icon: "settings-outline",
    route: "/(app)/settings",
    roles: ["OWNER", "ACCOUNTANT", "VIEWER"],
  },
];

type DrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export function Drawer({ visible, onClose }: DrawerProps) {
  const role = useActiveRole();
  const activeMembership = useActiveMembership();
  const memberships = useAuthStore((s) => s.memberships);
  const setActiveBusiness = useAuthStore((s) => s.setActiveBusiness);
  const logout = useLogout();

  const visibleItems = DRAWER_ITEMS.filter(
    (item) => role && item.roles.includes(role)
  );

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleBusinessSwitch = async (businessId: string) => {
    await setActiveBusiness(businessId);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout.mutate();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        <Pressable className="flex-1" onPress={onClose} />
        <SafeAreaView className="w-72 bg-white h-full shadow-xl">
          <View className="flex-1">
            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs text-gray-500 uppercase tracking-wider">
                  Business
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                {activeMembership?.tradeName ?? "Select Business"}
              </Text>
              {role && (
                <Text className="text-sm text-gray-500 mt-0.5">
                  {role === "OWNER"
                    ? "Owner"
                    : role === "ACCOUNTANT"
                    ? "Accountant"
                    : "Viewer"}
                </Text>
              )}
            </View>

            {/* Business Switcher (if multiple) */}
            {memberships.length > 1 && (
              <View className="px-4 py-3 border-b border-gray-100">
                <Text className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Switch Business
                </Text>
                {memberships.map((m) => (
                  <TouchableOpacity
                    key={m.businessId}
                    onPress={() => handleBusinessSwitch(m.businessId)}
                    className={`py-2 px-3 rounded-md mb-1 ${
                      m.businessId === activeMembership?.businessId
                        ? "bg-primary"
                        : "bg-gray-50"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        m.businessId === activeMembership?.businessId
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                      numberOfLines={1}
                    >
                      {m.tradeName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Menu Items */}
            <View className="flex-1 px-2 py-4">
              {visibleItems.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  onPress={() => handleNavigation(item.route)}
                  className="flex-row items-center px-3 py-3 rounded-lg active:bg-gray-100"
                >
                  <Ionicons name={item.icon} size={22} color="#374151" />
                  <Text className="ml-3 text-base text-gray-700 font-medium">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout */}
            <View className="px-4 pb-4 border-t border-gray-100 pt-4">
              <TouchableOpacity
                onPress={handleLogout}
                disabled={logout.isPending}
                className="flex-row items-center px-3 py-3 rounded-lg active:bg-gray-100"
              >
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                <Text className="ml-3 text-base text-red-500 font-medium">
                  {logout.isPending ? "Signing out..." : "Sign out"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
