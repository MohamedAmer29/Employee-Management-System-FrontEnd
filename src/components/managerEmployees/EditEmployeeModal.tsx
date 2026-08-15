import { useForm } from "react-hook-form";
import { X, Loader2, Save } from "lucide-react";
import { useUpdateManagerEmployee } from "@/features/employees/employees.hooks";
import type { EmployeeDetail } from "@/api/user.api";

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  isActive: boolean;
}

const EditEmployeeModal = ({
  employee,
  onClose,
  onSaved,
}: {
  employee: EmployeeDetail;
  onClose: () => void;
  onSaved?: () => void;
}) => {
  const updateEmployee = useUpdateManagerEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      isActive: employee.isActive,
    },
  });

  const onSubmit = (data: FormValues) => {
    updateEmployee.mutateAsync({ id: employee.id, data }).then(() => {
      reset();
      onClose();
      onSaved?.();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit employee"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!updateEmployee.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Edit Employee
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {employee.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateEmployee.isPending}
            aria-label="Close edit employee modal"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          <div className="sm:col-span-2">
            <label
              htmlFor="edit-employee-fullName"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Full name
            </label>
            <input
              id="edit-employee-fullName"
              type="text"
              {...register("fullName", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Full name must be at least 2 characters",
                },
              })}
              placeholder="e.g. Mohamed Ahmed"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-employee-email"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="edit-employee-email"
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
              htmlFor="edit-employee-phone"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Phone
            </label>
            <input
              id="edit-employee-phone"
              type="tel"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^(?:\+?20)?01[0-9]{9}$/,
                  message:
                    "Valid Egyptian phone number required (e.g. 01xxxxxxxxx)",
                },
              })}
              placeholder="e.g. 01111111111"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-employee-position"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Position
            </label>
            <input
              id="edit-employee-position"
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

          <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Active status
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toggle whether this employee is currently active
              </p>
            </div>
            <label className="relative inline-flex shrink-0 cursor-pointer items-center">
              <input
                type="checkbox"
                {...register("isActive")}
                className="peer sr-only"
              />
              <span
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors peer-checked:bg-emerald-500"
                aria-hidden="true"
              />
              <span
                className="absolute left-1 inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform peer-checked:translate-x-7"
                aria-hidden="true"
              />
            </label>
          </div>

          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateEmployee.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateEmployee.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {updateEmployee.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
