import { jwtDecode } from "jwt-decode";
import type { UserRole } from "@/config/navigation";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export const decodeAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

export const getTimeUntilExpiryMs = (token: string): number | null => {
  const payload = decodeAccessToken(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000 - Date.now();
};
