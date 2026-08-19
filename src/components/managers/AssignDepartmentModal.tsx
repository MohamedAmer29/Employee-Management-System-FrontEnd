import { useState, type FormEvent } from "react";
import { X, Loader2, Building2 } from "lucide-react";
import { useAssignManagerToDepartment } from "@/features/managers/managers.hooks";
import { useDepartments } from "@/features/employees/employees.hooks";
import type { Manager } from "@/api/user.api";

interface AssignDepartmentModalProps {
  manager: Manager;
  onClose: () => void;
  onSaved?: () => void;
}

const AssignDepartmentModal = ({
  manager,
  onClose,
  onSaved,
}: AssignDepartmentModalProps) => {
  const assign = useAssignManagerToDepartment();
  const { data: departments = [] } = useDepartments();
  const [departmentId, setDepartmentId] = useState(
    manager.employee?.department ? String(manager.employee.department.id) : "",
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!departmentId) return;
    try {
      await assign.mutateAsync({
        id: String(manager.id),
        departmentId,
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
      aria-label="Assign manager to department"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!assign.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Assign to Department
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Assign the manager to a department
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={assign.isPending}
            aria-label="Close assign department modal"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label
              htmlFor="assign-department"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Department
            </label>
            <select
              id="assign-department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">Select a department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={assign.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assign.isPending || !departmentId}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {assign.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  Assign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDepartmentModal;