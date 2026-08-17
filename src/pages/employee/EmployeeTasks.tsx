import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListTodo,
  RefreshCw,
  CalendarDays,
  CircleDot,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  FileText,
  Play,
  Loader2,
  Ban,
  ClockAlert,
} from "lucide-react";
import { useMyTasks, useUpdateTaskStatus } from "@/features/tasks/tasks.hooks";
import type { Task, TaskStatus, TaskPriority } from "@/api/user.api";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import {
  DoughnutChartCard,
  BarChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
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

const isOverdue = (task: Task) => {
  if (task.status === "COMPLETED") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
};

const EmployeeTasks = () => {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading, isError, refetch } = useMyTasks();
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateTaskStatus();

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const done = tasks.filter((t) => t.status === "COMPLETED").length;
    const overdue = tasks.filter(isOverdue).length;
    return { total, todo, inProgress, done, overdue };
  }, [tasks]);

  const statusChartItems: ChartItem[] = useMemo(
    () => [
      { label: "To Do", value: stats.todo, color: "#0EA5E9" },
      { label: "In Progress", value: stats.inProgress, color: "#F59E0B" },
      { label: "Done", value: stats.done, color: "#10B981" },
    ],
    [stats],
  );

  const priorityChartItems: ChartItem[] = useMemo(
    () => [
      { label: "High", value: tasks.filter((t) => t.priority === "HIGH").length, color: "#EF4444" },
      { label: "Medium", value: tasks.filter((t) => t.priority === "MEDIUM").length, color: "#F59E0B" },
      { label: "Low", value: tasks.filter((t) => t.priority === "LOW").length, color: "#10B981" },
    ],
    [tasks],
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your assigned tasks
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4 animate-pulse"
            >
              <span className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-white/10 shrink-0" />
              <div className="space-y-2">
                <span className="block h-7 w-12 rounded bg-gray-200 dark:bg-white/10" />
                <span className="block h-3 w-16 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm h-[300px] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load your tasks.
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
          My Tasks
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track and manage your assigned tasks
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <ListTodo className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.total} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <CircleDot className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.todo} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              To Do
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.inProgress} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              In Progress
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.done} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Done
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard title="Status Distribution" items={statusChartItems} />
        <BarChartCard title="Priority Breakdown" items={priorityChartItems} />
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-5 flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-300">
              {stats.overdue} overdue task{stats.overdue === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">
              You have tasks past their due date that need attention.
            </p>
          </div>
        </div>
      )}

      {/* Task Cards */}
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-12 text-center">
          <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tasks assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const statusCfg = getStatusConfig(task.status);
            const priorityCfg = getPriorityConfig(task.priority);
            const overdue = isOverdue(task);
            return (
              <div
                key={task.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/tasks/${task.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/tasks/${task.id}`);
                  }
                }}
                className={`rounded-2xl bg-white dark:bg-dark-surface border shadow-sm p-5 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  overdue
                    ? "border-red-300 dark:border-red-900/60"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
                    {task.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${priorityCfg.className}`}
                  >
                    {priorityCfg.label}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {task.description || "No description"}
                </p>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
                  >
                    <statusCfg.icon className="w-3 h-3" aria-hidden="true" />
                    {statusCfg.label}
                  </span>
                  {overdue && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      Overdue
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {(task.status === "TODO" || task.status === "IN_PROGRESS") && (
                    <button
                      type="button"
                      disabled={isStatusUpdating}
                      onClick={() =>
                        updateStatus({
                          taskId: task.id,
                          status: task.status === "TODO" ? "IN_PROGRESS" : "COMPLETED",
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {isStatusUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <Play className="w-3 h-3" aria-hidden="true" />
                      )}
                      {task.status === "TODO" ? "Start" : "Mark Done"}
                    </button>
                  )}
                  {(task.status === "COMPLETED" || task.status === "CANCELLED" || task.status === "OVERDUE") && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
                    >
                      <statusCfg.icon className="w-3 h-3" aria-hidden="true" />
                      {statusCfg.label}
                    </span>
                  )}
                </div>

                <div className="mt-auto rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                      Due date
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {formatDateInUserZone(task.dueDate, { dateOnly: true })}
                    </span>
                  </div>
                  {task.department && (
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Department
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                        {task.department.name}
                      </span>
                    </div>
                  )}
                  {task.assignedEmployee && (
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-3.5 h-3.5" aria-hidden="true" />
                        Assigned by
                      </span>
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {task.createdBy?.fullName || "—"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      Created
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {formatDateInUserZone(task.createdAt, { dateOnly: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
