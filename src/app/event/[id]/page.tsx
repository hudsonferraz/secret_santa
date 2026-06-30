import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as events from "@/server/services/events";

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const eventItem = await events.getOne(Number(id));

  if (!eventItem) {
    return {
      title: "Evento não encontrado",
    };
  }

  return {
    title: eventItem.title,
    description: eventItem.description,
    openGraph: {
      title: eventItem.title,
      description: eventItem.description,
      type: "website",
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const eventId = Number(id);

  if (Number.isNaN(eventId)) {
    notFound();
  }

  const eventItem = await events.getOne(eventId);

  if (!eventItem) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <header className="space-y-3 text-center">
          <Badge variant={eventItem.status ? "default" : "secondary"}>
            {eventItem.status ? "Sorteio realizado" : "Sorteio pendente"}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {eventItem.title}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {eventItem.description}
          </p>
        </header>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {eventItem.status
                ? "Use seu link pessoal"
                : "Sorteio ainda não realizado"}
            </CardTitle>
            <CardDescription>
              {eventItem.status
                ? "Cada participante recebe um link privado do organizador."
                : "O organizador ainda não realizou o sorteio deste evento."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {eventItem.status
                ? "Abra o link que foi enviado para você no WhatsApp ou mensagem privada. Esse link é único e mostra apenas o seu sorteado."
                : "Volte ao seu link pessoal depois que o sorteio for feito."}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
