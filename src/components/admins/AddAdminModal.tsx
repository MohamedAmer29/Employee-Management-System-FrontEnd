import { useForm, type SubmitHandler } from "react-hook-form";
import { X, Loader2, Save } from "lucide-react";
import { useCreateAdmin } from "@/features/admins/admins.hooks";
import { useDepartments } from "@/features/employees/employees.hooks";
import type { CreateAdminRequest } from "@/api/user.api";

const Field = ({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

const AddAdminModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) => {
  const createAdmin = useCreateAdmin();
  const { data: departments = [] } = useDepartments();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateAdminRequest>({
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<CreateAdminRequest> = async (values) => {
    try {
      await createAdmin.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        country: values.country.trim(),
        city: values.city.trim(),
        phoneNumber: values.phoneNumber.trim(),
        nationalId: values.nationalId.trim(),
        departmentId: values.departmentId,
      });
      reset();
      onClose();
      onCreated?.();
    } catch {
      // Error is handled by the mutation
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      hasError
        ? "border-red-500 dark:border-red-500 focus:ring-red-500"
        : "border-gray-300 dark:border-gray-600 focus:ring-primary"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add admin"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!createAdmin.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Add Admin
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Create a new admin account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createAdmin.isPending}
            aria-label="Close add admin modal"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5"
          noValidate
        >
          <Field label="First name" error={errors.firstName?.message}>
            <input
              type="text"
              placeholder="e.g. Mohamed"
              {...register("firstName", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must be at least 2 characters",
                },
              })}
              className={inputClass(!!errors.firstName)}
            />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <input
              type="text"
              placeholder="e.g. Amer"
              {...register("lastName", {
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Last name must be at least 2 characters",
                },
              })}
              className={inputClass(!!errors.lastName)}
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              placeholder="e.g. mohamed@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              className={inputClass(!!errors.email)}
            />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={inputClass(!!errors.password)}
            />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <input
              type="text"
              placeholder="e.g. Egypt"
              {...register("country", {
                required: "Country is required",
              })}
              className={inputClass(!!errors.country)}
            />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input
              type="text"
              placeholder="e.g. Cairo"
              {...register("city", {
                required: "City is required",
              })}
              className={inputClass(!!errors.city)}
            />
          </Field>
          <Field label="Phone number" error={errors.phoneNumber?.message}>
            <input
              type="tel"
              placeholder="e.g. 01012345678"
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^(?:\+?20)?01[0-9]{9}$/,
                  message: "Enter a valid phone number (e.g. 01xxxxxxxxx)",
                },
              })}
              className={inputClass(!!errors.phoneNumber)}
            />
          </Field>
          <Field label="National ID" error={errors.nationalId?.message}>
            <input
              type="text"
              placeholder="e.g. 29912345678901"
              {...register("nationalId", {
                required: "National ID is required",
                minLength: {
                  value: 10,
                  message: "National ID must be at least 10 digits",
                },
              })}
              className={inputClass(!!errors.nationalId)}
            />
          </Field>
          <Field label="Department">
            <select
              {...register("departmentId", {
                required: "Department is required",
              })}
              className={inputClass(!!errors.departmentId)}
            >
              <option value="">Select a department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createAdmin.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAdmin.isPending || isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {createAdmin.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;