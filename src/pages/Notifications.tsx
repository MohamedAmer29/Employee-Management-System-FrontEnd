import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Inbox,
  Eye,
  Mail,
  MailOpen,
  CheckCheck,
  Trash2,
} from "lucide-react";
import {
  useNotifications,
  useUnreadNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/features/notifications/notifications.hooks";
import { getTypeStyle } from "@/features/notifications/notification.styles";
import NotificationDetailsModal from "@/components/notifications/NotificationDetailsModal";
import type { NotificationsParams, AppNotification } from "@/api/user.api";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface NotificationCardProps {
  notification: AppNotification;
  onMarkAsRead: (notification: AppNotification) => void;
  onViewDetails: (id: string) => void;
  onDelete: (notification: AppNotification) => void;
}

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onViewDetails,
  onDelete,
}: NotificationCardProps) => {
  const { icon: TypeIcon, className } = getTypeStyle(notification.type);

  return (
    <li
      className={`flex items-stretch transition-colors ${
        notification.isRead
          ? "bg-white dark:bg-dark-surface"
          : "bg-primary/[0.03] dark:bg-primary/[0.06]"
      }`}
    >
      <button
        type="button"
        onClick={() => onMarkAsRead(notification)}
        aria-label={`${notification.isRead ? "Read" : "Unread"} notification: ${notification.title}. Click to ${notification.isRead ? "view" : "mark as read"}`}
        className={`flex-1 min-w-0 flex items-start gap-4 p-4 sm:p-5 text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
          notification.isRead
            ? ""
            : "hover:bg-primary/[0.06] dark:hover:bg-primary/[0.1]"
        }`}
      >
        <span
          className={`flex items-center justify-center h-10 w-10 rounded-xl border shrink-0 ${className}`}
        >
          <TypeIcon className="w-5 h-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${className}`}
            >
              {notification.type}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(notification.createdAt)}
            </span>
            {!notification.isRead && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                New
              </span>
            )}
          </span>
          <span className="mt-1.5 block text-sm font-semibold text-gray-900 dark:text-gray-100">
            {notification.title}
          </span>
          <span className="mt-0.5 block text-sm text-gray-600 dark:text-gray-400">
            {notification.message}
          </span>
        </span>
      </button>
      <span className="flex lg:flex-row lg:gap-10 flex-col items-center gap-2 p-4 pl-0 sm:p-5 sm:pl-0 shrink-0">
        <div>
          <button
            type="button"
            onClick={() => onViewDetails(notification.id)}
            aria-label={`View details for ${notification.title}`}
            title="View details"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(notification)}
            aria-label={`Delete notification: ${notification.title}`}
            title="Delete notification"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {notification.isRead ? (
          <CheckCircle2
            className="w-4 h-4 text-gray-300 dark:text-gray-600"
            aria-label="Read"
          />
        ) : (
          <Circle className="w-4 h-4 text-primary" aria-label="Unread" />
        )}
      </span>
    </li>
  );
};

const Notifications = () => {
  const [params, setParams] = useState<NotificationsParams>({
    page: 1,
    limit: 20,
  });
  const [limit, setLimit] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUnread, setShowUnread] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useNotifications(params);
  const { data: unreadCountData } = useUnreadNotificationCount();
  const unreadCount = unreadCountData?.unread ?? 0;
  const {
    data: unreadResponse,
    isLoading: isUnreadLoading,
    isError: isUnreadError,
    refetch: refetchUnread,
  } = useUnreadNotifications(params, showUnread);

  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkAllPending } =
    useMarkAllNotificationsAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const activeData = showUnread ? unreadResponse : data;
  const activeNotifications = activeData?.data || [];
  const activeTotalPages = activeData?.meta?.totalPages || 1;
  const activeTotal = activeData?.meta?.total || 0;
  const activeIsLoading = showUnread ? isUnreadLoading : isLoading;
  const activeIsError = showUnread ? isUnreadError : isError;
  const activeRefetch = showUnread ? refetchUnread : refetch;

  const handleNotificationClick = (notification: AppNotification) => {
    if (notification.isRead) return;
    markAsRead(notification.id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleDeleteNotification = (notification: AppNotification) => {
    deleteNotification(notification.id, {
      onSuccess: () => toast.success("Notification deleted"),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleCloseDetails = () => {
    setSelectedId(null);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setParams((prev) => ({ ...prev, page: 1, limit: newLimit }));
  };

  const handleToggleUnread = () => {
    const next = !showUnread;
    setShowUnread(next);
    if (next) {
      setParams((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchUnread();
    toast.success("Notifications refreshed successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
            {showUnread ? "Unread Notifications" : "All Notifications"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {showUnread
              ? `${activeTotal} unread notification${activeTotal === 1 ? "" : "s"}`
              : `${activeTotal} notification${activeTotal === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            role="button"
            tabIndex={0}
            onClick={handleToggleUnread}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggleUnread();
              }
            }}
            aria-expanded={showUnread}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none ${
              showUnread
                ? "text-white bg-primary border-primary hover:bg-primary-dark"
                : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            {showUnread ? (
              <MailOpen className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Mail className="w-4 h-4" aria-hidden="true" />
            )}
            <span>
              Unread
              <span
                className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                  showUnread
                    ? "bg-white/20 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isMarkAllPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" aria-hidden="true" />
            {isMarkAllPending ? "Marking..." : "Mark all as read"}
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {activeIsLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {showUnread
                ? "Loading unread notifications..."
                : "Loading notifications..."}
            </p>
          </div>
        ) : activeIsError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              {showUnread
                ? "Failed to load unread notifications"
                : "Failed to load notifications"}
            </p>
            <button
              type="button"
              onClick={() => activeRefetch()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        ) : activeNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {showUnread ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You're all caught up.
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {activeNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleNotificationClick}
                  onViewDetails={setSelectedId}
                  onDelete={handleDeleteNotification}
                />
              ))}
            </ul>

            {/* Pagination */}
            <div className="px-4 sm:px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {activeNotifications.length} of {activeTotal}{" "}
                  {showUnread ? "unread" : "notifications"}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Rows per page:
                  </label>
                  <select
                    value={limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(params.page! - 1)}
                  disabled={params.page === 1}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {params.page} of {activeTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(params.page! + 1)}
                  disabled={params.page === activeTotalPages}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedId && (
        <NotificationDetailsModal
          notificationId={selectedId}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default Notifications;
