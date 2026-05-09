import { http } from "../../api/http";
import type {
  AuthUser,
  LoginPayload,
  ProfilePayload,
  RegisterPayload,
} from "../../types/auth.types";

export async function apiRegister(
  payload: Omit<RegisterPayload, "confirmPassword">,
) {
  return http<{ user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiLogin(payload: LoginPayload) {
  return http<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiMe() {
  return http<{ user: AuthUser }>("/api/auth/me");
}

export async function apiUpdateProfile(payload: ProfilePayload) {
  return http<{ user: AuthUser }>("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function apiGetOrcidConnectUrl() {
  return http<{ url: string }>("/api/auth/orcid/connect");
}

export async function apiGetOrcidLoginUrl() {
  return http<{ url: string }>("/api/auth/orcid/login");
}