import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  error,
}: SelectProps) {
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className={`border rounded-md px-3 py-2.5 flex-row items-center justify-between bg-white ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <Text
          className={`text-base ${selectedOption ? "text-gray-900" : "text-gray-400"}`}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>
      {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}

      <Modal visible={visible} transparent animationType="slide">
        <SafeAreaView className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl max-h-[70%]">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">{label ?? "Select"}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${
                    item.value === value ? "bg-primary-50" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      item.value === value ? "text-primary font-medium" : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color="#0052CC" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
