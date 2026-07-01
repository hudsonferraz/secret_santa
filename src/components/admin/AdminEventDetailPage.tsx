"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { AdminEventMobileActions } from "@/components/admin/AdminEventMobileActions";
import { AdminShell } from "@/components/admin/AdminShell";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";
import { applyEventDetailLoadResult } from "@/components/admin/event-detail/applyEventDetailLoadResult";
import { AdminEventDrawActions } from "@/components/admin/event-detail/AdminEventDrawActions";
import { AdminEventGroupSelector } from "@/components/admin/event-detail/AdminEventGroupSelector";
import { AdminEventHeader } from "@/components/admin/event-detail/AdminEventHeader";
import { AdminParticipantForm } from "@/components/admin/event-detail/AdminParticipantForm";
import { AdminParticipantList } from "@/components/admin/event-detail/AdminParticipantList";
import type { AdminEventDetailPageState } from "@/components/admin/event-detail/constants";
import { ShareMessageTemplateSelector } from "@/components/admin/event-detail/ShareMessageTemplateSelector";
import { formatGroupShareSummary } from "@/components/admin/event-detail/formatGroupShareSummary";
import {
  adminCreateGroup,
  adminCreatePerson,
  adminDeleteEvent,
  adminDeleteGroup,
  adminDeletePerson,
  adminGetEventPeopleSummary,
  adminGetPeople,
  adminUpdatePerson,
  adminUpdateEvent,
} from "@/lib/apiClient";
import type {
  DrawPreview,
  Event,
  EventGroup,
  EventPeople,
  EventPeopleSummary,
} from "@/lib/types";
import {
  DEFAULT_SHARE_MESSAGE_TEMPLATE_ID,
  type ShareMessageTemplateId,
} from "@/lib/shareMessage";
import { loadAdminEventDetail } from "@/lib/loadAdminEventDetail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type AdminEventDetailPageProps = {
  eventId: number;
};

