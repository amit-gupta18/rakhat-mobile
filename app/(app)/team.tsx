import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMembers, useAddMember, useRemoveMember } from "../../src/hooks/useMembers";
import { useActiveRole, useAuthStore } from "../../src/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../src/components/Card";
import { Input } from "../../src/components/Input";
import { Select } from "../../src/components/Select";
import { Button } from "../../src/components/Button";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { ErrorMessage } from "../../src/components/ErrorMessage";
import { Badge } from "../../src/components/Badge";
import type { Member } from "../../src/types";

const ROLE_OPTIONS = [
  { value: "ACCOUNTANT", label: "Accountant — create & view invoices" },
  { value: "VIEWER", label: "Viewer — view only" },
];

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ACCOUNTANT: "Accountant",
  VIEWER: "Viewer",
};

export default function TeamScreen() {
  const role = useActiveRole();
  const currentUserId = useAuthStore((s) => s.userId);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [memberRole, setMemberRole] = useState<"ACCOUNTANT" | "VIEWER">("ACCOUNTANT");
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const { data, isLoading, refetch } = useMembers();
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  const members = data?.members ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddMember = async () => {
    if (!email || !password) return;

    addMember.mutate(
      { email, password, role: memberRole },
      {
        onSuccess: () => {
          setCreated({ email, password });
          setEmail("");
          setPassword("");
          setMemberRole("ACCOUNTANT");
          setShowForm(false);
        },
      }
    );
  };

  const handleRemoveMember = (member: Member) => {
    Alert.alert(
      "Remove Member",
      `Remove ${member.email} from this business?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeMember.mutate(member.id),
        },
      ]
    );
  };

  if (role !== "OWNER") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 ml-4">Team</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-500 text-center">
            Only business owners can manage the team.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderMember = ({ item }: { item: Member }) => (
    <Card className="mb-3">
      <CardContent className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-medium text-gray-900">{item.email}</Text>
            {item.userId === currentUserId && (
              <Text className="text-xs text-gray-400 ml-2">(you)</Text>
            )}
          </View>
          <Badge
            variant={item.role === "OWNER" ? "default" : "secondary"}
            className="mt-1 self-start"
          >
            {ROLE_LABELS[item.role] ?? item.role}
          </Badge>
        </View>
        {item.role !== "OWNER" && (
          <TouchableOpacity
            onPress={() => handleRemoveMember(item)}
            disabled={removeMember.isPending}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Team</Text>
        <TouchableOpacity
          onPress={() => {
            setShowForm(true);
            setCreated(null);
          }}
        >
          <Ionicons name="add" size={24} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {created && (
            <Card className="mb-4 border-green-200 bg-green-50">
              <CardContent>
                <Text className="font-medium text-green-800 mb-2">
                  Member created — share these credentials:
                </Text>
                <Text className="text-sm text-green-700 font-mono">
                  Email: {created.email}
                </Text>
                <Text className="text-sm text-green-700 font-mono">
                  Password: {created.password}
                </Text>
                <Text className="text-xs text-green-600 mt-2">
                  They can log in directly at the sign-in page.
                </Text>
              </CardContent>
            </Card>
          )}

          {showForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Add Team Member</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="accountant@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  secureTextEntry={false}
                />
                <Text className="text-xs text-gray-500 -mt-2 mb-3">
                  You set this and share it with them. Minimum 8 characters.
                </Text>

                <Select
                  label="Role"
                  value={memberRole}
                  options={ROLE_OPTIONS}
                  onChange={(v) => setMemberRole(v as "ACCOUNTANT" | "VIEWER")}
                />

                {addMember.error && (
                  <View className="my-2">
                    <ErrorMessage message={addMember.error.message} />
                  </View>
                )}

                <View className="flex-row gap-2 mt-4">
                  <Button
                    onPress={handleAddMember}
                    loading={addMember.isPending}
                    className="flex-1"
                  >
                    Add Member
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}

          {isLoading && !refreshing ? (
            <LoadingSpinner message="Loading team..." />
          ) : (
            <FlatList
              data={members}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 py-8">
                  No team members yet.
                </Text>
              }
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
