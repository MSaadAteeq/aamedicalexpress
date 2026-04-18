import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, Download, Search, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { createRideEventStream } from "@/lib/realtime";
import { useAuth } from "@/context/AuthContext";
import AdminTripHistoryAccordion from "@/components/rides/AdminTripHistoryAccordion";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
];
const PAGE_LIMIT = 20;

export default function AdminTripHistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, token, user } = useAuth();
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAuthLoading && isAuthenticated && user?.role !== "admin") {
      navigate("/trip-history", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, user?.role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadHistory = useCallback(
    async ({ page = 1, append = false } = {}) => {
      if (!isAuthenticated || user?.role !== "admin") return;

      const params = {
        page,
        limit: PAGE_LIMIT,
        status: filters.status || undefined,
        search: debouncedSearch || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const response = await api.get("/rides/admin/history", { params });
        const incomingRides = response.data.rides || [];
        setRides((prev) => (append ? [...prev, ...incomingRides] : incomingRides));
        setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0, hasMore: false });
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load admin trip history.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearch, filters.endDate, filters.startDate, filters.status, isAuthenticated, user?.role]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHistory({ page: 1, append: false });
    }, 0);
    return () => clearTimeout(timer);
  }, [loadHistory]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin" || !token) return undefined;

    const stream = createRideEventStream(token);
    if (!stream) return undefined;

    const onRideEvent = () => {
      void loadHistory({ page: 1, append: false });
    };

    stream.addEventListener("ride_created", onRideEvent);
    stream.addEventListener("ride_updated", onRideEvent);

    return () => {
      stream.removeEventListener("ride_created", onRideEvent);
      stream.removeEventListener("ride_updated", onRideEvent);
      stream.close();
    };
  }, [isAuthenticated, loadHistory, token, user?.role]);

  useEffect(() => {
    if (!loadMoreRef.current) return undefined;
    if (isLoading || isLoadingMore || !pagination.hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        void loadHistory({ page: pagination.page + 1, append: true });
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, loadHistory, pagination.hasMore, pagination.page]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const response = await api.get("/rides/admin/history/export", {
        params: {
          status: filters.status || undefined,
          search: debouncedSearch || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `dispatch-history-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("CSV export downloaded.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const summaryText = useMemo(() => {
    if (!pagination.total) return "No rides found with current filters.";
    return `${pagination.total} total rides • Page ${pagination.page} of ${pagination.totalPages}`;
  }, [pagination.page, pagination.total, pagination.totalPages]);

  if (isAuthLoading || (!isAuthenticated && !isAuthLoading)) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-600">Loading admin history...</div>;
  }

  if (user?.role !== "admin") return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-indigo-900/70 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-blue-50">
          <ShieldCheck size={14} />
          Admin History Console
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">All Users Trip History</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-base">
          This view includes every ride in the system with rider identity and contact details for dispatch follow-up.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-100">
          <Clock3 size={13} />
          Most recent rides are shown first
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Input
              id="admin-search"
              label="Search Trips / Notes / Location"
              placeholder="Search by location, notes, or user id..."
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
          </div>
          <Select
            id="admin-status"
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          />
          <Input
            id="admin-start-date"
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
          />
          <Input
            id="admin-end-date"
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="inline-flex items-center gap-2 text-sm text-slate-700">
            <Search size={14} />
            {summaryText}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700"
              onClick={handleExportCsv}
              isLoading={isExporting}
            >
              <Download size={14} />
              Export CSV
            </Button>
            <Button
              type="button"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setFilters({ search: "", status: "", startDate: "", endDate: "" })}
            >
              <CalendarDays size={14} />
              Clear Filters
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-600">Loading system trip history...</p>
        ) : (
          <>
            <AdminTripHistoryAccordion rides={rides} />

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Infinite scroll is enabled. More records load automatically as you reach the bottom.
              </p>
              {pagination.hasMore ? (
                <Button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  isLoading={isLoadingMore}
                  onClick={() => loadHistory({ page: pagination.page + 1, append: true })}
                >
                  Load More
                </Button>
              ) : (
                <span className="text-xs text-slate-500">End of results</span>
              )}
            </div>
            <div ref={loadMoreRef} className="h-1 w-full" />
          </>
        )}
      </section>
    </div>
  );
}