export function AdminEventDetailPage({ eventId }: AdminEventDetailPageProps) {
  const router = useRouter();

  const [eventItem, setEventItem] = useState<Event | null>(null);
  const [groups, setGroups] = useState<EventGroup[]>([]);
  const [people, setPeople] = useState<EventPeople[]>([]);
  const [peopleByGroupId, setPeopleByGroupId] = useState<
    Record<number, EventPeople[]>
  >({});
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [pageState, setPageState] =
    useState<AdminEventDetailPageState>("loading");
  const [isSaving, setIsSaving] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [personName, setPersonName] = useState("");
  const [shareMessageTemplateId, setShareMessageTemplateId] =
    useState<ShareMessageTemplateId>(DEFAULT_SHARE_MESSAGE_TEMPLATE_ID);
  const [drawPreview, setDrawPreview] = useState<DrawPreview | null>(null);
  const [drawPreviewKey, setDrawPreviewKey] = useState(0);
  const [peopleSummary, setPeopleSummary] = useState<EventPeopleSummary | null>(
    null,
  );

  const refreshDrawPreview = useCallback(() => {
    setDrawPreviewKey((currentKey) => currentKey + 1);
  }, []);

  const loadPeopleSummary = useCallback(async () => {
    const result = await adminGetEventPeopleSummary(eventId);
    if (result.ok) {
      setPeopleSummary(result.data.summary);
    }
  }, [eventId]);

  const updatePeopleSummaryForLinkSent = useCallback(
    (groupId: number, linkSent: boolean) => {
      setPeopleSummary((currentSummary) => {
        if (!currentSummary) {
          return currentSummary;
        }

        const groupSummary = currentSummary.byGroup[groupId] ?? {
          participantCount: 0,
          sentCount: 0,
        };
        const sentDelta = linkSent ? 1 : -1;

        return {
          participantCount: currentSummary.participantCount,
          sentCount: Math.max(0, currentSummary.sentCount + sentDelta),
          byGroup: {
            ...currentSummary.byGroup,
            [groupId]: {
              ...groupSummary,
              sentCount: Math.max(0, groupSummary.sentCount + sentDelta),
            },
          },
        };
      });
    },
    [],
  );

  const isLocked = eventItem?.status === true;
  const useGroupAccordion = Boolean(eventItem?.grouped && groups.length > 1);

  const syncPeopleForGroup = useCallback(
    (groupId: number, groupPeople: EventPeople[]) => {
      setPeopleByGroupId((current) => ({
        ...current,
        [groupId]: groupPeople,
      }));
      if (selectedGroupId === groupId) {
        setPeople(groupPeople);
      }
    },
    [selectedGroupId],
  );

  const loadPeople = useCallback(
    async (groupId: number) => {
      const result = await adminGetPeople(eventId, groupId);
      if (result.ok) {
        syncPeopleForGroup(groupId, result.data.people);
      } else {
        toast.error(result.error);
      }
    },
    [eventId, syncPeopleForGroup],
  );

  const ensureGroupPeopleLoaded = useCallback(
    async (groupId: number) => {
      if (peopleByGroupId[groupId] !== undefined) {
        return;
      }

      await loadPeople(groupId);
    },
    [loadPeople, peopleByGroupId],
  );

  const loadData = useCallback(async () => {
    const result = await loadAdminEventDetail(eventId);
    applyEventDetailLoadResult(result, {
      setEventItem,
      setGroups,
      setPeople,
      setSelectedGroupId,
      setPageState,
      seedPeopleByGroupId: (groupId, groupPeople) => {
        setPeopleByGroupId((current) => ({
          ...current,
          [groupId]: groupPeople,
        }));
      },
    });
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await loadAdminEventDetail(eventId);
      if (cancelled) return;

      applyEventDetailLoadResult(result, {
        setEventItem,
        setGroups,
        setPeople,
        setSelectedGroupId,
        setPageState,
        seedPeopleByGroupId: (groupId, groupPeople) => {
          setPeopleByGroupId((current) => ({
            ...current,
            [groupId]: groupPeople,
          }));
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (pageState !== "ready" || !eventItem?.grouped || groups.length <= 1) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await adminGetEventPeopleSummary(eventId);
      if (cancelled || !result.ok) {
        return;
      }

      setPeopleSummary(result.data.summary);
    })();

    return () => {
      cancelled = true;
    };
  }, [pageState, eventItem?.grouped, groups.length, eventId]);

  const handleGroupChange = async (groupId: number) => {
    setSelectedGroupId(groupId);
    await loadPeople(groupId);
  };

  const handleToggleLinkSent = async (
    personId: number,
    linkSent: boolean,
    groupId: number,
  ) => {
    const updatePeopleList = (currentPeople: EventPeople[]) =>
      currentPeople.map((person) =>
        person.id === personId ? { ...person, link_sent: linkSent } : person,
      );

    setPeopleByGroupId((current) => ({
      ...current,
      [groupId]: updatePeopleList(current[groupId] ?? []),
    }));

    if (selectedGroupId === groupId) {
      setPeople((currentPeople) => updatePeopleList(currentPeople));
    }

    updatePeopleSummaryForLinkSent(groupId, linkSent);

    const result = await adminUpdatePerson(eventId, groupId, personId, {
      link_sent: linkSent,
    });

    if (!result.ok) {
      toast.error(result.error);
      await loadPeople(groupId);
      await loadPeopleSummary();
    }
  };

  const handleCreateGroup = async (
    formEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault();
    if (isLocked) return;

    setIsSaving(true);
    const result = await adminCreateGroup(eventId, groupName.trim());
    if (!result.ok) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Grupo criado.");
    setGroupName("");
    setIsSaving(false);
    await loadData();
    refreshDrawPreview();
    await loadPeopleSummary();
  };

  const handleCreatePerson = async (
    formEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault();
    if (isLocked || selectedGroupId === null) return;

    setIsSaving(true);
    const result = await adminCreatePerson(eventId, selectedGroupId, {
      name: personName.trim(),
    });

    if (!result.ok) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Participante adicionado.");
    setPersonName("");
    setIsSaving(false);
    await loadPeople(selectedGroupId);
    refreshDrawPreview();
    await loadPeopleSummary();
  };

  const handleRunDraw = async () => {
    setIsSaving(true);
    const result = await adminUpdateEvent(eventId, { status: true });
    if (!result.ok) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Sorteio realizado!");
    setIsSaving(false);
    await loadData();
  };

  const handleResetDraw = async () => {
    setIsSaving(true);
    const result = await adminUpdateEvent(eventId, { status: false });
    if (!result.ok) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Sorteio resetado.");
    setIsSaving(false);
    await loadData();
    refreshDrawPreview();
    await loadPeopleSummary();
  };

  const handleDeleteEvent = async () => {
    setIsSaving(true);
    const result = await adminDeleteEvent(eventId);
    if (!result.ok) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Evento excluído.");
    router.push("/admin/events");
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (isLocked) return;

    setIsSaving(true);
    const result = await adminDeleteGroup(eventId, groupId);
    if (!result.ok) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Grupo removido.");
    setIsSaving(false);
    await loadData();
    refreshDrawPreview();
    await loadPeopleSummary();
  };

  const handleDeletePerson = async (personId: number, groupId: number) => {
    if (isLocked) return;

    setIsSaving(true);
    const result = await adminDeletePerson(eventId, groupId, personId);
    if (!result.ok) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Participante removido.");
    setIsSaving(false);
    await loadPeople(groupId);
    refreshDrawPreview();
    await loadPeopleSummary();
  };

  if (pageState === "loading") {
    return (
      <AdminShell title="Carregando evento...">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </AdminShell>
    );
  }

  if (pageState === "not_found" || !eventItem) {
    return (
      <AdminShell title="Evento não encontrado">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Evento não encontrado</CardTitle>
            <CardDescription>
              Este evento não existe ou foi removido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/events">Voltar aos eventos</Link>
            </Button>
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  const canAddParticipant = !isLocked && selectedGroupId !== null;
  const canRunDraw =
    !isLocked && groups.length > 0 && drawPreview?.canDraw === true;

  const totalParticipantCount = useGroupAccordion
    ? (peopleSummary?.participantCount ?? 0)
    : people.length;
  const totalSentCount = useGroupAccordion
    ? (peopleSummary?.sentCount ?? 0)
    : people.filter((person) => person.link_sent).length;

  return (
    <AdminShell title={eventItem.title}>
      <div className="flex flex-col gap-6 pb-24 sm:pb-0">
        <AdminEventHeader event={eventItem} isLocked={isLocked} />

        <AdminEventDrawActions
          eventId={eventId}
          isLocked={isLocked}
          isSaving={isSaving}
          canRunDraw={canRunDraw}
          drawPreviewKey={drawPreviewKey}
          onPreviewChange={setDrawPreview}
          onRunDraw={handleRunDraw}
          onResetDraw={handleResetDraw}
          onDeleteEvent={handleDeleteEvent}
        />

        {eventItem.grouped ? (
          <AdminEventGroupSelector
            groups={groups}
            selectedGroupId={selectedGroupId}
            isLocked={isLocked}
            isSaving={isSaving}
            useGroupAccordion={useGroupAccordion}
            groupName={groupName}
            onGroupNameChange={setGroupName}
            onCreateGroup={handleCreateGroup}
            onGroupChange={handleGroupChange}
            onDeleteGroup={handleDeleteGroup}
          />
        ) : null}

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Participantes</CardTitle>
            <CardDescription>
              {selectedGroupId === null
                ? "Selecione ou crie um grupo para adicionar participantes."
                : isLocked
                  ? "Envie um link pessoal para cada participante."
                  : "Adicione participantes antes de realizar o sorteio."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {useGroupAccordion ? (
              <div className="space-y-3">
                <ShareMessageTemplateSelector
                  participantCount={totalParticipantCount}
                  sentCount={totalSentCount}
                  templateId={shareMessageTemplateId}
                  onTemplateChange={setShareMessageTemplateId}
                />
                {groups.map((group) => {
                  const groupPeople = peopleByGroupId[group.id];

                  return (
                    <CollapsibleSection
                      key={group.id}
                      title={group.name}
                      summary={formatGroupShareSummary(
                        group.id,
                        groupPeople,
                        peopleSummary,
                      )}
                      defaultOpen={group.id === selectedGroupId}
                      onOpenChange={(open) => {
                        if (open) {
                          setSelectedGroupId(group.id);
                          void ensureGroupPeopleLoaded(group.id);
                        }
                      }}
                    >
                      <div className="space-y-4">
                        {!isLocked && selectedGroupId === group.id ? (
                          <AdminParticipantForm
                            personName={personName}
                            isSaving={isSaving}
                            onPersonNameChange={setPersonName}
                            onSubmit={handleCreatePerson}
                            className="hidden sm:flex flex-col gap-3 sm:flex-row"
                          />
                        ) : null}
                        {groupPeople === undefined ? (
                          <p className="text-sm text-muted-foreground">
                            Carregando participantes...
                          </p>
                        ) : (
                          <AdminParticipantList
                            people={groupPeople}
                            groupId={group.id}
                            eventTitle={eventItem.title}
                            isLocked={isLocked}
                            isSaving={isSaving}
                            shareMessageTemplateId={shareMessageTemplateId}
                            onShareMessageTemplateChange={
                              setShareMessageTemplateId
                            }
                            showShareTemplateSelector={false}
                            onToggleLinkSent={handleToggleLinkSent}
                            onDeletePerson={handleDeletePerson}
                          />
                        )}
                        {!isLocked && groups.length > 1 ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="min-h-11"
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={isSaving}
                          >
                            <Trash2Icon />
                            Remover grupo
                          </Button>
                        ) : null}
                      </div>
                    </CollapsibleSection>
                  );
                })}
              </div>
            ) : (
              <>
                {!isLocked && selectedGroupId !== null ? (
                  <AdminParticipantForm
                    personName={personName}
                    isSaving={isSaving}
                    onPersonNameChange={setPersonName}
                    onSubmit={handleCreatePerson}
                    className="hidden sm:flex flex-col gap-3 sm:flex-row"
                  />
                ) : null}
                {selectedGroupId !== null ? (
                  <AdminParticipantList
                    people={people}
                    groupId={selectedGroupId}
                    eventTitle={eventItem.title}
                    isLocked={isLocked}
                    isSaving={isSaving}
                    shareMessageTemplateId={shareMessageTemplateId}
                    onShareMessageTemplateChange={setShareMessageTemplateId}
                    onToggleLinkSent={handleToggleLinkSent}
                    onDeletePerson={handleDeletePerson}
                  />
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminEventMobileActions
        canAddParticipant={canAddParticipant}
        canRunDraw={canRunDraw}
        isSaving={isSaving}
        personName={personName}
        onPersonNameChange={setPersonName}
        onAddParticipant={handleCreatePerson}
        onRunDraw={handleRunDraw}
      />
    </AdminShell>
  );
}
