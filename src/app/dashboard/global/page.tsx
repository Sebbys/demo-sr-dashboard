import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Search,
  BarChart3,
  Database,
  Users,
  Activity,
  Eye,
  Calendar,
  Hash,
  FileText,
  Info,
} from "lucide-react";
import Link from "next/link";
import { JSX, Suspense } from "react";

interface SheetRow {
  [key: string]: string | number | boolean | null;
}

interface GoogleSheetsData {
  data: SheetRow[];
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    tab?: string;
  };
}

async function fetchSheetsData(
  page: number = 1,
  limit: number = 5,
  search?: string
): Promise<GoogleSheetsData> {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const url = `https://script.google.com/macros/s/${process.env.GOOGLE_APP_SCRIPT_ID}/exec?action=dashboard&page=${page}&limit=${limit}${searchParam}`;

    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data: GoogleSheetsData = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch Google Sheets data:", error);
    return {
      data: [],
      totalRecords: 0,
      page: 1,
      limit: 5,
      totalPages: 0,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

function generatePaginationItems(
  currentPage: number,
  totalPages: number,
  searchParams: URLSearchParams
) {
  const items: JSX.Element[] = [];
  const maxVisible = 5;

  // Previous button
  items.push(
    <PaginationItem key="prev">
      <PaginationPrevious
        href={
          currentPage > 1
            ? `?${new URLSearchParams({
                ...Object.fromEntries(searchParams),
                page: (currentPage - 1).toString(),
              })}`
            : "#"
        }
        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:text-black"}
      />
    </PaginationItem>
  );

  // Page numbers
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href={`?${new URLSearchParams({
            ...Object.fromEntries(searchParams),
            page: "1",
          })}`}
          className="hover:text-black"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    if (startPage > 2) {
      items.push(<PaginationEllipsis key="ellipsis1" />);
    }
  }

  for (let page = startPage; page <= endPage; page++) {
    items.push(
      <PaginationItem key={page}>
        <PaginationLink
          href={`?${new URLSearchParams({
            ...Object.fromEntries(searchParams),
            page: page.toString(),
          })}`}
          isActive={page === currentPage}
          className="hover:text-black"
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      items.push(<PaginationEllipsis key="ellipsis2" />);
    }
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          href={`?${new URLSearchParams({
            ...Object.fromEntries(searchParams),
            page: totalPages.toString(),
          })}`}
          className="hover:text-black"
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }

  // Next button
  items.push(
    <PaginationItem key="next">
      <PaginationNext
        href={
          currentPage < totalPages
            ? `?${new URLSearchParams({
                ...Object.fromEntries(searchParams),
                page: (currentPage + 1).toString(),
              })}`
            : "#"
        }
        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:text-black"}
      />
    </PaginationItem>
  );

  return items;
}

function getFieldIcon(fieldName: string) {
  const name = fieldName.toLowerCase();
  if (name.includes('date') || name.includes('time') || name.includes('created') || name.includes('updated')) {
    return Calendar;
  }
  if (name.includes('id') || name.includes('number') || name.includes('count')) {
    return Hash;
  }
  if (name.includes('name') || name.includes('title') || name.includes('text') || name.includes('description')) {
    return FileText;
  }
  return Info;
}

function DataDetailPopover({ row, index }: { row: SheetRow; index: number }) {
  const entries = Object.entries(row);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 bg-gray-900 border-gray-800 text-white" 
        align="end"
        side="left"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-400" />
              Record #{index + 1}
            </h3>
            <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {entries.length} fields
            </div>
          </div>
          
          {/* Data Fields */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {entries.map(([key, value]) => {
              const IconComponent = getFieldIcon(key);
              const displayValue = value?.toString() || "—";
              
              return (
                <div 
                  key={key} 
                  className="flex flex-col space-y-2 p-3 bg-gray-800/50 rounded-lg border border-gray-800"
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="pl-6">
                    <div className={`text-sm break-words ${
                      displayValue === "—" 
                        ? "text-gray-500 italic" 
                        : "text-white"
                    }`}>
                      {displayValue}
                    </div>
                    {displayValue !== "—" && displayValue.length > 50 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {displayValue.length} characters
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-800 pt-3">
            <div className="text-xs text-gray-400 text-center">
              Click outside to close
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DataCardSkeleton() {
  return (
    <div className="border border-gray-800 bg-gray-900/20 p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-1">
              <Skeleton className="h-3 w-20 bg-gray-800" />
              <Skeleton className="h-4 w-32 bg-gray-700" />
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-3 ml-6">
          <Skeleton className="h-5 w-16 bg-gray-800" />
          <Skeleton className="h-8 w-8 bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

function DataSkeletonLoader() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, idx) => (
        <DataCardSkeleton key={idx} />
      ))}
      
      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-8">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-20 bg-gray-800" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-10 bg-gray-800" />
          ))}
          <Skeleton className="h-10 w-20 bg-gray-800" />
        </div>
      </div>
      
      {/* Results Info Skeleton */}
      <div className="text-center mt-6">
        <Skeleton className="h-4 w-64 mx-auto bg-gray-800" />
      </div>
    </div>
  );
}

async function DataContent({ 
  page, 
  limit, 
  search, 
  urlSearchParams 
}: { 
  page: number; 
  limit: number; 
  search?: string; 
  urlSearchParams: URLSearchParams;
}) {
  const sheetsData = await fetchSheetsData(page, limit, search);
  const hasData = sheetsData.data && sheetsData.data.length > 0;
  const columns = hasData ? Object.keys(sheetsData.data[0]) : [];

  if (sheetsData.error) {
    return (
      <div className="border border-red-800 bg-red-900/20 p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Connection Error
        </h3>
        <p className="text-red-300">{sheetsData.error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 bg-transparent border-red-800 text-red-400 hover:text-white hover:bg-red-800 hover:border-red-700"
          asChild
        >
          <Link href="?">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Link>
        </Button>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Data Available
        </h3>
        <p className="text-gray-400">
          No records found in the connected Google Sheet.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Data Cards */}
      <div className="space-y-4">
        {sheetsData.data.map((row, idx) => {
          const displayColumns = columns.slice(0, 4);
          const remainingCount = Math.max(0, columns.length - 4);
          
          return (
            <div
              key={idx}
              className="border border-gray-800 bg-gray-900/20 p-6 hover:bg-gray-900/40 transition-colors rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayColumns.map((column) => (
                    <div key={column} className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        {column.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-white truncate">
                        {row[column]?.toString() || "—"}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center space-x-3 ml-6">
                  {remainingCount > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      +{remainingCount} more
                    </span>
                  )}
                  <DataDetailPopover row={row} index={(page - 1) * limit + idx} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {sheetsData.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {generatePaginationItems(
              sheetsData.page,
              sheetsData.totalPages,
              urlSearchParams
            )}
          </PaginationContent>
        </Pagination>
      )}

      {/* Results Info */}
      <div className="text-center text-sm text-gray-400">
        Showing{" "}
        {((sheetsData.page - 1) * limit) + 1} to{" "}
        {Math.min(sheetsData.page * limit, sheetsData.totalRecords)} of{" "}
        {sheetsData.totalRecords.toLocaleString()} records
      </div>
    </>
  );
}

export default async function GoogleSheetsDashboard({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1", 10);
  const limit = parseInt(searchParams.limit || "5", 10);
  const search = searchParams.search;
  const activeTab = searchParams.tab || "data";

  // Only fetch basic stats data immediately
  const sheetsData = await fetchSheetsData(page, limit, search);

  const urlSearchParams = new URLSearchParams();
  if (searchParams.page) urlSearchParams.set("page", searchParams.page);
  if (searchParams.limit) urlSearchParams.set("limit", searchParams.limit);
  if (searchParams.search) urlSearchParams.set("search", searchParams.search);
  if (searchParams.tab) urlSearchParams.set("tab", searchParams.tab);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-800" />
              <span className="text-2xl font-bold text-white">
                Global Data Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-800 text-gray-400 hover:text-black hover:bg-white hover:border-white"
                asChild
              >
                <Link
                  href={`?${new URLSearchParams({
                    ...Object.fromEntries(urlSearchParams),
                    r: Date.now().toString(),
                  })}`}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Google Sheets Integration
          </h1>
          <p className="text-gray-400">
            Real-time data synchronization and management from Google Sheets
          </p>
        </div>

        {/* Stats Cards - Always show, even during loading */}
        {!sheetsData.error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Records</p>
                  <p className="text-2xl font-bold text-white">
                    {sheetsData.totalRecords.toLocaleString()}
                  </p>
                </div>
                <Database className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Current Page</p>
                  <p className="text-2xl font-bold text-white">
                    {sheetsData.page}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Pages</p>
                  <p className="text-2xl font-bold text-white">
                    {sheetsData.totalPages}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Records/Page</p>
                  <p className="text-2xl font-bold text-white">{limit}</p>
                </div>
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-gray-900 border-gray-800">
              <TabsTrigger value="data" asChild>
                <Link
                  href={`?${new URLSearchParams({
                    ...Object.fromEntries(urlSearchParams),
                    tab: "data",
                  })}`}
                  className="data-[state=active]:text-black"
                >
                  Data View
                </Link>
              </TabsTrigger>
              <TabsTrigger value="analytics" asChild>
                <Link
                  href={`?${new URLSearchParams({
                    ...Object.fromEntries(urlSearchParams),
                    tab: "analytics",
                  })}`}
                  className="data-[state=active]:text-black"
                >
                  Analytics
                </Link>
              </TabsTrigger>
            </TabsList>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <form method="GET">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search records..."
                    defaultValue={search}
                    className="pl-10 pr-4 py-2 w-64 bg-gray-900 border border-gray-800 text-white placeholder-gray-400 focus:border-white focus:outline-none rounded"
                  />
                  {searchParams.tab && (
                    <input type="hidden" name="tab" value={searchParams.tab} />
                  )}
                  {searchParams.limit && (
                    <input type="hidden" name="limit" value={searchParams.limit} />
                  )}
                </form>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-800 text-gray-400 hover:text-black hover:bg-white hover:border-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="data" className="space-y-6">
            <Suspense fallback={<DataSkeletonLoader />}>
              <DataContent 
                page={page} 
                limit={limit} 
                search={search} 
                urlSearchParams={urlSearchParams}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="border border-gray-800 p-12 text-center bg-gray-900/20">
              <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-gray-400">
                Advanced analytics and insights coming soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}