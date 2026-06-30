import { AdminEventDetailPage } from "@/components/admin/AdminEventDetailPage";

type AdminEventDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEventDetailRoute({
  params,
}: AdminEventDetailRouteProps) {
  const { id } = await params;
  const eventId = Number(id);

  return <AdminEventDetailPage eventId={eventId} />;
}
