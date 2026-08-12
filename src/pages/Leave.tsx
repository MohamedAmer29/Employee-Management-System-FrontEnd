import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  FileText,
  Check,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { useLeaveRequests, useApproveLeave, useRejectLeave } from "@/features/leave/leave.hooks";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";
import type { LeaveStatus } from "@/api/user.api";

const statusOptions: { value: LeaveStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const statusBadge: Record<LeaveStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
  cancelled: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

const statusIcon: Record<LeaveStatus, typeof Clock> = {
  pending: Hourglass,
  approved: CheckCircle2,
  rejected: XCircle,
  cancelled: Clock,
};

const getDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
};

const Leave = () => {
  const [filter, setFilter] = useState<LeaveStatus | "all">("all");
  const navigate = useNavigate();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const [rejectTarget, setRejectTarget] = useState<{
    id: string;
    fullName: string;
  } | null>(null);
  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useLeaveRequests();

  const handleApprove = async (leaveId: number) => {
    try {
      await approveLeave.mutateAsync(String(leaveId));
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await rejectLeave.mutateAsync(rejectTarget.id);
      setRejectTarget(null);
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

  const filteredRequests = useMemo(
    () =>
      filter === "all"
        ? requests
        : requests.filter((request) => request.status === filter),
    [requests, filter],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Leave Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View employee leave requests
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            refetch();
            toast.success("Leave requests refreshed successfully");
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <CalendarDays className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.total}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total requests
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Hourglass className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.pending}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.approved}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Approved
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400">
            <XCircle className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.rejected}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Rejected
            </p>
          </div>
        </div>
      </div>

      {/* Leave requests table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Leave Requests
          </h2>
          <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 p-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  filter === option.value
                    ? "bg-white dark:bg-dark-surface text-primary shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
              Failed to load leave requests
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
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No leave requests found.
            </p>
          </div>
        ) : (
          <div className="table-scrollbar max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[760px]">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
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
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredRequests.map((request) => {
                  const StatusIcon = statusIcon[request.status];
                  return (
                    <tr
                      key={request.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/leave/${request.employee.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/leave/${request.employee.id}`);
                        }
                      }}
                      className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-primary/5 dark:focus-visible:bg-white/5"
                    >
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={request.employee.fullName}
                            src={getAssetUrl(request.employee.profilePicture)}
                            size="md"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {request.employee.fullName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {request.employee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[220px] truncate block">
                            {request.reason || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDateInUserZone(request.startDate, { dateOnly: true })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDateInUserZone(request.endDate, { dateOnly: true })}
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
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[request.status]}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(request.id);
                            }}
                            disabled={
                              approveLeave.isPending ||
                              request.status !== "pending"
                            }
                            title="Approve leave request"
                            aria-label={`Approve ${request.employee.fullName}'s leave request`}
                            className="flex items-center justify-center h-9 w-9 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            <Check className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRejectTarget({
                                id: String(request.id),
                                fullName: request.employee.fullName,
                              });
                            }}
                            disabled={
                              rejectLeave.isPending ||
                              request.status !== "pending"
                            }
                            title="Reject leave request"
                            aria-label={`Reject ${request.employee.fullName}'s leave request`}
                            className="flex items-center justify-center h-9 w-9 rounded-lg text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reject leave request"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!rejectLeave.isPending) setRejectTarget(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
                <Trash2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Reject this leave request?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                You are about to reject the leave request from{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {rejectTarget.fullName}
                </span>
                .
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  disabled={rejectLeave.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={rejectLeave.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {rejectLeave.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Sure
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;