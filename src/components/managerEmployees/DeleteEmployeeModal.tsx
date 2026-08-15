import { Loader2, Trash2 } from "lucide-react";
import { useDeleteManagerEmployee } from "@/features/employees/employees.hooks";

const DeleteEmployeeModal = ({
  employeeId,
  employeeName,
  onClose,
  onDeleted,
}: {
  employeeId: number;
  employeeName: string;
  onClose: () => void;
  onDeleted?: () => void;
}) => {
  const deleteEmployee = useDeleteManagerEmployee();

  const handleDelete = () => {
    deleteEmployee.mutateAsync(employeeId).then(() => {
      onClose();
      onDeleted?.();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Delete employee"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!deleteEmployee.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
            <Trash2 className="w-8 h-8" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            Delete this employee?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            This will permanently delete{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {employeeName}
            </span>
            . This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteEmployee.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteEmployee.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {deleteEmployee.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Sure
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteEmployeeModal;
