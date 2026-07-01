type ParticipantLinkProgressProps = {
  participantCount: number;
  sentCount: number;
};

export function ParticipantLinkProgress({
  participantCount,
  sentCount,
}: ParticipantLinkProgressProps) {
  if (participantCount === 0) {
    return null;
  }

  return (
    <p className="text-sm text-muted-foreground">
      {sentCount} de {participantCount} links enviados
    </p>
  );
}
