import { api, apiCall } from "../client";
import type { Member, AddMemberPayload, Role } from "../../types";

export async function getMembers(): Promise<{ members: Member[] }> {
  return apiCall(async () => {
    return api.get("members").json<{ members: Member[] }>();
  });
}

export async function addMember(
  payload: AddMemberPayload
): Promise<{ member: { userId: string; email: string; role: Role } }> {
  return apiCall(async () => {
    return api
      .post("members", { json: payload })
      .json<{ member: { userId: string; email: string; role: Role } }>();
  });
}

export async function removeMember(id: string): Promise<{ id: string }> {
  return apiCall(async () => {
    return api.delete(`members/${id}`).json<{ id: string }>();
  });
}
