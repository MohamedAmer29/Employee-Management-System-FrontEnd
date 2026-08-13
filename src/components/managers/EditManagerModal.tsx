import { useState, type FormEvent } from "react";
import { X, Loader2, Save } from "lucide-react";
import { useUpdateManager } from "@/features/managers/managers.hooks";
import { useDepartments } from "@/features/employees/employees.hooks";
import type { Manager } from "@/api/user.api";

interface EditManagerModalProps {
  manager: Manager;
  onClose: () => void;
  onSaved?: () => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  position: string;
  departmentId: string;
}

const EditManagerModal = ({
  manager,
  onClose,
  onSaved,
}: EditManagerModalProps) => {
  const updateManager = useUpdateManager();
  const { data: departments = [] } = useDepartments();

  const [form, setForm] = useState<FormState>({
    firstName: manager.firstName ?? "",
    lastName: manager.lastName ?? "",
    country: manager.country ?? "",
    city: manager.city ?? "",
    phoneNumber: manager.phoneNumber ?? "",
    nationalId: manager.nationalId ?? "",
    position: manager.employee?.position ?? "",
    departmentId: manager.employee?.department
      ? String(manager.employee.department.id)
      : "",
  });

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateManager.mutateAsync({
        id: String(manager.id),
        data: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          phoneNumber: form.phoneNumber.trim(),
          nationalId: form.nationalId.trim(),
          position: form.position.trim(),
          departmentId: form.departmentId,
        },
      });
      onClose();
      onSaved?.();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit manager"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!updateManager.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Edit Manager
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update the manager details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateManager.isPending}
            aria-label="Close edit manager modal"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5" noValidate>
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
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
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
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
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
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
              value={form.nationalId}
              onChange={(e) => set("nationalId", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="edit-position"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Position
            </label>
            <input
              id="edit-position"
              type="text"
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="edit-departmentId"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Department
            </label>
            <select
              id="edit-departmentId"
              value={form.departmentId}
              onChange={(e) => set("departmentId", e.target.value)}
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
              disabled={updateManager.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateManager.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {updateManager.isPending ? (
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

export default EditManagerModal;
