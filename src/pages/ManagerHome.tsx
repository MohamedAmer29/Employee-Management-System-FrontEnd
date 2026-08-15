import { useMemo, useState, type ReactNode } from "react";
import { useSelector } from "react-redux";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  TrendingUp,
  Building2,
  Bell,
  LogIn,
  Ban,
  UserPlus,
  Pencil,
  RefreshCw,
  ScrollText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { useCurrentUser } from "@/features/user/user.hooks";
import { useManagerDashboard } from "@/features/dashboard/dashboard.hooks";
import StatCard from "@/components/dashboard/StatCard";
import {
  DoughnutChartCard,
  LineChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import type { ManagerRecentActivity } from "@/api/user.api";
import { formatDateInUserZone } from "@/utils/formatDate";

const ACTIVITIES_PER_PAGE = 7;

const ChartSkeleton = () => (
  <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse">
    <div className="h-3 w-32 rounded bg-gray-200 dark:bg-white/10" />
    <div className="mt-4 h-40 rounded-lg bg-gray-200 dark:bg-white/10" />
  </div>
);

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10" />
        <div className="mt-2 h-7 w-16 rounded bg-gray-200 dark:bg-white/10" />
        <div className="mt-2 h-3 w-32 rounded bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="h-11 w-11 rounded-xl bg-gray-200 dark:bg-white/10" />
    </div>
  </div>
);

