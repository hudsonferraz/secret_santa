"use client";

import { useEffect, useState } from "react";
import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { adminGetDrawPreview } from "@/lib/apiClient";
import type { DrawPreview } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type DrawPreviewPanelProps = {
  eventId: number;
  isLocked: boolean;
  refreshKey: number;
  onPreviewChange: (preview: DrawPreview | null) => void;
};

export function DrawPreviewPanel({
  eventId,
  isLocked,
  refreshKey,
  onPreviewChange,
}: DrawPreviewPanelProps) {
  const [preview, setPreview] = useState<DrawPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLocked) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      const result = await adminGetDrawPreview(eventId);
      if (cancelled) {
        return;
      }

      if (result.ok) {
        setPreview(result.data.preview);
        onPreviewChange(result.data.preview);
      } else {
        setPreview(null);
        onPreviewChange(null);
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, isLocked, refreshKey, onPreviewChange]);

  if (isLocked) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">Prévia do sorteio</p>
        <Badge variant={preview.canDraw ? "default" : "secondary"}>
          {preview.canDraw ? "Pronto para sortear" : "Ajustes necessários"}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Participantes</dt>
          <dd className="text-lg font-semibold">{preview.participantCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Grupos</dt>
          <dd className="text-lg font-semibold">{preview.groupCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Grupos com gente</dt>
          <dd className="text-lg font-semibold">
            {preview.groupsWithParticipants}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Sorteio possível</dt>
          <dd className="text-lg font-semibold">
            {preview.groupedDrawPossible ? "Sim" : "Não"}
          </dd>
        </div>
      </dl>

      {preview.grouped && preview.groups.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Composição por grupo</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {preview.groups.map((group) => (
              <li key={group.id} className="flex justify-between gap-3">
                <span>{group.name}</span>
                <span>{group.participantCount} participante(s)</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {preview.blockingError ? (
        <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          <p>{preview.blockingError}</p>
        </div>
      ) : null}

      {preview.warnings.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Avisos</p>
          <ul className="space-y-2">
            {preview.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm"
              >
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {preview.canDraw && preview.warnings.length === 0 ? (
        <div className="flex gap-2 text-sm text-muted-foreground">
          <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
          <p>A composição atual permite realizar o sorteio.</p>
        </div>
      ) : null}
    </div>
  );
}
