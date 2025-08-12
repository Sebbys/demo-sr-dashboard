export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Skeleton */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-5 w-12 bg-gray-800 animate-pulse rounded"></div>
              <div className="h-6 w-px bg-gray-800"></div>
              <div className="h-6 w-48 bg-gray-800 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-800 animate-pulse rounded mb-4"></div>
          <div className="h-4 w-96 bg-gray-800 animate-pulse rounded"></div>
        </div>

        {/* Controls Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-4 w-32 bg-gray-800 animate-pulse rounded"></div>
          <div className="flex gap-4">
            <div className="h-10 w-24 bg-gray-800 animate-pulse rounded"></div>
            <div className="h-10 w-24 bg-gray-800 animate-pulse rounded"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="border border-gray-800 bg-gray-900/20 overflow-hidden">
          {/* Table Header */}
          <div className="border-b border-gray-800 bg-gray-900/40">
            <div className="grid grid-cols-4 gap-4 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-800 animate-pulse rounded"></div>
              ))}
            </div>
          </div>
          
          {/* Table Rows */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
            <div key={row} className="border-b border-gray-800 last:border-b-0">
              <div className="grid grid-cols-4 gap-4 p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-800 animate-pulse rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <div className="h-10 w-20 bg-gray-800 animate-pulse rounded"></div>
          <div className="h-4 w-32 bg-gray-800 animate-pulse rounded"></div>
          <div className="h-10 w-20 bg-gray-800 animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  )
}
