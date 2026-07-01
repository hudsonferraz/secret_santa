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
import { usePublicAppOrigin } from "@/lib/usePublicAppOrigin";
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
  const origin = usePublicAppOrigin();

  const buildShareContent = (resolvedOrigin: string) => {
    const revealUrl = buildRevealUrl(revealToken, resolvedOrigin);
    const shareMessage = buildParticipantShareMessage(templateId, {
      participantName,
      revealUrl,
      eventTitle,
    });

    return { revealUrl, shareMessage };
  };

  const resolveOriginForAction = () =>
    origin || (typeof window !== "undefined" ? window.location.origin : "");

  const handleCopyLink = async () => {
    const actionOrigin = resolveOriginForAction();
    if (!actionOrigin) {
      toast.error("Não foi possível montar o link completo.");
      return;
    }

    const { revealUrl } = buildShareContent(actionOrigin);
    const copied = await copyTextToClipboard(revealUrl);
    if (copied) {
      toast.success("Link pessoal copiado!");
    } else {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const handleCopyMessage = async () => {
    const actionOrigin = resolveOriginForAction();
    if (!actionOrigin) {
      toast.error("Não foi possível montar a mensagem completa.");
      return;
    }

    const { shareMessage } = buildShareContent(actionOrigin);
    const copied = await copyTextToClipboard(shareMessage);
    if (copied) {
      toast.success("Mensagem copiada!");
    } else {
      toast.error("Não foi possível copiar a mensagem.");
    }
  };

  const shareContent = origin ? buildShareContent(origin) : null;

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
      {shareContent ? (
        <Button
          type="button"
          size="sm"
          className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
          asChild
        >
          <a
            href={buildWhatsAppShareUrl(shareContent.shareMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir WhatsApp
          </a>
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
          disabled
        >
          Abrir WhatsApp
        </Button>
      )}
    </div>
  );
}
