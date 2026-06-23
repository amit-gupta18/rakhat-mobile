import { api, apiCall } from "../client";
import type {
  Business,
  Membership,
  CreateBusinessPayload,
  UpdateBusinessPayload,
} from "../../types";

export async function getBusinesses(): Promise<{ memberships: Membership[] }> {
  return apiCall(async () => {
    return api.get("businesses").json<{ memberships: Membership[] }>();
  });
}

export async function getBusiness(id: string): Promise<Business> {
  return apiCall(async () => {
    return api.get(`businesses/${id}`).json<Business>();
  });
}

export async function createBusiness(
  payload: CreateBusinessPayload
): Promise<{ business: { id: string; tradeName: string }; membership: Membership }> {
  return apiCall(async () => {
    return api
      .post("businesses", { json: payload })
      .json<{ business: { id: string; tradeName: string }; membership: Membership }>();
  });
}

export async function updateBusiness(
  id: string,
  payload: UpdateBusinessPayload
): Promise<Business> {
  return apiCall(async () => {
    return api.put(`businesses/${id}`, { json: payload }).json<Business>();
  });
}

export async function uploadLogo(
  businessId: string,
  imageUri: string
): Promise<{ logoUrl: string }> {
  return apiCall(async () => {
    const formData = new FormData();

    const filename = imageUri.split("/").pop() || "logo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("logo", {
      uri: imageUri,
      name: filename,
      type,
    } as unknown as Blob);

    return api
      .post(`businesses/${businessId}/logo`, {
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .json<{ logoUrl: string }>();
  });
}
