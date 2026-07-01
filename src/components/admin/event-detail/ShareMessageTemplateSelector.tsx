import { Label } from "@/components/ui/label";
import {
  SHARE_MESSAGE_TEMPLATES,
  type ShareMessageTemplateId,
} from "@/lib/shareMessage";

type ShareMessageTemplateSelectorProps = {
  participantCount: number;
  sentCount: number;
  templateId: ShareMessageTemplateId;
  onTemplateChange: (templateId: ShareMessageTemplateId) => void;
};

export function ShareMessageTemplateSelector({
  participantCount,
  sentCount,
  templateId,
  onTemplateChange,
}: ShareMessageTemplateSelectorProps) {
  if (participantCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2 sm:flex-1">
        <Label htmlFor="share_message_template">Modelo da mensagem</Label>
        <select
          id="share_message_template"
          value={templateId}
          onChange={(event) =>
            onTemplateChange(event.target.value as ShareMessageTemplateId)
          }
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {SHARE_MESSAGE_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-muted-foreground">
        {sentCount} de {participantCount} links enviados
      </p>
    </div>
  );
}
