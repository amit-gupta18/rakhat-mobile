import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  useActiveBusiness,
  useUpdateBusiness,
  useUploadLogo,
} from "../../../src/hooks/useBusiness";
import { useActiveRole, useAuthStore } from "../../../src/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../../src/components/Card";
import { Input } from "../../../src/components/Input";
import { Select } from "../../../src/components/Select";
import { Button } from "../../../src/components/Button";
import { LoadingSpinner } from "../../../src/components/LoadingSpinner";
import { ErrorMessage } from "../../../src/components/ErrorMessage";
import { INDIAN_STATES } from "../../../src/utils/gst";
import type { GstinType } from "../../../src/types";

const GSTIN_TYPES: { value: GstinType; label: string }[] = [
  { value: "UNREGISTERED", label: "Unregistered" },
  { value: "REGULAR", label: "Regular" },
  { value: "COMPOSITION", label: "Composition" },
];

export default function SettingsScreen() {
  const role = useActiveRole();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);
  const { data: business, isLoading } = useActiveBusiness();
  const updateBusiness = useUpdateBusiness();
  const uploadLogo = useUploadLogo();

  const [formData, setFormData] = useState({
    tradeName: "",
    legalName: "",
    gstin: "",
    gstinType: "UNREGISTERED" as GstinType,
    address: "",
    stateCode: "",
    phone: "",
    invoicePrefix: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (business) {
      setFormData({
        tradeName: business.tradeName ?? "",
        legalName: business.legalName ?? "",
        gstin: business.gstin ?? "",
        gstinType: business.gstinType ?? "UNREGISTERED",
        address: business.address ?? "",
        stateCode: business.stateCode ?? "",
        phone: business.phone ?? "",
        invoicePrefix: business.invoicePrefix ?? "",
      });
    }
  }, [business]);

  const isOwner = role === "OWNER";

  const handleSave = () => {
    if (!activeBusinessId) return;

    updateBusiness.mutate(
      {
        id: activeBusinessId,
        payload: {
          tradeName: formData.tradeName,
          legalName: formData.legalName || null,
          gstin: formData.gstin || null,
          gstinType: formData.gstinType,
          address: formData.address || null,
          stateCode: formData.stateCode,
          phone: formData.phone || null,
          invoicePrefix: formData.invoicePrefix,
        },
      },
      {
        onSuccess: () => {
          setSuccessMessage("Settings saved successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        },
      }
    );
  };

  const handlePickLogo = async () => {
    if (!isOwner || !activeBusinessId) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please grant permission to access your photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadLogo.mutate({
        businessId: activeBusinessId,
        imageUri: result.assets[0].uri,
      });
    }
  };

  const stateOptions = INDIAN_STATES.map((state) => ({
    value: state.code,
    label: `${state.code} - ${state.name}`,
  }));

  if (isLoading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Settings</Text>
        <View className="w-6" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          {!isOwner && (
            <View className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
              <Text className="text-sm text-yellow-800">
                Only business owners can edit settings.
              </Text>
            </View>
          )}

          {updateBusiness.error && (
            <View className="mb-4">
              <ErrorMessage message={updateBusiness.error.message} />
            </View>
          )}

          {successMessage && (
            <View className="mb-4 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <Text className="text-sm text-green-800">{successMessage}</Text>
            </View>
          )}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Business Logo</CardTitle>
            </CardHeader>
            <CardContent className="items-center">
              {business?.logoUrl ? (
                <Image
                  source={{ uri: business.logoUrl }}
                  className="w-24 h-24 rounded-lg mb-3"
                />
              ) : (
                <View className="w-24 h-24 rounded-lg bg-gray-100 items-center justify-center mb-3">
                  <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                </View>
              )}
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handlePickLogo}
                  loading={uploadLogo.isPending}
                >
                  {business?.logoUrl ? "Change Logo" : "Upload Logo"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Trade Name *"
                value={formData.tradeName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, tradeName: text }))
                }
                placeholder="Business trade name"
                editable={isOwner}
              />

              <Input
                label="Legal Name"
                value={formData.legalName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, legalName: text }))
                }
                placeholder="Registered legal name"
                editable={isOwner}
              />

              <Input
                label="Phone"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                placeholder="Business phone"
                keyboardType="phone-pad"
                editable={isOwner}
              />

              <Select
                label="State *"
                value={formData.stateCode}
                options={stateOptions}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, stateCode: value }))
                }
                placeholder="Select state"
              />

              <Input
                label="Address"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, address: text }))
                }
                placeholder="Business address"
                multiline
                numberOfLines={3}
                editable={isOwner}
              />
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>GST Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="GSTIN"
                value={formData.gstin}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, gstin: text.toUpperCase() }))
                }
                placeholder="27AABCU9603R1ZM"
                autoCapitalize="characters"
                maxLength={15}
                editable={isOwner}
              />

              <Select
                label="GSTIN Type"
                value={formData.gstinType}
                options={GSTIN_TYPES}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    gstinType: value as GstinType,
                  }))
                }
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Invoice Prefix *"
                value={formData.invoicePrefix}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoicePrefix: text.toUpperCase(),
                  }))
                }
                placeholder="INV"
                autoCapitalize="characters"
                maxLength={10}
                editable={isOwner}
              />
            </CardContent>
          </Card>

          {isOwner && (
            <Button
              onPress={handleSave}
              loading={updateBusiness.isPending}
              className="mb-8"
            >
              Save Changes
            </Button>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
