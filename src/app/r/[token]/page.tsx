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
import { privatePageMetadata } from "@/lib/privatePageMetadata";
import * as people from "@/server/services/people";

type RevealPageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: RevealPageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await people.getRevealByToken(token);

  if (result.kind === "not_found") {
    return privatePageMetadata({ title: "Link inválido" });
  }

  if (result.kind === "revealed" || result.kind === "draw_pending") {
    return privatePageMetadata({
      title: result.eventTitle,
      description: result.eventDescription,
    });
  }

  return privatePageMetadata({ title: result.eventTitle });
}

export default async function RevealPage({ params }: RevealPageProps) {
  const { token } = await params;
  const result = await people.getRevealByToken(token);

  if (result.kind === "not_found") {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <header className="space-y-3 text-center">
          <Badge
            variant={
              result.kind === "revealed" ? "default" : "secondary"
            }
          >
            {result.kind === "revealed"
              ? "Seu amigo secreto"
              : result.kind === "draw_pending"
                ? "Sorteio pendente"
                : "Sorteio incompleto"}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {result.eventTitle}
          </h1>
          {"eventDescription" in result && (
            <p className="text-sm text-muted-foreground sm:text-base">
              {result.eventDescription}
            </p>
          )}
        </header>

        {result.kind === "revealed" ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Olá, {result.personName}</CardTitle>
              <CardDescription>
                Guarde este nome só para você. Boa sorte na escolha do presente!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-3xl font-semibold tracking-tight">
                {result.matchName}
              </p>
            </CardContent>
          </Card>
        ) : result.kind === "draw_pending" ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Sorteio ainda não realizado</CardTitle>
              <CardDescription>
                O organizador ainda não realizou o sorteio deste evento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Volte a este link depois que o sorteio for feito para ver seu
                amigo secreto.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Sorteio incompleto</CardTitle>
              <CardDescription>
                Olá, {result.personName}. Seu sorteio ainda não está disponível.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fale com o organizador do evento se o problema persistir.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
