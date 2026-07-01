"use client";

import { CopyIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { copyTextToClipboard } from "@/lib/clipboard";
import { buildRevealUrl } from "@/lib/revealUrl";
import {
  buildParticipantShareMessage,
  buildWhatsAppShareUrl,
  type ShareMessageTemplateId,
} from "@/lib/shareMessage";
import { Button } from "@/components/ui/button";

type ParticipantShareActionsProps = {
  participantName: string;
  revealToken: string;
  eventTitle: string;
  templateId: ShareMessageTemplateId;
};

export function ParticipantShareActions({
  participantName,
  revealToken,
  eventTitle,
  templateId,
}: ParticipantShareActionsProps) {
  const revealUrl = buildRevealUrl(
    revealToken,
    typeof window === "undefined" ? "" : window.location.origin,
  );

  const shareMessage = buildParticipantShareMessage(templateId, {
    participantName,
    revealUrl,
    eventTitle,
  });

  const handleCopyLink = async () => {
    const copied = await copyTextToClipboard(revealUrl);
    if (copied) {
      toast.success("Link pessoal copiado!");
    } else {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const handleCopyMessage = async () => {
    const copied = await copyTextToClipboard(shareMessage);
    if (copied) {
      toast.success("Mensagem copiada!");
    } else {
      toast.error("Não foi possível copiar a mensagem.");
    }
  };

  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
        onClick={handleCopyLink}
      >
        <CopyIcon />
        Copiar link
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
        onClick={handleCopyMessage}
      >
        <MessageCircleIcon />
        Copiar mensagem
      </Button>
      <Button
        type="button"
        size="sm"
        className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
        asChild
      >
        <a
          href={buildWhatsAppShareUrl(shareMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir WhatsApp
        </a>
      </Button>
    </div>
  );
}
