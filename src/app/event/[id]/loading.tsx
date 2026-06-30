import { Skeleton } from "@/components/ui/skeleton";

export default function EventLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-6 w-32" />
          <Skeleton className="mx-auto h-9 w-3/4" />
          <Skeleton className="mx-auto h-16 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
    </div>
  );
}
