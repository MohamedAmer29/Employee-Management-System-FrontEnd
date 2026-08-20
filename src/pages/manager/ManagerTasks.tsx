import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListTodo,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Filter,
  CircleDot,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ClockAlert,
  Play,
  Loader2,
} from "lucide-react";
import { useTasks, useUpdateTaskStatus } from "@/features/tasks/tasks.hooks";
import type { TaskStatus, TaskPriority } from "@/api/user.api";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { formatDateInUserZone } from "@/utils/formatDate";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import Reveal from "@/components/common/Reveal";

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "OVERDUE", label: "Overdue" },
];

const priorityOptions: { value: string; label: string }[] = [
  { value: "", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

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
      };
    case "MEDIUM":
      return {
        label: "Medium",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      };
    case "LOW":
      return {
        label: "Low",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      };
    default:
      return {
        label: priority,
        className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      };
  }
};

const ManagerTasks = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      status: (statusFilter || undefined) as TaskStatus | undefined,
      priority: (priorityFilter || undefined) as TaskPriority | undefined,
    }),
    [page, limit, debouncedSearch, statusFilter, priorityFilter],
  );

  const { data, isLoading, isError, refetch } = useTasks(params);
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateTaskStatus();

  const tasks = data?.data ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const stats = useMemo(() => {
    if (!data) return { total: 0, todo: 0, inProgress: 0, done: 0 };
    const all = data.data;
    return {
      total: data.pagination.total,
      todo: all.filter((t) => t.status === "TODO").length,
      inProgress: all.filter((t) => t.status === "IN_PROGRESS").length,
      done: all.filter((t) => t.status === "COMPLETED").length,
    };
  }, [data]);

  const startIndex = (page - 1) * limit + 1;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load the tasks.
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
      <Reveal y={20}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Tasks
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and track team tasks
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Create Task
        </button>
      </div>
      </Reveal>

      {/* Stats */}
      <Reveal>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
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
            ))
          : <>
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
            </>
        }
      </div>
      </Reveal>

      {/* Filters */}
      <Reveal>
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <AlertTriangle
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="table-scrollbar max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {["Title", "Assigned To", "Department", "Priority", "Status", "Due Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <span className="block h-4 rounded bg-gray-200 dark:bg-white/10" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-12 text-center">
          <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tasks found.
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Rows per page:
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="table-scrollbar max-h-[65vh] overflow-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tasks.map((task) => {
                    const statusCfg = getStatusConfig(task.status);
                    const priorityCfg = getPriorityConfig(task.priority);
                    const StatusIcon = statusCfg.icon;
                    return (
                      <tr
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
                        className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-primary/5 dark:focus-visible:bg-white/5"
                      >
                        <td className="px-6 py-4 align-middle">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:underline">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[250px]">
                            {task.description || "No description"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {task.assignedEmployee?.fullName || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                            {task.department?.name ?? "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityCfg.className}`}
                          >
                            {priorityCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
                          >
                            <StatusIcon className="w-3 h-3" aria-hidden="true" />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                            {formatDateInUserZone(task.dueDate, {
                              dateOnly: true,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
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
                                {task.status === "TODO" ? "Start" : "Done"}
                              </button>
                            )}
                            {task.status !== "CANCELLED" && task.status !== "COMPLETED" && (
                              <button
                                type="button"
                                disabled={isStatusUpdating}
                                onClick={() =>
                                  updateStatus({ taskId: task.id, status: "CANCELLED" })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              >
                                {isStatusUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                                ) : (
                                  <Ban className="w-3 h-3" aria-hidden="true" />
                                )}
                                Cancel
                              </button>
                            )}
                            {task.status !== "OVERDUE" && task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                              <button
                                type="button"
                                disabled={isStatusUpdating}
                                onClick={() =>
                                  updateStatus({ taskId: task.id, status: "OVERDUE" })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                              >
                                {isStatusUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                                ) : (
                                  <ClockAlert className="w-3 h-3" aria-hidden="true" />
                                )}
                                Overdue
                              </button>
                            )}
                            {(task.status === "COMPLETED" || task.status === "CANCELLED" || task.status === "OVERDUE") && (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
                              >
                                <StatusIcon className="w-3 h-3" aria-hidden="true" />
                                {statusCfg.label}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex}–
              {Math.min(page * limit, total)} of {total} tasks
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}

      {isCreateOpen && (
        <CreateTaskModal onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
};

export default ManagerTasks;
