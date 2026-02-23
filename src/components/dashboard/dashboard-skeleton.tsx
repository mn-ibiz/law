import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function DashboardSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {cards > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
