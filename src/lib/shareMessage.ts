type ShareMessageOptions = {
  participantName: string;
  revealUrl: string;
};

function getFirstName(participantName: string): string {
  const trimmedName = participantName.trim();
  if (!trimmedName) {
    return "participante";
  }

  return trimmedName.split(/\s+/)[0] ?? trimmedName;
}

export function buildParticipantShareMessage({
  participantName,
  revealUrl,
}: ShareMessageOptions): string {
  return `Oi ${getFirstName(participantName)}! Seu link do Amigo Secreto: ${revealUrl}`;
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
