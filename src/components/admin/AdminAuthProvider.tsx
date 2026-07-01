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
import { adminLogout, adminPing } from "@/lib/apiClient";
import type { OrganizerProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

type AdminAuthContextValue = {
  isAuthenticated: boolean;
  organizer: OrganizerProfile | null;
  logout: () => Promise<void>;
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
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await adminLogout();
    setOrganizer(null);
    router.replace("/admin");
  }, [router]);

  useEffect(() => {
    adminPing().then((result) => {
      if (result.ok) {
        setOrganizer(result.data.organizer);
      } else {
        setOrganizer(null);
        router.replace("/admin");
      }
      setIsLoading(false);
    });
  }, [router]);

  const value = useMemo(
    () => ({
      isAuthenticated: organizer !== null,
      organizer,
      logout,
    }),
    [organizer, logout],
  );

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!organizer) {
    return null;
  }

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}
