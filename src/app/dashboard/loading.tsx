export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-10 w-3/4 bg-muted animate-pulse rounded mx-auto mb-4"></div>
          <div className="h-4 w-full bg-muted animate-pulse rounded mx-auto"></div>
        </div>

        <div className="border-2 border-dashed border-border p-12 text-center rounded-lg">
          <div className="h-16 w-16 bg-muted animate-pulse rounded-full mx-auto mb-6"></div>
          <div className="h-6 w-1/2 bg-muted animate-pulse rounded mx-auto mb-2"></div>
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded mx-auto mb-6"></div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-10 w-40 bg-primary/50 animate-pulse rounded"></div>
          </div>
        </div>

        <div className="mt-12 border border-border p-6 bg-card rounded-lg shadow-sm">
          <div className="h-6 w-1/3 bg-muted animate-pulse rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
            <div className="ml-4 space-y-1">
              <div className="h-4 w-1/4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
