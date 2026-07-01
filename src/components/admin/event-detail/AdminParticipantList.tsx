import { Trash2Icon } from "lucide-react";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";
import { ParticipantShareActions } from "@/components/admin/ParticipantShareActions";
import type { EventPeople } from "@/lib/types";
import { buildRevealPath } from "@/lib/revealUrl";
import type { ShareMessageTemplateId } from "@/lib/shareMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MANY_PARTICIPANTS_THRESHOLD } from "./constants";
import { ShareMessageTemplateSelector } from "./ShareMessageTemplateSelector";

type AdminParticipantListProps = {
  people: EventPeople[];
  groupId: number;
  eventTitle: string;
  isLocked: boolean;
  isSaving: boolean;
  shareMessageTemplateId: ShareMessageTemplateId;
  onShareMessageTemplateChange: (templateId: ShareMessageTemplateId) => void;
  showShareTemplateSelector?: boolean;
  onToggleLinkSent: (
    personId: number,
    linkSent: boolean,
    groupId: number,
  ) => void;
  onDeletePerson: (personId: number, groupId: number) => void;
};

export function AdminParticipantList({
  people,
  groupId,
  eventTitle,
  isLocked,
  isSaving,
  shareMessageTemplateId,
  onShareMessageTemplateChange,
  showShareTemplateSelector = true,
  onToggleLinkSent,
  onDeletePerson,
}: AdminParticipantListProps) {
  if (people.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum participante neste grupo.
      </p>
    );
  }

  const sentCount = people.filter((person) => person.link_sent).length;

  const listContent = (
    <ul className="divide-y rounded-lg border">
      {people.map((person) => (
        <li
          key={person.id}
          className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:py-3 ${
            person.link_sent ? "bg-muted/30" : ""
          }`}
        >
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex min-h-11 items-start pt-0.5">
              <Checkbox
                id={`link-sent-${groupId}-${person.id}`}
                checked={person.link_sent}
                onCheckedChange={(checked) => {
                  void onToggleLinkSent(person.id, checked === true, groupId);
                }}
                disabled={isSaving}
                aria-label={`Marcar ${person.name} como enviado`}
                className="size-5"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Label
                  htmlFor={`link-sent-${groupId}-${person.id}`}
                  className="cursor-pointer font-medium"
                >
                  {person.name}
                </Label>
                {person.link_sent ? (
                  <Badge variant="secondary">Enviado</Badge>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {buildRevealPath(person.reveal_token)}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <ParticipantShareActions
              participantName={person.name}
              revealToken={person.reveal_token}
              eventTitle={eventTitle}
              templateId={shareMessageTemplateId}
            />
            {!isLocked ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="min-h-11 self-stretch sm:min-h-0 sm:self-auto"
                onClick={() => onDeletePerson(person.id, groupId)}
                disabled={isSaving}
              >
                <Trash2Icon />
                Remover
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );

  const participantList =
    people.length >= MANY_PARTICIPANTS_THRESHOLD ? (
      <CollapsibleSection
        title={`Participantes (${people.length})`}
        summary={`${sentCount} de ${people.length} links enviados`}
        defaultOpen
      >
        {listContent}
      </CollapsibleSection>
    ) : (
      listContent
    );

  if (!showShareTemplateSelector) {
    return participantList;
  }

  return (
    <div className="space-y-4">
      <ShareMessageTemplateSelector
        participantCount={people.length}
        sentCount={sentCount}
        templateId={shareMessageTemplateId}
        onTemplateChange={onShareMessageTemplateChange}
      />
      {participantList}
    </div>
  );
}
