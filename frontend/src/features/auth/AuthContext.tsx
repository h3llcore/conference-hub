import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  AuthUser,
  LoginPayload,
  ProfilePayload,
  RegisterPayload,
} from "../../types/auth.types";
import { storage } from "../../utils/storage";
import {
  apiGetOrcidConnectUrl,
  apiGetOrcidLoginUrl,
  apiLogin,
  apiMe,
  apiRegister,
  apiUpdateProfile,
} from "./auth.api";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  updateProfile: (payload: ProfilePayload) => Promise<AuthUser>;
  connectOrcid: () => Promise<void>;
  loginWithOrcid: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }

    setIsAuthLoading(true);

    apiMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        storage.clearToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, [token]);

  async function login(payload: LoginPayload): Promise<AuthUser> {
    const { token: newToken, user } = await apiLogin(payload);

    storage.setToken(newToken);
    setToken(newToken);
    setUser(user);

    return user;
  }

  async function register(payload: RegisterPayload): Promise<AuthUser> {
    const {
      confirmPassword,
      firstName,
      lastName,
      email,
      password,
      institution,
      country,
      role,
      academicDegree,
      academicTitle,
      orcid,
      googleScholarUrl,
      bio,
    } = payload;

    await apiRegister({
      firstName,
      lastName,
      email,
      password,
      institution,
      country,
      role,
      academicDegree,
      academicTitle,
      orcid,
      googleScholarUrl,
      bio,
    });

    return login({ email, password });
  }

  async function updateProfile(payload: ProfilePayload): Promise<AuthUser> {
    const { user } = await apiUpdateProfile(payload);
    setUser(user);
    return user;
  }

  async function connectOrcid() {
    const { url } = await apiGetOrcidConnectUrl();
    window.location.href = url;
  }

  async function loginWithOrcid() {
    const { url } = await apiGetOrcidLoginUrl();
    window.location.href = url;
  }

  function logout() {
    storage.clearToken();
    setToken(null);
    setUser(null);
    setIsAuthLoading(false);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthLoading,
      login,
      register,
      updateProfile,
      connectOrcid,
      loginWithOrcid,
      logout,
    }),
    [user, token, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}