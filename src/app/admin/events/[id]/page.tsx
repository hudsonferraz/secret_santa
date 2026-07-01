import { notFound } from "next/navigation";
import { AdminEventDetailPage } from "@/components/admin/AdminEventDetailPage";

type AdminEventDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEventDetailRoute({
  params,
}: AdminEventDetailRouteProps) {
  const { id } = await params;
  const eventId = Number(id);

  if (Number.isNaN(eventId) || eventId <= 0) {
    notFound();
  }

  return <AdminEventDetailPage eventId={eventId} />;
}
