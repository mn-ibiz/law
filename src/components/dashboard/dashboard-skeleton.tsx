import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
