"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RevealMatchCardProps = {
  personName: string;
  matchName: string;
};

export function RevealMatchCard({
  personName,
  matchName,
}: RevealMatchCardProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isConfirmed) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Confirmar visualização</CardTitle>
          <CardDescription>
            Você tem certeza que deseja saber o amigo secreto de {personName}?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full sm:w-auto" onClick={() => setIsConfirmed(true)}>
            Sim, quero ver
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Olá, {personName}</CardTitle>
        <CardDescription>
          Guarde este nome só para você. Boa sorte na escolha do presente!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-3xl font-semibold tracking-tight">
          {matchName}
        </p>
      </CardContent>
    </Card>
  );
}
