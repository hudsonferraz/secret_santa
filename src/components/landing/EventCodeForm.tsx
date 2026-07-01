"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import { parseEventInput } from "@/lib/parseEventInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EventCodeForm() {
  const router = useRouter();
  const [eventCode, setEventCode] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const target = parseEventInput(eventCode);
    if (!target) {
      toast.error("Informe um código de evento ou link pessoal válido.");
      return;
    }

    if (target.type === "reveal") {
      router.push(`/r/${target.token}`);
      return;
    }

    router.push(`/event/${target.eventId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="event_code">Código ou link</Label>
        <Input
          id="event_code"
          name="event_code"
          placeholder="Ex: 12, link do evento ou link pessoal"
          value={eventCode}
          onChange={(event) => setEventCode(event.target.value)}
          autoComplete="off"
          inputMode="text"
        />
      </div>
      <Button type="submit" className="w-full" size="lg">
        Continuar
        <ArrowRightIcon />
      </Button>
    </form>
  );
}
