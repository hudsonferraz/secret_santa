import { Loader2Icon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminParticipantFormProps = {
  personName: string;
  isSaving: boolean;
  onPersonNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
};

export function AdminParticipantForm({
  personName,
  isSaving,
  onPersonNameChange,
  onSubmit,
  className,
}: AdminParticipantFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={className ?? "flex flex-col gap-3 sm:flex-row"}
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="person_name">Nome</Label>
        <Input
          id="person_name"
          value={personName}
          onChange={(event) => onPersonNameChange(event.target.value)}
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
  );
}
