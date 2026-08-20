import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Hourglass,
  FileText,
  Plus,
  Loader2,
  X,
  CalendarPlus,
  CalendarClock,
  CalendarCheck2,
} from "lucide-react";
import {
  useMyLeave,
  useCreateLeave,
} from "@/features/leave/leave.hooks";
import {
  DoughnutChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { formatDateInUserZone } from "@/utils/formatDate";
import Reveal from "@/components/common/Reveal";
import type { LeaveStatus } from "@/api/user.api";

interface LeaveRequestForm {
  reason: string;
  startDate: string;
  endDate: string;
}

const statusBadge: Record<LeaveStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
  cancelled: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

const getDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
};

const getTodayStr = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

const addDays = (dateStr: string, days: number) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

const minDate = addDays(getTodayStr(), 1);

const MyLeave = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useMyLeave();
  const createLeave = useCreateLeave();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<LeaveRequestForm>({
    mode: "onBlur",
  });

  const startDate = watch("startDate");

  const onSubmit = async (data: LeaveRequestForm) => {
    try {
      await createLeave.mutateAsync(data);
      reset();
      setIsModalOpen(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total: requests.length, pending, approved, rejected };
  }, [requests]);

  const statusChartItems: ChartItem[] = useMemo(
    () => [
      { label: "Pending", value: stats.pending, color: "#F59E0B" },
      { label: "Approved", value: stats.approved, color: "#10B981" },
      { label: "Rejected", value: stats.rejected, color: "#EF4444" },
    ],
    [stats],
  );

  const totalDays = useMemo(
    () =>
      requests.reduce(
        (sum, request) => sum + getDays(request.startDate, request.endDate),
        0,
      ),
    [requests],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Reveal y={20}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              My Leave
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Request time off and track your leave requests
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Leave Request
          </button>
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary shrink-0">
            <CalendarDays className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.total} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total requests
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
            <Hourglass className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.pending} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.approved} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Approved
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
            <XCircle className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.rejected} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Rejected
            </p>
          </div>
        </div>
      </Reveal>

      {/* Charts */}
      <Reveal y={20} delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard title="Leave Status Breakdown" items={statusChartItems} />
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Leave Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
              <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                <CalendarClock className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  <AnimatedNumber value={totalDays} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Days requested
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
              <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
                <CalendarCheck2 className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {requests.length > 0
                    ? Math.round(
                        (stats.approved / requests.length) * 100,
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Approval rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Leave requests table */}
      <Reveal y={20} delay={0.15}>
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            My Leave Requests
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {requests.length} request{requests.length === 1 ? "" : "s"}
          </span>
        </div>
        {isLoading ? (
          <div
            className="flex items-center justify-center py-16"
            role="status"
            aria-label="Loading leave requests"
          >
            <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load your leave requests
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No leave requests found.
            </p>
          </div>
        ) : (
          <div className="table-scrollbar max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[640px]">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-start gap-2">
                        <FileText
                          className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[220px] truncate block">
                          {request.reason || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDateInUserZone(request.startDate, {
                          dateOnly: true,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDateInUserZone(request.endDate, {
                          dateOnly: true,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {getDays(request.startDate, request.endDate)} day
                        {getDays(request.startDate, request.endDate) === 1
                          ? ""
                          : "s"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[request.status]}`}
                      >
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </Reveal>

      {/* New leave request modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="New leave request"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!createLeave.isPending) setIsModalOpen(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  New Leave Request
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Leave dates must be after today
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={createLeave.isPending}
                aria-label="Close new leave request modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 grid grid-cols-1 gap-5"
            >
              <div>
                <label
                  htmlFor="leave-reason"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Reason
                </label>
                <textarea
                  id="leave-reason"
                  rows={3}
                  placeholder="e.g. Annual vacation, family event, medical appointment"
                  {...register("reason", {
                    required: "Reason is required",
                    minLength: {
                      value: 3,
                      message: "Reason must be at least 3 characters",
                    },
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.reason && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.reason.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="leave-startDate"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Start Date
                  </label>
                  <input
                    id="leave-startDate"
                    type="date"
                    min={minDate}
                    placeholder="Select start date"
                    {...register("startDate", {
                      required: "Start date is required",
                      validate: (value) =>
                        value >= minDate ||
                        "Start date must be after today",
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="leave-endDate"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    End Date
                  </label>
                  <input
                    id="leave-endDate"
                    type="date"
                    min={startDate || minDate}
                    placeholder="Select end date"
                    {...register("endDate", {
                      required: "End date is required",
                      validate: (value) => {
                        if (value < minDate) {
                          return "End date must be after today";
                        }
                        if (startDate && value < startDate) {
                          return "End date must be on or after the start date";
                        }
                        return true;
                      },
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createLeave.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLeave.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {createLeave.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeave;
