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
  academicDegree?: string;
  academicTitle?: string;
  orcid?: string;
  googleScholarUrl?: string;
  bio?: string;
  role: UserRole;
};

export type ProfilePayload = {
  firstName: string;
  lastName: string;
  institution: string;
  country: string;
  academicDegree?: string;
  academicTitle?: string;
  orcid?: string;
  googleScholarUrl?: string;
  bio?: string;
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  institution?: string;
  country?: string;
  academicDegree?: string | null;
  academicTitle?: string | null;
  orcid?: string | null;
  orcidVerified?: boolean;
  googleScholarUrl?: string | null;
  bio?: string | null;
};

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: AuthUser;
  message?: string;
};