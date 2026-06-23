import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  BUSINESS_ID: "businessId",
  USER_ID: "userId",
  USER_EMAIL: "userEmail",
} as const;

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
}

export async function setAccessToken(token: string | null | undefined): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function setRefreshToken(token: string | null | undefined): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
  }
}

export async function getBusinessId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.BUSINESS_ID);
}

export async function setBusinessId(id: string | null | undefined): Promise<void> {
  if (id) {
    await SecureStore.setItemAsync(KEYS.BUSINESS_ID, id);
  }
}

export async function getUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.USER_ID);
}

export async function setUserId(id: string | null | undefined): Promise<void> {
  if (id) {
    await SecureStore.setItemAsync(KEYS.USER_ID, id);
  }
}

export async function getUserEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.USER_EMAIL);
}

export async function setUserEmail(email: string | null | undefined): Promise<void> {
  if (email) {
    await SecureStore.setItemAsync(KEYS.USER_EMAIL, email);
  }
}

export async function clearAllTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(KEYS.BUSINESS_ID),
    SecureStore.deleteItemAsync(KEYS.USER_ID),
    SecureStore.deleteItemAsync(KEYS.USER_EMAIL),
  ]);
}

export async function storeSession(params: {
  accessToken?: string | null;
  refreshToken?: string | null;
  userId?: string | null;
  email?: string | null;
  businessId?: string | null;
}): Promise<void> {
  const promises: Promise<void>[] = [];
  
  if (params.accessToken) {
    promises.push(setAccessToken(params.accessToken));
  }
  if (params.refreshToken) {
    promises.push(setRefreshToken(params.refreshToken));
  }
  if (params.userId) {
    promises.push(setUserId(params.userId));
  }
  if (params.email) {
    promises.push(setUserEmail(params.email));
  }
  if (params.businessId) {
    promises.push(setBusinessId(params.businessId));
  }
  
  await Promise.all(promises);
}

export async function getStoredSession(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  businessId: string | null;
}> {
  const [accessToken, refreshToken, userId, email, businessId] =
    await Promise.all([
      getAccessToken(),
      getRefreshToken(),
      getUserId(),
      getUserEmail(),
      getBusinessId(),
    ]);

  return { accessToken, refreshToken, userId, email, businessId };
}
