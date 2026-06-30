"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { adminPing } from "@/lib/apiClient";
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/lib/adminAuth";
import { Skeleton } from "@/components/ui/skeleton";

type AdminAuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearAdminToken();
    setTokenState(null);
    router.replace("/admin");
  }, [router]);

  const login = useCallback((newToken: string) => {
    setAdminToken(newToken);
    setTokenState(newToken);
  }, []);

  useEffect(() => {
    const storedToken = getAdminToken();
    if (!storedToken) {
      setIsLoading(false);
      router.replace("/admin");
      return;
    }

    adminPing(storedToken).then((result) => {
      if (result.ok) {
        setTokenState(storedToken);
      } else {
        clearAdminToken();
        router.replace("/admin");
      }
      setIsLoading(false);
    });
  }, [router]);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, login, logout],
  );

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}
