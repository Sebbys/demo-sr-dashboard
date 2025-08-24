import { Skeleton } from "@/components/ui/skeleton";
import { Database, Activity, BarChart3, Users } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-transparent">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="text-muted-foreground mt-2">
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Records", icon: Database },
            { label: "Current Page", icon: Activity },
            { label: "Total Pages", icon: BarChart3 },
            { label: "Records / Page", icon: Users },
          ].map((s, idx) => (
            <div
              key={idx}
              className="border border-border p-6 bg-card rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-muted-foreground text-sm">
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <s.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        {/* List / Cards skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border border-border bg-card p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <div key={j} className="space-y-1">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-3 ml-6">
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
