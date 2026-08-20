import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  RefreshCw,
  Pencil,
  Trash2,
  CalendarDays,
  User,
  Building2,
  Clock,
  CheckCircle2,
  CircleDot,
  AlertTriangle,
  Loader2,
  X,
  FileText,
  Tag,
  UserCircle,
  Play,
  Ban,
  ClockAlert,
} from "lucide-react";
import { useTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from "@/features/tasks/tasks.hooks";
import type { TaskStatus, TaskPriority, UpdateTaskRequest } from "@/api/user.api";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";
import Reveal from "@/components/common/Reveal";

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

const ManagerTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, isError, refetch } = useTask(id ?? "");
  const deleteTask = useDeleteTask();
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateTaskStatus();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
      <Reveal y={20}>
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
        <div className="flex items-center gap-2">
          {task.status !== "COMPLETED" && task.status !== "CANCELLED" && task.status !== "OVERDUE" && (
            <button
              type="button"
              disabled={isStatusUpdating}
              onClick={() =>
                updateStatus({
                  taskId: task.id,
                  status: task.status === "TODO" ? "IN_PROGRESS" : "COMPLETED",
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isStatusUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Play className="w-4 h-4" aria-hidden="true" />
              )}
              {task.status === "TODO" ? "Start" : "Mark Done"}
            </button>
          )}
          {task.status !== "CANCELLED" && task.status !== "COMPLETED" && (
            <button
              type="button"
              disabled={isStatusUpdating}
              onClick={() =>
                updateStatus({
                  taskId: task.id,
                  status: "CANCELLED",
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {isStatusUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Ban className="w-4 h-4" aria-hidden="true" />
              )}
              Cancel
            </button>
          )}
          {task.status !== "OVERDUE" && task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
            <button
              type="button"
              disabled={isStatusUpdating}
              onClick={() =>
                updateStatus({
                  taskId: task.id,
                  status: "OVERDUE",
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {isStatusUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <ClockAlert className="w-4 h-4" aria-hidden="true" />
              )}
              Overdue
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            title="Edit task"
            aria-label="Edit task"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            title="Delete task"
            aria-label="Delete task"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
      </Reveal>

      {/* Details Card */}
      <Reveal>
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
      </Reveal>

      {/* Edit Modal */}
      {isEditOpen && (
        <EditTaskModal
          task={task}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete task"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleteTask.isPending) setIsDeleteOpen(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
                <Trash2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Delete this task?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {task.title}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={deleteTask.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTask.mutateAsync(task.id).then(() => {
                      navigate("/tasks");
                    });
                  }}
                  disabled={deleteTask.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {deleteTask.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
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

const EditTaskModal = ({
  task,
  onClose,
}: {
  task: NonNullable<ReturnType<typeof useTask>["data"]>;
  onClose: () => void;
}) => {
  const updateTask = useUpdateTask();

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateTaskRequest>({
    mode: "onBlur",
    defaultValues: {
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
    },
  });

  const onSubmit = (data: UpdateTaskRequest) => {
    updateTask.mutateAsync({ taskId: task.id, data }).then(() => {
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit task"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!updateTask.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            Edit Task
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={updateTask.isPending}
            aria-label="Close edit task modal"
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
              htmlFor="edit-task-title"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Title
            </label>
            <input
              id="edit-task-title"
              type="text"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 2,
                  message: "Title must be at least 2 characters",
                },
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-task-description"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="edit-task-description"
              rows={3}
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 2,
                  message: "Description must be at least 2 characters",
                },
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-task-priority"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Priority
              </label>
              <select
                id="edit-task-priority"
                {...register("priority", {
                  required: "Priority is required",
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-task-dueDate"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Due Date
              </label>
              <input
                id="edit-task-dueDate"
                type="date"
                min={todayStr}
                {...register("dueDate", {
                  required: "Due date is required",
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateTask.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTask.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {updateTask.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerTaskDetails;
