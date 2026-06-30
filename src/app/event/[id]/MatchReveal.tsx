"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { searchPersonByPhone } from "@/lib/apiClient";
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

type MatchRevealProps = {
  eventId: number;
};

type RevealState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "no_match"; personName: string }
  | { kind: "revealed"; personName: string; matchName: string };

export function MatchReveal({ eventId }: MatchRevealProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState<RevealState>({ kind: "idle" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      toast.error("Informe seu número de telefone.");
      return;
    }

    setState({ kind: "loading" });

    const result = await searchPersonByPhone(eventId, trimmedPhone);

    if (!result.ok) {
      setState({ kind: "idle" });
      toast.error(result.error);
      return;
    }

    const { person, personMatched } = result.data;

    if (!person) {
      setState({ kind: "not_found" });
      return;
    }

    if (!personMatched) {
      setState({ kind: "no_match", personName: person.name });
      return;
    }

    setState({
      kind: "revealed",
      personName: person.name,
      matchName: personMatched.name,
    });
  };

  if (state.kind === "revealed") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Seu amigo secreto</CardTitle>
          <CardDescription>
            Olá, {state.personName}. Guarde este nome só para você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-3xl font-semibold tracking-tight">
            {state.matchName}
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Boa sorte na escolha do presente!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Descubra seu amigo secreto</CardTitle>
        <CardDescription>
          Digite o telefone cadastrado no evento para ver quem você sorteou.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone_number">Telefone</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              value={phoneNumber}
              onChange={(event) => {
                setPhoneNumber(event.target.value);
                if (state.kind !== "idle" && state.kind !== "loading") {
                  setState({ kind: "idle" });
                }
              }}
              disabled={state.kind === "loading"}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={state.kind === "loading"}
          >
            {state.kind === "loading" ? (
              <>
                <Loader2Icon className="animate-spin" />
                Buscando...
              </>
            ) : (
              "Revelar sorteio"
            )}
          </Button>
        </form>

        {state.kind === "not_found" && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Não encontramos este número neste evento. Verifique se digitou
            corretamente ou fale com o organizador.
          </p>
        )}

        {state.kind === "no_match" && (
          <p className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Olá, {state.personName}. Você está cadastrado, mas ainda não tem um
            amigo secreto definido.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
