"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminCreateEvent, adminGetEvents } from "@/lib/apiClient";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grouped, setGrouped] = useState(false);

  const loadEvents = useCallback(async () => {
    const result = await adminGetEvents();
    if (result.ok) {
      setEvents(result.data.events);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await adminGetEvents();
      if (cancelled) return;

      if (result.ok) {
        setEvents(result.data.events);
      } else {
        toast.error(result.error);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsCreating(true);
    const result = await adminCreateEvent({
      title: title.trim(),
      description: description.trim(),
      grouped,
    });

    if (!result.ok) {
      toast.error(result.error);
      setIsCreating(false);
      return;
    }

    toast.success("Evento criado.");
    setTitle("");
    setDescription("");
    setGrouped(false);
    setIsCreating(false);
    await loadEvents();
  };

  return (
    <AdminShell title="Eventos">
      <Card>
        <CardHeader>
          <CardTitle>Criar evento</CardTitle>
          <CardDescription>
            Defina as informações básicas do seu amigo secreto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Amigo Secreto da Família"
                required
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Presente até R$ 80"
                required
                disabled={isCreating}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="grouped"
                checked={grouped}
                onCheckedChange={(checked) => setGrouped(checked === true)}
                disabled={isCreating}
              />
              <Label htmlFor="grouped" className="font-normal">
                Separar participantes em grupos (ex.: famílias)
              </Label>
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <PlusIcon />
                  Criar evento
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-base font-medium">Seus eventos</h2>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Nenhum evento criado ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((eventItem) => (
              <Card key={eventItem.id} size="sm">
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>{eventItem.title}</CardTitle>
                    <CardDescription>{eventItem.description}</CardDescription>
                  </div>
                  <Badge variant={eventItem.status ? "default" : "secondary"}>
                    {eventItem.status ? "Sorteado" : "Pendente"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/events/${eventItem.id}`}>
                      Gerenciar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
