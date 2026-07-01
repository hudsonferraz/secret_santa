"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CopyIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminCreateGroup,
  adminCreatePerson,
  adminDeleteEvent,
  adminDeleteGroup,
  adminDeletePerson,
  adminGetPeople,
  adminUpdateEvent,
} from "@/lib/apiClient";
import type { Event, EventGroup, EventPeople } from "@/lib/types";
import { buildRevealPath, buildRevealUrl } from "@/lib/revealUrl";
import { copyTextToClipboard } from "@/lib/clipboard";
import { loadAdminEventDetail } from "@/lib/loadAdminEventDetail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type AdminEventDetailPageProps = {
  eventId: number;
};

type PageState = "loading" | "ready" | "not_found";

const MOBILE_ICON_BUTTON_CLASS = "size-11 shrink-0 sm:size-8";

function applyEventDetailLoadResult(
  result: Awaited<ReturnType<typeof loadAdminEventDetail>>,
  setters: {
    setEventItem: (event: Event | null) => void;
    setGroups: (groups: EventGroup[]) => void;
    setPeople: (people: EventPeople[]) => void;
    setSelectedGroupId: (groupId: number | null) => void;
    setPageState: (state: PageState) => void;
  },
) {
  if (result.status === "not_found") {
    if (result.error) {
      toast.error(result.error);
    }
    setters.setPageState("not_found");
    return;
  }

  setters.setEventItem(result.event);
  setters.setGroups(result.groups);
  setters.setPeople(result.people);
  setters.setSelectedGroupId(result.selectedGroupId);
  setters.setPageState("ready");
}

export function AdminEventDetailPage({ eventId }: AdminEventDetailPageProps) {
  const router = useRouter();

  const [eventItem, setEventItem] = useState<Event | null>(null);
  const [groups, setGroups] = useState<EventGroup[]>([]);
  const [people, setPeople] = useState<EventPeople[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [isSaving, setIsSaving] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [personName, setPersonName] = useState("");

  const isLocked = eventItem?.status === true;

  const loadPeople = useCallback(
    async (groupId: number) => {
      const result = await adminGetPeople(eventId, groupId);
      if (result.ok) {
        setPeople(result.data.people);
      } else {
        toast.error(result.error);
      }
    },
    [eventId],
  );

  const loadData = useCallback(async () => {
    const result = await loadAdminEventDetail(eventId);
    applyEventDetailLoadResult(result, {
      setEventItem,
      setGroups,
      setPeople,
      setSelectedGroupId,
      setPageState,
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
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleGroupChange = async (groupId: number) => {
    setSelectedGroupId(groupId);
    await loadPeople(groupId);
  };

  const handleCopyRevealLink = async (revealToken: string) => {
    const origin =
      typeof window === "undefined" ? "" : window.location.origin;
    const copied = await copyTextToClipboard(
      buildRevealUrl(revealToken, origin),
    );
    if (copied) {
      toast.success("Link pessoal copiado!");
    } else {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const handleCreateGroup = async (formEvent: React.FormEvent<HTMLFormElement>) => {
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
  };

  const handleDeletePerson = async (personId: number) => {
    if (isLocked || selectedGroupId === null) return;

    setIsSaving(true);
    const result = await adminDeletePerson(
      eventId,
      selectedGroupId,
      personId,
    );
    if (!result.ok) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Participante removido.");
    setIsSaving(false);
    await loadPeople(selectedGroupId);
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

  return (
    <AdminShell title={eventItem.title}>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/events">← Voltar aos eventos</Link>
        </Button>
        <Badge variant={eventItem.status ? "default" : "secondary"}>
          {eventItem.status ? "Sorteado" : "Pendente"}
        </Badge>
        {eventItem.grouped && <Badge variant="outline">Com grupos</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do evento</CardTitle>
          <CardDescription>{eventItem.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isLocked
              ? "Envie o link pessoal de cada participante. Esses links são privados e mostram apenas o sorteado daquela pessoa."
              : "Depois do sorteio, copie e envie o link pessoal de cada participante abaixo."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações do sorteio</CardTitle>
          <CardDescription>
            {isLocked
              ? "O sorteio já foi realizado. Resetar para editar participantes."
              : "Realize o sorteio quando todos os participantes estiverem cadastrados."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {!isLocked ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSaving || groups.length === 0}
                >
                  Realizar sorteio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar sorteio</DialogTitle>
                  <DialogDescription>
                    Esta ação não pode ser desfeita sem resetar. Deseja sortear
                    agora?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleRunDraw}>Confirmar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isSaving}
                >
                  Resetar sorteio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resetar sorteio</DialogTitle>
                  <DialogDescription>
                    Isso apagará os pares sorteados e permitirá editar
                    participantes novamente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleResetDraw}>Confirmar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={isSaving}
              >
                Excluir evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir evento</DialogTitle>
                <DialogDescription>
                  Esta ação é permanente e removerá grupos e participantes.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={handleDeleteEvent}>
                    Excluir
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {eventItem.grouped && (
        <Card>
          <CardHeader>
            <CardTitle>Grupos</CardTitle>
            <CardDescription>
              Participantes só sorteiam pessoas de outros grupos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLocked && (
              <form onSubmit={handleCreateGroup} className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Nome do grupo"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  required
                  disabled={isSaving}
                />
                <Button type="submit" disabled={isSaving}>
                  <PlusIcon />
                  Adicionar grupo
                </Button>
              </form>
            )}

            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Crie pelo menos um grupo antes de adicionar participantes.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        selectedGroupId === group.id ? "default" : "outline"
                      }
                      onClick={() => handleGroupChange(group.id)}
                    >
                      {group.name}
                    </Button>
                    {!isLocked && groups.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={MOBILE_ICON_BUTTON_CLASS}
                        aria-label={`Remover grupo ${group.name}`}
                        onClick={() => handleDeleteGroup(group.id)}
                        disabled={isSaving}
                      >
                        <Trash2Icon />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Participantes</CardTitle>
          <CardDescription>
            {selectedGroupId === null
              ? "Selecione ou crie um grupo para adicionar participantes."
              : isLocked
                ? "Envie um link pessoal para cada participante. Não compartilhe links numéricos de evento."
                : "Adicione participantes antes de realizar o sorteio."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLocked && selectedGroupId !== null && (
            <form onSubmit={handleCreatePerson} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="person_name">Nome</Label>
                <Input
                  id="person_name"
                  value={personName}
                  onChange={(event) => setPersonName(event.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto sm:self-end"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Adicionar participante
                  </>
                )}
              </Button>
            </form>
          )}

          {people.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum participante neste grupo.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {people.map((person) => (
                <li
                  key={person.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{person.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {buildRevealPath(person.reveal_token)}
                    </p>
                  </div>
                  <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
                      onClick={() =>
                        handleCopyRevealLink(person.reveal_token)
                      }
                    >
                      <CopyIcon />
                      Copiar link
                    </Button>
                    {!isLocked && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={MOBILE_ICON_BUTTON_CLASS}
                        aria-label={`Remover ${person.name}`}
                        onClick={() => handleDeletePerson(person.id)}
                        disabled={isSaving}
                      >
                        <Trash2Icon />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
