export type UserRole = "AUTHOR" | "REVIEWER" | "COMMITTEE";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  institution: string;
  country: string;
  role: UserRole;
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  institution?: string;
  country?: string;
};

export type AuthResponse = {
  accessToken?: string;
  user?: AuthUser;
  message?: string;
};