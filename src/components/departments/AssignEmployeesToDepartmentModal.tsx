import { useEffect, useMemo, useState } from "react";
import { X, Loader2, Users, Briefcase, RefreshCw, ShieldCheck } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import {
  useEmployees,
  useAssignEmployeesToDepartment,
} from "@/features/employees/employees.hooks";

interface AssignEmployeesToDepartmentModalProps {
  departmentId: string;
  departmentName: string;
  onClose: () => void;
}

const AssignEmployeesToDepartmentModal = ({
  departmentId,
  departmentName,
  onClose,
}: AssignEmployeesToDepartmentModalProps) => {
  const {
    data: employees = [],
    isLoading,
    isError,
    refetch,
  } = useEmployees();
  const assignEmployees = useAssignEmployeesToDepartment();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { available, assigned } = useMemo(() => {
    const available: typeof employees = [];
    const assigned: typeof employees = [];
    for (const employee of employees) {
      if (
        employee.department &&
        String(employee.department.id) === String(departmentId)
      ) {
        assigned.push(employee);
      } else {
        available.push(employee);
      }
    }
    return { available, assigned };
  }, [employees, departmentId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    try {
      await assignEmployees.mutateAsync({
        id: departmentId,
        employeeIds: selectedIds,
      });
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Assign employees to department"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!assignEmployees.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            Assign Employees
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={assignEmployees.isPending}
            aria-label="Close assign employees modal"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Assigning employees to{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {departmentName}
            </span>
            :
          </p>

          {isLoading ? (
            <div
              className="flex items-center justify-center py-12"
              role="status"
              aria-label="Loading employees"
            >
              <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load employees
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Try Again
              </button>
            </div>
          ) : (
            <>
              <label
                htmlFor="assign-employees"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Select employees
              </label>
              <select
                id="assign-employees"
                value=""
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) toggleSelect(value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Choose an employee...</option>
                {available.map((employee) => (
                  <option
                    key={employee.id}
                    value={String(employee.id)}
                    disabled={selectedIds.includes(String(employee.id))}
                  >
                    {employee.fullName} ({employee.position || "No position"})
                  </option>
                ))}
              </select>

              {assigned.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Already assigned to this department
                  </p>
                  <ul className="space-y-2">
                    {assigned.map((employee) => (
                      <li
                        key={employee.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200 dark:border-gray-700 opacity-60"
                      >
                        <Avatar
                          name={employee.fullName}
                          src={getAssetUrl(employee.profilePicture)}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {employee.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {employee.email}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          Already assigned
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedIds.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Selected employees ({selectedIds.length})
                  </p>
                  <ul className="space-y-2">
                    {employees
                      .filter((employee) =>
                        selectedIds.includes(String(employee.id)),
                      )
                      .map((employee) => (
                        <div key={employee.id}>
                          <li className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                            <Avatar
                              name={employee.fullName}
                              src={getAssetUrl(employee.profilePicture)}
                              size="sm"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {employee.fullName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {employee.email}
                              </p>
                            </div>
                            <span className="flex items-center gap-1 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                <Briefcase className="w-3 h-3" />
                                {employee.position}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                                <ShieldCheck className="w-3 h-3" />
                                {employee.role}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSelect(String(employee.id))}
                              aria-label={`Remove ${employee.fullName}`}
                              className="flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            >
                              <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </li>
                        </div>
                      ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <button
            type="button"
            onClick={onClose}
            disabled={assignEmployees.isPending}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={assignEmployees.isPending || selectedIds.length === 0}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {assignEmployees.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Assign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployeesToDepartmentModal;