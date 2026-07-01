import { PlusIcon, Trash2Icon } from "lucide-react";
import type { EventGroup } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOBILE_ICON_BUTTON_CLASS } from "./constants";

type AdminEventGroupSelectorProps = {
  groups: EventGroup[];
  selectedGroupId: number | null;
  isLocked: boolean;
  isSaving: boolean;
  useGroupAccordion: boolean;
  groupName: string;
  onGroupNameChange: (value: string) => void;
  onCreateGroup: (event: React.FormEvent<HTMLFormElement>) => void;
  onGroupChange: (groupId: number) => void;
  onDeleteGroup: (groupId: number) => void;
};

export function AdminEventGroupSelector({
  groups,
  selectedGroupId,
  isLocked,
  isSaving,
  useGroupAccordion,
  groupName,
  onGroupNameChange,
  onCreateGroup,
  onGroupChange,
  onDeleteGroup,
}: AdminEventGroupSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grupos</CardTitle>
        <CardDescription>
          Participantes só sorteiam pessoas de outros grupos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLocked ? (
          <form
            onSubmit={onCreateGroup}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              placeholder="Nome do grupo"
              value={groupName}
              onChange={(event) => onGroupNameChange(event.target.value)}
              required
              disabled={isSaving}
            />
            <Button type="submit" disabled={isSaving}>
              <PlusIcon />
              Adicionar grupo
            </Button>
          </form>
        ) : null}

        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Crie pelo menos um grupo antes de adicionar participantes.
          </p>
        ) : useGroupAccordion ? (
          <p className="text-sm text-muted-foreground">
            Expanda um grupo abaixo para ver e enviar links aos participantes.
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
                  onClick={() => onGroupChange(group.id)}
                >
                  {group.name}
                </Button>
                {!isLocked && groups.length > 1 ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={MOBILE_ICON_BUTTON_CLASS}
                    aria-label={`Remover grupo ${group.name}`}
                    onClick={() => onDeleteGroup(group.id)}
                    disabled={isSaving}
                  >
                    <Trash2Icon />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
