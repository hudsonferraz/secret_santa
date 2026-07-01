import Link from "next/link";
import { GiftIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { EventCodeForm } from "@/components/landing/EventCodeForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    icon: UsersIcon,
    title: "Organize o evento",
    description:
      "Cadastre participantes e, se quiser, separe grupos para evitar pares dentro da mesma família.",
  },
  {
    icon: GiftIcon,
    title: "Realize o sorteio",
    description:
      "Com um clique no painel admin, cada participante recebe um amigo secreto de forma automática.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Revelação privada",
    description:
      "Cada pessoa recebe um link privado do organizador para descobrir seu amigo secreto.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="text-sm font-medium tracking-tight">Amigo Secreto</p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">Área do organizador</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16">
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sorteios simples, privados e sem complicação
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Organize seu amigo secreto em minutos
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Crie o evento, cadastre os participantes e compartilhe um link.
            Cada pessoa descobre seu sorteado de forma individual.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} size="sm">
              <CardHeader>
                <step.icon className="mb-1 size-5 text-muted-foreground" />
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Entrar em um evento</CardTitle>
              <CardDescription>
                Cole o código do evento ou o link pessoal que o organizador
                enviou para você.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventCodeForm />
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Amigo Secreto — feito para reunir pessoas, não planilhas.
      </footer>
    </div>
  );
}
