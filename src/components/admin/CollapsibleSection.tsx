"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  onOpenChange,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          {summary ? (
            <p className="text-sm text-muted-foreground">{summary}</p>
          ) : null}
        </div>
        <ChevronDownIcon
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen ? <div className="border-t px-4 py-4">{children}</div> : null}
    </div>
  );
}
