import { useState } from "react";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActiveRole } from "../../../src/stores/authStore";
import { Drawer } from "../../../src/components/Drawer";
import { TAB_BAR_HEIGHT } from "../../../src/constants/layout";
import type { Role } from "../../../src/types";

type TabConfig = {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  roles: Role[];
};

const TABS: TabConfig[] = [
  {
    name: "index",
    title: "Home",
    icon: "home-outline",
    iconFocused: "home",
    roles: ["OWNER", "ACCOUNTANT", "VIEWER"],
  },
  {
    name: "sales",
    title: "Sales",
    icon: "receipt-outline",
    iconFocused: "receipt",
    roles: ["OWNER", "ACCOUNTANT"],
  },
  {
    name: "customers",
    title: "Customers",
    icon: "people-outline",
    iconFocused: "people",
    roles: ["OWNER", "ACCOUNTANT"],
  },
  {
    name: "inventory",
    title: "Inventory",
    icon: "cube-outline",
    iconFocused: "cube",
    roles: ["OWNER", "ACCOUNTANT", "VIEWER"],
  },
];

export default function TabsLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const role = useActiveRole();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0052CC",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            height: TAB_BAR_HEIGHT + bottomInset,
            paddingTop: 8,
            paddingBottom: bottomInset,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
            marginTop: 2,
          },
        }}
      >
        {TABS.map((tab) => {
          const isVisible = role && tab.roles.includes(role);
          return (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.title,
                href: isVisible ? undefined : null,
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons
                    name={focused ? tab.iconFocused : tab.icon}
                    size={22}
                    color={color}
                  />
                ),
              }}
            />
          );
        })}
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color }) => (
              <Ionicons name="menu-outline" size={24} color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                style={props.style}
                onPress={() => setDrawerVisible(true)}
              >
                {props.children}
              </Pressable>
            ),
          }}
        />
      </Tabs>
      <Drawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
}
