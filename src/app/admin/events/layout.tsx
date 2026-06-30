import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export default function AdminEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
