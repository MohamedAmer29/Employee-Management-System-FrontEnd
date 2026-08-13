import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2, Save } from "lucide-react";
import { useCreateManager } from "@/features/managers/managers.hooks";
import { useDepartments } from "@/features/employees/employees.hooks";
import type { CreateManagerRequest } from "@/api/user.api";

const AddManagerModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) => {
  const createManager = useCreateManager();
  const { data: departments = [] } = useDepartments();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm<CreateManagerRequest>({
    mode: "onBlur",
    reValidate: "onBlur",
  });

  const onSubmit = (data: CreateManagerRequest) => {
    createManager.mutateAsync(data).then(() => {
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
      aria-label="Add manager"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!createManager.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Add Manager
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Create a new manager account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createManager.isPending}
            aria-label="Close add manager modal"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="add-firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              First name
            </label>
            <input
              {...register("firstName", { required: "First name is required" })}
              placeholder="John"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="add-lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Last name
            </label>
            <input
              {...register("lastName", { required: "Last name is required" })}
              placeholder="Doe"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="add-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" } })}
              placeholder="john@example.com"
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="add-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <input
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
              placeholder="••••••"
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="add-country" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Country
            </label>
            <input
              {...register("country", { required: "Country is required" })}
              placeholder="USA"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="add-city" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              City
            </label>
            <input
              {...register("city", { required: "City is required" })}
              placeholder="New York"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="add-phoneNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Phone
            </label>
            <input
              {...register("phoneNumber", { pattern: { value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/, message: "Valid phone number required" } })}
              placeholder="+1 (555) 123-4567"
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="add-nationalId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              National ID
            </label>
            <input
              {...register("nationalId", { required: "National ID is required" })}
              placeholder="123-45-6789"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="add-position" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Position
            </label>
            <input
              {...register("position", { required: "Position is required" })}
              placeholder="Manager"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.position && (
              <p className="mt-1 text-xs text-red-600">{errors.position.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="add-departmentId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Department
            </label>
            <select
              {...register("departmentId")}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">No department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createManager.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createManager.isPending || isSubmitSuccessful}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {createManager.isPending ? (
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

export default AddManagerModal;