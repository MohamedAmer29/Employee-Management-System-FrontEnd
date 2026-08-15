import { useForm } from "react-hook-form";
import { X, Loader2, Save } from "lucide-react";
import { useCreateManagerEmployee } from "@/features/employees/employees.hooks";

interface FormValues {
  email: string;
  position: string;
}

const AddEmployeeModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) => {
  const createEmployee = useCreateManagerEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      position: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createEmployee.mutateAsync(data).then(() => {
      reset();
      onClose();
      onCreated?.();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add employee"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!createEmployee.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Add Employee
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Fill in the employee details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createEmployee.isPending}
            aria-label="Close add employee modal"
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
              htmlFor="add-employee-email"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="add-employee-email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              placeholder="e.g. mohamed@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-employee-position"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Position
            </label>
            <input
              id="add-employee-position"
              type="text"
              {...register("position", {
                required: "Position is required",
                minLength: {
                  value: 2,
                  message: "Position must be at least 2 characters",
                },
              })}
              placeholder="e.g. AI Specialist"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.position && (
              <p className="mt-1 text-xs text-red-600">{errors.position.message}</p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createEmployee.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEmployee.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {createEmployee.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
