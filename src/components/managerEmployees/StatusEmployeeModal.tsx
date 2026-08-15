import { Loader2, UserCheck, UserX } from "lucide-react";
import { useUpdateManagerEmployeeStatus } from "@/features/employees/employees.hooks";

const StatusEmployeeModal = ({
  employeeId,
  employeeName,
  isActive,
  onClose,
  onUpdated,
}: {
  employeeId: number;
  employeeName: string;
  isActive: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}) => {
  const updateStatus = useUpdateManagerEmployeeStatus();

  const handleUpdate = () => {
    updateStatus.mutateAsync({ id: employeeId, isActive: !isActive }).then(() => {
      onClose();
      onUpdated?.();
    });
  };

  const activating = !isActive;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={activating ? "Activate employee" : "Deactivate employee"}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!updateStatus.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-5 ${
              activating
                ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {activating ? (
              <UserCheck className="w-8 h-8" aria-hidden="true" />
            ) : (
              <UserX className="w-8 h-8" aria-hidden="true" />
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {activating ? "Activate this employee?" : "Deactivate this employee?"}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            You are about to {activating ? "activate" : "deactivate"}{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {employeeName}
            </span>
            .
          </p>
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={updateStatus.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={updateStatus.isPending}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 ${
                activating
                  ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                  : "bg-gray-600 hover:bg-gray-700 focus-visible:ring-gray-500"
              }`}
            >
              {updateStatus.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : activating ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  Activate
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4" />
                  Deactivate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusEmployeeModal;
