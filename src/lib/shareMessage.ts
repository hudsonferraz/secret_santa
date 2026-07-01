export type ShareMessageTemplateId = "friendly" | "simple" | "with_event_title";

type ShareMessageOptions = {
  participantName: string;
  revealUrl: string;
  eventTitle: string;
};

export type ShareMessageTemplate = {
  id: ShareMessageTemplateId;
  label: string;
  buildMessage: (options: ShareMessageOptions) => string;
};

function getFirstName(participantName: string): string {
  const trimmedName = participantName.trim();
  if (!trimmedName) {
    return "participante";
  }

  return trimmedName.split(/\s+/)[0] ?? trimmedName;
}

export const SHARE_MESSAGE_TEMPLATES: ShareMessageTemplate[] = [
  {
    id: "friendly",
    label: "Oi + link",
    buildMessage: ({ participantName, revealUrl }) =>
      `Oi ${getFirstName(participantName)}! Seu link do Amigo Secreto: ${revealUrl}`,
  },
  {
    id: "simple",
    label: "Direto",
    buildMessage: ({ participantName, revealUrl }) =>
      `${participantName}, aqui está seu link do Amigo Secreto: ${revealUrl}`,
  },
  {
    id: "with_event_title",
    label: "Com nome do evento",
    buildMessage: ({ participantName, revealUrl, eventTitle }) =>
      `Oi ${getFirstName(participantName)}! Seu link do Amigo Secreto "${eventTitle}": ${revealUrl}`,
  },
];

export const DEFAULT_SHARE_MESSAGE_TEMPLATE_ID: ShareMessageTemplateId =
  "friendly";

export function getShareMessageTemplate(
  templateId: ShareMessageTemplateId,
): ShareMessageTemplate {
  return (
    SHARE_MESSAGE_TEMPLATES.find((template) => template.id === templateId) ??
    SHARE_MESSAGE_TEMPLATES[0]
  );
}

export function buildParticipantShareMessage(
  templateId: ShareMessageTemplateId,
  options: ShareMessageOptions,
): string {
  return getShareMessageTemplate(templateId).buildMessage(options);
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
