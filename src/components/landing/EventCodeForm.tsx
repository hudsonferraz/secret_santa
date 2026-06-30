"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseEventId(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/\/event\/(\d+)/);
  if (urlMatch?.[1]) {
    return Number(urlMatch[1]);
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return null;
}

export function EventCodeForm() {
  const router = useRouter();
  const [eventCode, setEventCode] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const eventId = parseEventId(eventCode);
    if (eventId === null || Number.isNaN(eventId)) {
      toast.error("Informe um código de evento válido.");
      return;
    }

    router.push(`/event/${eventId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="event_code">Código do evento</Label>
        <Input
          id="event_code"
          name="event_code"
          placeholder="Ex: 12 ou link do evento"
          value={eventCode}
          onChange={(event) => setEventCode(event.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" size="lg">
        Entrar no evento
        <ArrowRightIcon />
      </Button>
    </form>
  );
}
