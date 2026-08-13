import { Loader2, Trash2 } from "lucide-react";
import { useDeleteManager } from "@/features/managers/managers.hooks";

interface DeleteManagerModalProps {
  managerId: string | number;
  managerName: string;
  onClose: () => void;
  onDeleted?: () => void;
}

const DeleteManagerModal = ({
  managerId,
  managerName,
  onClose,
  onDeleted,
}: DeleteManagerModalProps) => {
  const deleteManager = useDeleteManager();

  const handleDelete = async () => {
    try {
      await deleteManager.mutateAsync(managerId);
      onClose();
      onDeleted?.();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Delete manager"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!deleteManager.isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
            <Trash2 className="w-8 h-8" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            Delete this manager?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            This will permanently delete{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {managerName}
            </span>
            . This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteManager.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteManager.isPending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {deleteManager.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteManagerModal;