const activityIcon: Record<string, { icon: LucideIcon; className: string }> = {
  LOGIN: {
    icon: LogIn,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  LOGIN_FAILED: {
    icon: Ban,
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  CREATE: {
    icon: UserPlus,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  UPDATE: {
    icon: Pencil,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

const getActivityIcon = (action: string) =>
  activityIcon[action] ?? {
    icon: ScrollText,
    className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  };

const ActivityItem = ({ activity }: { activity: ManagerRecentActivity }) => {
  const { icon: Icon, className } = getActivityIcon(activity.auditLog_action);
  const userName =
    [activity.user_firstName, activity.user_lastName]
      .filter(Boolean)
      .join(" ") || "Unknown";

  return (
    <li className="flex items-start gap-3">
      <span
        className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 ${className}`}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {activity.auditLog_description}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {userName} · {activity.auditLog_entity}
        </p>
      </div>
    </li>
  );
};

const Panel = ({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <section className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

const ManagerHome = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserQuery = useCurrentUser();
  const dashboardQuery = useManagerDashboard();

  const dashboard = dashboardQuery.data;
  const displayName =
    currentUserQuery.data?.firstName ||
    user?.firstName ||
    user?.username ||
    "there";

  const activities = dashboard?.recentActivities ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil(activities.length / ACTIVITIES_PER_PAGE),
  );
  const [activityPage, setActivityPage] = useState(0);

  const page = Math.min(activityPage, totalPages - 1);

  const pageActivities = activities.slice(
    page * ACTIVITIES_PER_PAGE,
    (page + 1) * ACTIVITIES_PER_PAGE,
  );

  const attendanceChartItems: ChartItem[] = useMemo(
    () =>
      dashboard
        ? [
            {
              label: "Present",
              value: dashboard.attendance.presentToday,
              color: "#10B981",
            },
            {
              label: "Absent",
              value: dashboard.attendance.absentToday,
              color: "#EF4444",
            },
            {
              label: "Late",
              value: dashboard.attendance.lateToday,
              color: "#F59E0B",
            },
            {
              label: "On Leave",
              value: dashboard.attendance.onLeaveToday,
              color: "#0EA5E9",
            },
          ]
        : [],
    [dashboard],
  );

  const leaveChartItems: ChartItem[] = useMemo(
    () =>
      dashboard
        ? [
            {
              label: "Pending",
              value: dashboard.leave.pending,
              color: "#F59E0B",
            },
            {
              label: "Approved",
              value: dashboard.leave.approved,
              color: "#10B981",
            },
            {
              label: "Rejected",
              value: dashboard.leave.rejected,
              color: "#EF4444",
            },
          ]
        : [],
    [dashboard],
  );

  const performanceChartItems: ChartItem[] = useMemo(
    () =>
      (dashboard?.performance.performanceDistribution ?? []).map((item) => ({
        label: `${item.rating} stars`,
        value: item.count,
      })),
    [dashboard],
  );

  const presentTrend: ChartItem[] = useMemo(
    () =>
      (dashboard?.attendanceTrend ?? []).map((point) => ({
        label: formatDateInUserZone(point.date, { dateOnly: true }),
        value: point.present,
        color: "#10B981",
      })),
    [dashboard],
  );

  const absentTrend: ChartItem[] = useMemo(
    () =>
      (dashboard?.attendanceTrend ?? []).map((point) => ({
        label: formatDateInUserZone(point.date, { dateOnly: true }),
        value: point.absent,
        color: "#EF4444",
      })),
    [dashboard],
  );

  const statCards = [
    {
      icon: Users,
      label: "Employees",
      value: dashboard?.employees.total ?? "—",
      hint: dashboard ? `${dashboard.employees.active} active` : undefined,
      accentClass: "bg-primary/10 text-primary",
    },
    {
      icon: CalendarCheck,
      label: "Attendance Today",
      value: dashboard?.attendance.presentToday ?? "—",
      hint: dashboard
        ? `${dashboard.attendance.absentToday} absent · ${dashboard.attendance.lateToday} late · ${dashboard.attendance.onLeaveToday} on leave`
        : undefined,
      accentClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: CalendarDays,
      label: "Leave Requests",
      value: dashboard
        ? dashboard.leave.pending +
          dashboard.leave.approved +
          dashboard.leave.rejected
        : "—",
      hint: dashboard
        ? `${dashboard.leave.pending} pending · ${dashboard.leave.approved} approved · ${dashboard.leave.rejected} rejected`
        : undefined,
      accentClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      icon: TrendingUp,
      label: "Performance",
      value:
        dashboard && dashboard.performance.averageRating > 0
          ? `${dashboard.performance.averageRating.toFixed(1)} / 5`
          : "—",
      hint: dashboard
        ? `${dashboard.performance.totalReviews} total reviews · ${dashboard.performance.reviewsThisMonth} this month`
        : undefined,
      accentClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ] as const;

  const loadError = dashboardQuery.isError ? (
    <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6 text-center">
      <p className="font-semibold text-red-700 dark:text-red-300">
        We couldn't load the dashboard.
      </p>
      <button
        type="button"
        onClick={() => dashboardQuery.refetch()}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          An overview of your department's activity.
        </p>
      </div>

      <section className="rounded-2xl bg-gradient-to-br from-dark via-primary-dark to-primary p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <div
          className="absolute top-10 right-20 h-20 w-20 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-sm font-medium text-white/80">Welcome back,</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {displayName} 👋
          </h2>
          <p className="text-sm text-white/75 mt-2 max-w-xl">
            {dashboard
              ? `Here's what's happening in the ${dashboard.department.name} department today.`
              : "Here's what's happening in your department today."}
          </p>
        </div>
      </section>

      {loadError}

      {/* Stat cards */}
      {dashboardQuery.isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
          role="status"
          aria-label="Loading dashboard"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              hint={card.hint}
              accentClass={card.accentClass}
            />
          ))}
        </div>
      )}

      {/* Analytics charts */}
      <section aria-label="Analytics charts">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Analytics
        </h2>
        {dashboardQuery.isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
            role="status"
            aria-label="Loading charts"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <ChartSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            <DoughnutChartCard
              title="Attendance Today"
              items={attendanceChartItems}
            />
            <DoughnutChartCard title="Leave Requests" items={leaveChartItems} />
            <DoughnutChartCard
              title="Performance Distribution"
              items={performanceChartItems}
            />
          </div>
        )}

        <Panel title="Attendance Trend">
          {dashboardQuery.isLoading ? (
            <div className="h-64 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
          ) : presentTrend.length > 0 ? (
            <LineChartCard
              title="Present vs Absent"
              series={[
                { title: "Present", color: "#10B981", items: presentTrend },
                { title: "Absent", color: "#EF4444", items: absentTrend },
              ]}
              pointDelay={50}
              duration={800}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              No attendance trend data yet.
            </p>
          )}
        </Panel>
      </section>

      {/* Secondary panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Recent activities */}
        <div className="xl:col-span-2">
          <Panel title="Recent Activities">
            {dashboardQuery.isLoading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-white/10" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length ? (
              <>
                <ul className="space-y-4">
                  {pageActivities.map((activity) => (
                    <ActivityItem key={activity.auditLog_id} activity={activity} />
                  ))}
                </ul>
                {totalPages > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {activities.length} activities
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActivityPage((current) => Math.max(0, current - 1))
                        }
                        disabled={page === 0}
                        aria-label="Previous activities"
                        className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                        Page {page + 1} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setActivityPage((current) =>
                            Math.min(totalPages - 1, current + 1),
                          )
                        }
                        disabled={page >= totalPages - 1}
                        aria-label="Next activities"
                        className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                No recent activity yet.
              </p>
            )}
          </Panel>
        </div>

        {/* Summary column */}
        <div className="space-y-4 sm:space-y-5">
          <Panel title="Department">
            {dashboardQuery.isLoading ? (
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    {dashboard?.department.name ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your department
                  </p>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Notifications">
            {dashboardQuery.isLoading ? (
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Bell className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    {dashboard?.unreadNotifications ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Unread notifications
                  </p>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Attendance Rate">
            {dashboardQuery.isLoading ? (
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CalendarCheck className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    {dashboard?.attendance.attendanceRate ?? 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Today's rate · {dashboard?.attendance.monthlyRate ?? 0}% this
                    month
                  </p>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;
