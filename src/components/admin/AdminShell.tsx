"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const { organizer, logout } = useAdminAuth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">
              {organizer?.name} · {organizer?.email}
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Início</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
