import { http } from "../../api/http";
import type {
  AuthUser,
  LoginPayload,
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
