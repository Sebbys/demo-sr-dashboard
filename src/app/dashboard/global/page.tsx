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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Download,
  Search as SearchIcon,
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
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    tab?: string;
  }>;
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
      error: error instanceof Error ? error.message : "Unknown error occurred",
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
                ...Object.fromEntries(searchParams.entries()),
                page: (currentPage - 1).toString(),
              })}`
            : "#"
        }
        className={
          currentPage <= 1
            ? "pointer-events-none opacity-50"
            : "hover:text-black"
        }
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
            ...Object.fromEntries(searchParams.entries()),
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
            ...Object.fromEntries(searchParams.entries()),
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
            ...Object.fromEntries(searchParams.entries()),
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
                ...Object.fromEntries(searchParams.entries()),
                page: (currentPage + 1).toString(),
              })}`
            : "#"
        }
        className={
          currentPage >= totalPages
            ? "pointer-events-none opacity-50"
            : "hover:text-black"
        }
      />
    </PaginationItem>
  );

  return items;
}

function getFieldIcon(fieldName: string) {
  const name = fieldName.toLowerCase();
  if (
    name.includes("date") ||
    name.includes("time") ||
    name.includes("created") ||
    name.includes("updated")
  ) {
    return Calendar;
  }
  if (name.includes("id") || name.includes("number") || name.includes("count")) {
    return Hash;
  }
  if (
    name.includes("name") ||
    name.includes("title") ||
    name.includes("text") ||
    name.includes("description")
  ) {
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
                      {key
                        .replace(/_/g, " ")
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                    </span>
                  </div>
                  <div className="pl-6">
                    <div
                      className={`text-sm break-words ${
                        displayValue === "—"
                          ? "text-gray-500 italic"
                          : "text-white"
                      }`}
                    >
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
  urlSearchParams,
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
      <div className="border border-red-400 bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Connection Error
        </h3>
        <p className="text-red-700">{sheetsData.error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-red-600 text-red-600 hover:bg-red-100"
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
      <div className="text-center py-12 border border-dashed rounded-lg">
        <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Data Available
        </h3>
        <p className="text-muted-foreground">
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
              className="border border-border bg-card p-4 sm:p-6 hover:bg-muted/30 hover:border-primary/20 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md group"
            >
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {displayColumns.map((column) => (
                    <div key={column} className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {column
                          .replace(/_/g, " ")
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                      </p>
                      <p className="text-sm text-foreground font-medium truncate bg-muted/30 px-2 py-1 rounded-md">
                        {row[column]?.toString() || "—"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  {remainingCount > 0 && (
                    <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20 whitespace-nowrap">
                      +{remainingCount} more
                    </span>
                  )}
                  <DataDetailPopover
                    row={row}
                    index={(page - 1) * limit + idx}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {sheetsData.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {((sheetsData.page - 1) * limit) + 1} to {Math.min(sheetsData.page * limit, sheetsData.totalRecords)} of {sheetsData.totalRecords.toLocaleString()} records
          </div>
          <Pagination>
            <PaginationContent className="flex-wrap justify-center sm:justify-end">
              {generatePaginationItems(
                sheetsData.page,
                sheetsData.totalPages,
                urlSearchParams
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Results info when no pagination */}
      {sheetsData.totalPages <= 1 && sheetsData.data.length > 0 && (
        <div className="text-center pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {sheetsData.data.length} of {sheetsData.totalRecords.toLocaleString()} records
          </p>
        </div>
      )}
    </>
  );
}
// Synchronous access to searchParams

export default async function GoogleSheetsDashboard({searchParams,}: PageProps) {
  const filters = (await searchParams)
  const pageStr = filters.page ?? "1";
  const limitStr = filters.limit ?? "5";
  const search = filters.search; // may be undefined
  const activeTab = filters.tab ?? "data";
  const tabParam = filters.tab;
  const limitParam = filters.limit;

  const page = Number.isFinite(Number(pageStr))
    ? parseInt(pageStr, 10)
    : 1;
  const limit = Number.isFinite(Number(limitStr))
    ? parseInt(limitStr, 10)
    : 5;

  // Fetch stats up front
  const sheetsData = await fetchSheetsData(page, limit, search);

  // Build URLSearchParams safely
  const urlSearchParams = new URLSearchParams();
  if (filters.page) urlSearchParams.set("page", filters.page);
  if (filters.limit) urlSearchParams.set("limit", filters.limit);
  if (filters.search) urlSearchParams.set("search", filters.search);
  if (filters.tab) urlSearchParams.set("tab", filters.tab);

  return (
    <div className="new-container relative !border-none sm:!border-dashed bg-background">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="instrument-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Analytics Dashboard
          </h1>
          <p className="jetbrains-mono text-sm sm:text-base text-muted-foreground leading-relaxed">
            Real-time data synchronization and management from Google Sheets
          </p>
        </div>

        {/* Stats Cards - Always show, even during loading */}
        {!sheetsData.error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="border border-border p-4 sm:p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Records</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                    {sheetsData.totalRecords.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="border border-border p-4 sm:p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Current Page</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                    {sheetsData.page}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="border border-border p-4 sm:p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Pages</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                    {sheetsData.totalPages}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>
            <div className="border border-border p-4 sm:p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Records/Page</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{limit}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:flex">
              <TabsTrigger value="data" asChild>
                <Link
                  href={`?${new URLSearchParams({
                    ...Object.fromEntries(urlSearchParams.entries()),
                    tab: "data",
                  })}`}
                  className="text-sm"
                >
                  Data View
                </Link>
              </TabsTrigger>
              <TabsTrigger value="analytics" asChild>
                <Link
                  href={`?${new URLSearchParams({
                    ...Object.fromEntries(urlSearchParams.entries()),
                    tab: "analytics",
                  })}`}
                  className="text-sm"
                >
                  Analytics
                </Link>
              </TabsTrigger>
            </TabsList>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <form method="GET" className="w-full">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search records..."
                    defaultValue={search}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-card border border-border text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none rounded-lg transition-colors"
                  />
                  {tabParam && (
                    <input type="hidden" name="tab" value={tabParam} />
                  )}
                  {limitParam && (
                    <input type="hidden" name="limit" value={limitParam} />
                  )}
                </form>
              </div>

              <Button variant="outline" size="sm" className="bg-transparent hover:bg-muted/50 transition-colors whitespace-nowrap">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
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
            <div className="border border-dashed p-12 text-center bg-card rounded-lg">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-muted-foreground">
                Advanced analytics and insights coming soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}