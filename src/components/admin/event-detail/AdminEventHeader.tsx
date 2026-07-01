import Link from "next/link";
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

type AdminEventHeaderProps = {
  event: Event;
  isLocked: boolean;
};

export function AdminEventHeader({ event, isLocked }: AdminEventHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/events">← Voltar aos eventos</Link>
        </Button>
        <Badge variant={event.status ? "default" : "secondary"}>
          {event.status ? "Sorteado" : "Pendente"}
        </Badge>
        {event.grouped ? <Badge variant="outline">Com grupos</Badge> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do evento</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isLocked
              ? "Envie o link pessoal de cada participante. Esses links são privados e mostram apenas o sorteado daquela pessoa."
              : "Depois do sorteio, copie e envie o link pessoal de cada participante abaixo."}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
