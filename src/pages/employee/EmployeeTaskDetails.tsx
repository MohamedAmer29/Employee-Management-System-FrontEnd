import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  CalendarDays,
  User,
  Building2,
  Clock,
  CheckCircle2,
  CircleDot,
  AlertTriangle,
  FileText,
  Tag,
  UserCircle,
  Play,
  Loader2,
  Ban,
  ClockAlert,
} from "lucide-react";
import { useTask, useUpdateTaskStatus } from "@/features/tasks/tasks.hooks";
import type { TaskStatus, TaskPriority } from "@/api/user.api";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";

const getStatusConfig = (status: TaskStatus) => {
  switch (status) {
    case "TODO":
      return {
        label: "To Do",
        className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        icon: CircleDot,
      };
    case "IN_PROGRESS":
      return {
        label: "In Progress",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: Clock,
      };
    case "COMPLETED":
      return {
        label: "Done",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-red-500/10 text-red-600 dark:text-red-400",
        icon: Ban,
      };
    case "OVERDUE":
      return {
        label: "Overdue",
        className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        icon: ClockAlert,
      };
    default:
      return {
        label: status,
        className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
        icon: CircleDot,
      };
  }
};

const getPriorityConfig = (priority: TaskPriority) => {
  switch (priority) {
    case "HIGH":
      return {
        label: "High",
        className: "bg-red-500/10 text-red-600 dark:text-red-400",
        icon: AlertTriangle,
      };
    case "MEDIUM":
      return {
        label: "Medium",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: AlertTriangle,
      };
    case "LOW":
      return {
        label: "Low",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        icon: AlertTriangle,
      };
    default:
      return {
        label: priority,
        className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
        icon: AlertTriangle,
      };
  }
};

const EmployeeTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, isError, refetch } = useTask(id ?? "");
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateTaskStatus();

  const statusCfg = task ? getStatusConfig(task.status) : null;
  const priorityCfg = task ? getPriorityConfig(task.priority) : null;

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Loading task details"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load the task details.
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/tasks")}
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Back to tasks"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight truncate">
            {task.title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {statusCfg && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
              >
                <statusCfg.icon className="w-3 h-3" aria-hidden="true" />
                {statusCfg.label}
              </span>
            )}
            {priorityCfg && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityCfg.className}`}
              >
                <priorityCfg.icon className="w-3 h-3" aria-hidden="true" />
                {priorityCfg.label}
              </span>
            )}
          </div>
        </div>
        {task.status !== "COMPLETED" && (
          <button
            type="button"
            disabled={isStatusUpdating}
            onClick={() =>
              updateStatus({
                taskId: task.id,
                status: task.status === "TODO" ? "IN_PROGRESS" : "COMPLETED",
              })
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isStatusUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4" aria-hidden="true" />
            )}
            {task.status === "TODO" ? "Start Task" : "Mark Done"}
          </button>
        )}
      </div>

      {/* Details Card */}
      <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Description */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Description
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {task.description || "No description provided."}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/15 text-primary shrink-0">
                <Tag className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {statusCfg?.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Priority</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {priorityCfg?.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
                <CalendarDays className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDateInUserZone(task.dueDate, { dateOnly: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {task.department?.name ?? "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              {task.assignedEmployee ? (
                <Avatar
                  name={task.assignedEmployee.fullName}
                  src={getAssetUrl(task.assignedEmployee.profilePicture)}
                  size="sm"
                />
              ) : (
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-400 shrink-0">
                  <UserCircle className="w-5 h-5" aria-hidden="true" />
                </span>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Assigned Employee</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {task.assignedEmployee?.fullName ?? "—"}
                </p>
                {task.assignedEmployee && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {task.assignedEmployee.email} · {task.assignedEmployee.position}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 shrink-0">
                <User className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created By</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {task.createdBy?.fullName ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDateInUserZone(task.createdAt)}
                </p>
              </div>
            </div>
            {task.startedAt && (
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Started At</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatDateInUserZone(task.startedAt)}
                  </p>
                </div>
              </div>
            )}
            {task.completedAt && (
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed At</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatDateInUserZone(task.completedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTaskDetails;
