import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { X, Loader2, Plus } from "lucide-react";
import { useCreateTask } from "@/features/tasks/tasks.hooks";
import {
  useEmployees,
  useManagerEmployees,
} from "@/features/employees/employees.hooks";
import type { TaskPriority } from "@/api/user.api";
import type { RootState } from "@/store/store";

interface FormValues {
  title: string;
  description: string;
  employeeId: string;
  priority: TaskPriority;
  dueDate: string;
}

const CreateTaskModal = ({ onClose }: { onClose: () => void }) => {
  const createTask = useCreateTask();
  const role = useSelector((state: RootState) => state.auth.user?.role);

  const { data: managerEmployeesData } = useManagerEmployees(
    undefined,
    role === "Manager",
  );
  const { data: adminEmployees = [] } = useEmployees(role === "Admin");

  const employees =
    role === "Admin"
      ? adminEmployees.map((e) => ({
          id: e.id,
          fullName: e.fullName,
          position: e.position,
        }))
      : (managerEmployeesData?.data ?? []).map((e) => ({
          id: e.id,
          fullName: e.fullName,
          position: e.position,
        }));

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
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      employeeId: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createTask
      .mutateAsync({
        ...data,
        managerId: "",
      })
      .then(() => {
        onClose();
      });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create task"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!createTask.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Create Task
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Assign a new task to a team member
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createTask.isPending}
            aria-label="Close create task modal"
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
              htmlFor="create-task-title"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Title
            </label>
            <input
              id="create-task-title"
              type="text"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 2,
                  message: "Title must be at least 2 characters",
                },
              })}
              placeholder="e.g. Implement dashboard redesign"
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
              htmlFor="create-task-description"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="create-task-description"
              rows={3}
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 2,
                  message: "Description must be at least 2 characters",
                },
              })}
              placeholder="Describe the task details..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="create-task-employee"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Assign to Employee
            </label>
            <select
              id="create-task-employee"
              {...register("employeeId", {
                required: "Please select an employee",
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.fullName} — {emp.position || "No position"}
                </option>
              ))}
            </select>
            {errors.employeeId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.employeeId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="create-task-priority"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Priority
              </label>
              <select
                id="create-task-priority"
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
                htmlFor="create-task-dueDate"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Due Date
              </label>
              <input
                id="create-task-dueDate"
                type="date"
                min={todayStr}
                {...register("dueDate", {
                  required: "Due date is required",
                  validate: (value) => {
                    if (value <= todayStr) {
                      return "Due date must be after today";
                    }
                    return true;
                  },
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
              disabled={createTask.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {createTask.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
