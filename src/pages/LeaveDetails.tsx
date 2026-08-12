import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  RefreshCw,
  Check,
  X,
  FileText,
  CheckCircle2,
  XCircle,
  Hourglass,
  Clock,
  Loader2,
} from "lucide-react";
import {
  useLeaveByEmployee,
  useApproveLeave,
  useRejectLeave,
} from "@/features/leave/leave.hooks";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";
import type { LeaveStatus } from "@/api/user.api";

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

const LeaveDetails = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useLeaveByEmployee(employeeId);
  const [rejectTarget, setRejectTarget] = useState<{
    id: string;
    fullName: string;
  } | null>(null);

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await rejectLeave.mutateAsync(rejectTarget.id);
      setRejectTarget(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  const employee = requests[0]?.employee ?? null;

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total: requests.length, pending, approved, rejected };
  }, [requests]);

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Loading leave details"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || requests.length === 0) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load the leave details.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={employee?.fullName}
            src={getAssetUrl(employee?.profilePicture)}
            size="lg"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              {employee?.fullName ?? "Employee"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Leave details · {employee?.email ?? ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/leave")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Leave
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

      {/* Requests */}
      {requests.map((request) => {
        const StatusIcon = statusIcon[request.status];
        return (
          <div
            key={request.id}
            className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[request.status]}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  {request.status}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  #{request.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (request.status === "pending") {
                      approveLeave.mutate(String(request.id));
                    } else {
                      toast.info("This request has already been resolved");
                    }
                  }}
                  disabled={approveLeave.isPending || request.status !== "pending"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {approveLeave.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  )}
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRejectTarget({
                      id: String(request.id),
                      fullName: request.employee.fullName,
                    })
                  }
                  disabled={rejectLeave.isPending || request.status !== "pending"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800/60 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  Reject
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Reason
                </p>
                <p className="flex items-start gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                  {request.reason || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Start Date
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDateInUserZone(request.startDate, { dateOnly: true })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  End Date
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDateInUserZone(request.endDate, { dateOnly: true })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Duration
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {getDays(request.startDate, request.endDate)} day
                  {getDays(request.startDate, request.endDate) === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        );
      })}

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
                <X className="w-8 h-8" aria-hidden="true" />
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

export default LeaveDetails;