"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { adminLogin, adminPing } from "@/lib/apiClient";
import { getAdminToken, setAdminToken } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    adminPing(token).then((result) => {
      if (result.ok) {
        router.replace("/admin/events");
      } else {
        setIsCheckingSession(false);
      }
    });
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await adminLogin(password);
    if (!result.ok) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    setAdminToken(result.data.token);
    toast.success("Login realizado com sucesso.");
    router.push("/admin/events");
  };

  if (isCheckingSession) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-4 sm:px-6">
          <p className="text-sm font-medium">Amigo Secreto</p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Voltar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Área do organizador</CardTitle>
            <CardDescription>
              Entre com a senha do dia para gerenciar eventos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
