import type { Metadata } from "next";

export const PRIVATE_PAGE_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
};

export function privatePageMetadata(
  metadata: Omit<Metadata, "robots">,
): Metadata {
  return {
    ...metadata,
    robots: PRIVATE_PAGE_ROBOTS,
  };
}
