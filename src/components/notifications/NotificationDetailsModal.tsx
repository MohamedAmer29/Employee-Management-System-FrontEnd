import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  X,
  RefreshCw,
  Clock,
  Hash,
  User,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { useNotification } from "@/features/notifications/notifications.hooks";
import { getTypeStyle } from "@/features/notifications/notification.styles";

interface NotificationDetailsModalProps {
  notificationId: string | null;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const DetailsRow = ({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 shrink-0">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm text-gray-900 dark:text-gray-100 break-all ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const NotificationDetailsModal = ({
  notificationId,
  onClose,
}: NotificationDetailsModalProps) => {
  const { data: response, isLoading, isError, refetch } = useNotification(
    notificationId ?? undefined,
  );
  const notification = response?.data;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Notification details"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            Notification Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification details"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20" role="status">
            <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : isError || !notification ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-red-700 dark:text-red-300">
              We couldn't load this notification.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getTypeStyle(
                  notification.type,
                ).className}`}
              >
                {notification.type}
              </span>
              {notification.isRead ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Read
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  <Circle className="w-4 h-4" aria-hidden="true" />
                  Unread
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {notification.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {notification.message}
            </p>

            <div className="grid grid-cols-1 gap-5 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <DetailsRow
                icon={Clock}
                label="Created At"
                value={formatDate(notification.createdAt)}
              />
              <DetailsRow
                icon={CheckCircle2}
                label="Read At"
                value={
                  notification.readAt ? formatDate(notification.readAt) : "—"
                }
              />
              <DetailsRow
                icon={Hash}
                label="Notification ID"
                value={notification.id}
                mono
              />
              <DetailsRow
                icon={User}
                label="User ID"
                value={notification.userId}
                mono
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetailsModal;
