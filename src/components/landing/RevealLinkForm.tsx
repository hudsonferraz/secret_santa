"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import {
  looksLikeLegacyEventInput,
  parseRevealInput,
} from "@/lib/parseRevealInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RevealLinkForm() {
  const router = useRouter();
  const [revealLink, setRevealLink] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (looksLikeLegacyEventInput(revealLink)) {
      toast.error(
        "Códigos de evento não são mais aceitos. Use o link pessoal enviado pelo organizador.",
      );
      return;
    }

    const revealToken = parseRevealInput(revealLink);
    if (!revealToken) {
      toast.error("Informe um link pessoal válido.");
      return;
    }

    router.push(`/r/${revealToken}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="reveal_link">Link pessoal</Label>
        <Input
          id="reveal_link"
          name="reveal_link"
          placeholder="Cole o link que o organizador enviou para você"
          value={revealLink}
          onChange={(event) => setRevealLink(event.target.value)}
          autoComplete="off"
          inputMode="url"
        />
      </div>
      <Button type="submit" className="w-full" size="lg">
        Ver meu amigo secreto
        <ArrowRightIcon />
      </Button>
    </form>
  );
}
