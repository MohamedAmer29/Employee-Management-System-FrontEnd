import { useForm, type SubmitHandler } from "react-hook-form";
import { X, Loader2, Save } from "lucide-react";
import { useUpdateAdmin } from "@/features/admins/admins.hooks";
import type { Admin } from "@/api/user.api";

interface EditAdminModalProps {
  admin: Admin;
  onClose: () => void;
  onSaved?: () => void;
}

interface EditAdminFormValues {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  position: string;
}

const EditAdminModal = ({ admin, onClose, onSaved }: EditAdminModalProps) => {
  const updateAdmin = useUpdateAdmin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditAdminFormValues>({
    defaultValues: {
      firstName: admin.firstName ?? "",
      lastName: admin.lastName ?? "",
      country: admin.country ?? "",
      city: admin.city ?? "",
      phoneNumber: admin.phoneNumber ?? "",
      nationalId: admin.nationalId ?? "",
      position: admin.employee?.position ?? "",
    },
  });

  const onSubmit: SubmitHandler<EditAdminFormValues> = async (values) => {
    try {
      await updateAdmin.mutateAsync({
        id: String(admin.id),
        data: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          country: values.country.trim(),
          city: values.city.trim(),
          phoneNumber: values.phoneNumber.trim(),
          nationalId: values.nationalId.trim(),
          position: values.position.trim(),
        },
      });
      onClose();
      onSaved?.();
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
      aria-label="Edit admin"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!updateAdmin.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Edit Admin
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update the admin details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateAdmin.isPending}
            aria-label="Close edit admin modal"
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
          <div>
            <label
              htmlFor="edit-firstName"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              First name
            </label>
            <input
              id="edit-firstName"
              type="text"
              {...register("firstName", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must be at least 2 characters",
                },
              })}
              className={inputClass(!!errors.firstName)}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="edit-lastName"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Last name
            </label>
            <input
              id="edit-lastName"
              type="text"
              {...register("lastName", {
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Last name must be at least 2 characters",
                },
              })}
              className={inputClass(!!errors.lastName)}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.lastName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="edit-country"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Country
            </label>
            <input
              id="edit-country"
              type="text"
              {...register("country")}
              className={inputClass(!!errors.country)}
            />
          </div>
          <div>
            <label
              htmlFor="edit-city"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              City
            </label>
            <input
              id="edit-city"
              type="text"
              {...register("city")}
              className={inputClass(!!errors.city)}
            />
          </div>
          <div>
            <label
              htmlFor="edit-phoneNumber"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Phone
            </label>
            <input
              id="edit-phoneNumber"
              type="tel"
              {...register("phoneNumber")}
              className={inputClass(!!errors.phoneNumber)}
            />
          </div>
          <div>
            <label
              htmlFor="edit-nationalId"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              National ID
            </label>
            <input
              id="edit-nationalId"
              type="text"
              {...register("nationalId")}
              className={inputClass(!!errors.nationalId)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="edit-position"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Position
            </label>
            <input
              id="edit-position"
              type="text"
              {...register("position")}
              className={inputClass(!!errors.position)}
            />
          </div>
          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateAdmin.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateAdmin.isPending || isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {updateAdmin.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
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

export default EditAdminModal;