"use client";

import { Loader2Icon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type AdminEventMobileActionsProps = {
  canAddParticipant: boolean;
  canRunDraw: boolean;
  isSaving: boolean;
  personName: string;
  onPersonNameChange: (value: string) => void;
  onAddParticipant: (event: React.FormEvent<HTMLFormElement>) => void;
  onRunDraw: () => void;
};

export function AdminEventMobileActions({
  canAddParticipant,
  canRunDraw,
  isSaving,
  personName,
  onPersonNameChange,
  onAddParticipant,
  onRunDraw,
}: AdminEventMobileActionsProps) {
  if (!canAddParticipant && !canRunDraw) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
      <div className="mx-auto flex w-full max-w-5xl gap-2">
        {canAddParticipant ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="min-h-11 flex-1" disabled={isSaving}>
                <PlusIcon />
                Adicionar participante
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar participante</DialogTitle>
                <DialogDescription>
                  Informe o nome de quem vai participar do sorteio.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onAddParticipant} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile_person_name">Nome</Label>
                  <Input
                    id="mobile_person_name"
                    value={personName}
                    onChange={(event) => onPersonNameChange(event.target.value)}
                    required
                    disabled={isSaving}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2Icon className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Adicionar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}

        {canRunDraw ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={canAddParticipant ? "outline" : "default"}
                className="min-h-11 flex-1"
                disabled={isSaving}
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
                  <Button onClick={onRunDraw}>Confirmar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    </div>
  );
}
