import { DrawPreviewPanel } from "@/components/admin/DrawPreviewPanel";
import type { DrawPreview } from "@/lib/types";
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

type AdminEventDrawActionsProps = {
  eventId: number;
  isLocked: boolean;
  isSaving: boolean;
  canRunDraw: boolean;
  drawPreviewKey: number;
  onPreviewChange: (preview: DrawPreview | null) => void;
  onRunDraw: () => void;
  onResetDraw: () => void;
  onDeleteEvent: () => void;
};

export function AdminEventDrawActions({
  eventId,
  isLocked,
  isSaving,
  canRunDraw,
  drawPreviewKey,
  onPreviewChange,
  onRunDraw,
  onResetDraw,
  onDeleteEvent,
}: AdminEventDrawActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações do sorteio</CardTitle>
        <CardDescription>
          {isLocked
            ? "O sorteio já foi realizado. Resetar para editar participantes."
            : "Realize o sorteio quando todos os participantes estiverem cadastrados."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isLocked ? (
          <DrawPreviewPanel
            eventId={eventId}
            isLocked={isLocked}
            refreshKey={drawPreviewKey}
            onPreviewChange={onPreviewChange}
          />
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {!isLocked ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="hidden w-full sm:inline-flex sm:w-auto"
                  disabled={isSaving || !canRunDraw}
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
                    <Button onClick={onResetDraw}>Confirmar</Button>
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
                  <Button variant="destructive" onClick={onDeleteEvent}>
                    Excluir
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
