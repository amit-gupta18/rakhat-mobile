import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembers, addMember, removeMember } from "../api/endpoints/members";
import type { AddMemberPayload } from "../types";
import { useAuthStore } from "../stores/authStore";

export function useMembers() {
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useQuery({
    queryKey: ["members", activeBusinessId],
    queryFn: () => getMembers(),
    enabled: !!activeBusinessId,
    staleTime: 60000,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: (payload: AddMemberPayload) => addMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeBusinessId],
      });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const activeBusinessId = useAuthStore((s) => s.activeBusinessId);

  return useMutation({
    mutationFn: (id: string) => removeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeBusinessId],
      });
    },
  });
}
