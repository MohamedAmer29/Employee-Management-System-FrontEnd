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
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/store/store";
import { useCurrentUser } from "@/features/user/user.hooks";
import { useAdminDashboard, useHealthCheck } from "@/features/dashboard/dashboard.hooks";
import EmployeeHome from "@/pages/EmployeeHome";
import ManagerHome from "@/pages/ManagerHome";
import FullPageLoader from "@/components/common/FullPageLoader";
import StatCard from "@/components/dashboard/StatCard";
import { DoughnutChartCard, BarChartCard } from "@/components/dashboard/charts";
import type { RecentActivity } from "@/api/user.api";
import AnimatedNumber from "@/components/common/AnimatedNumber";
import SeoHead from "@/components/common/SeoHead";
import Reveal from "@/components/common/Reveal";

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

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const { icon: Icon, className } = getActivityIcon(activity.action);

  return (
    <li className="flex items-start gap-3">
      <span
        className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 ${className}`}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {activity.description}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {activity.user !== "null null" ? activity.user : "Unknown"} ·{" "}
          {activity.entity}
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

const StatusBadge = ({
  label,
  status,
}: {
  label: string;
  status: "up" | "down";
}) => (
  <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-3 py-2">
    <span
      className={`h-2 w-2 rounded-full ${
        status === "up"
          ? "bg-emerald-500"
          : "bg-red-500 animate-pulse"
      }`}
    />
    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
    </span>
    <span
      className={`ml-auto text-[10px] font-bold uppercase tracking-wider ${
        status === "up"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {status}
    </span>
  </div>
);

const AdminHome = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserQuery = useCurrentUser();
  const dashboardQuery = useAdminDashboard();
  const healthQuery = useHealthCheck();

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

  // Clamp during render so a shrunken list can't leave the page out of range.
  const page = Math.min(activityPage, totalPages - 1);

  const pageActivities = activities.slice(
    page * ACTIVITIES_PER_PAGE,
    (page + 1) * ACTIVITIES_PER_PAGE,
  );

  const employeeChartItems = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: "Active", value: dashboard.employees.active, color: "#10B981" },
      {
        label: "Inactive",
        value: dashboard.employees.inactive,
        color: "#EF4444",
      },
    ];
  }, [dashboard]);

  const attendanceChartItems = useMemo(() => {
    if (!dashboard) return [];
    return [
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
    ];
  }, [dashboard]);

  const leaveChartItems = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: "Pending", value: dashboard.leave.pending, color: "#F59E0B" },
      { label: "Approved", value: dashboard.leave.approved, color: "#10B981" },
      { label: "Rejected", value: dashboard.leave.rejected, color: "#EF4444" },
    ];
  }, [dashboard]);

  const departmentChartItems = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.departments.employeesPerDepartment.map((dept) => ({
      label: dept.departmentName ?? "Unassigned",
      value: dept.employeeCount ?? 0,
    }));
  }, [dashboard]);

  const performanceChartItems = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.performance.performanceDistribution.map((item) => ({
      label: `${item.rating} stars`,
      value: item.count,
    }));
  }, [dashboard]);

  const statCards = [
    {
      icon: Users,
      label: "Employees",
      value: dashboard?.employees.total ?? "—",
      hint: dashboard
        ? `${dashboard.employees.active} active · ${dashboard.employees.inactive} inactive · ${dashboard.employees.newThisMonth} new this month`
        : undefined,
    },
    {
      icon: CalendarCheck,
      label: "Attendance Today",
      value: dashboard?.attendance.presentToday ?? "—",
      hint: dashboard
        ? `${dashboard.attendance.checkedInToday} checked in · ${dashboard.attendance.checkedOutToday} checked out · ${dashboard.attendance.absentToday} absent`
        : undefined,
    },
    {
      icon: CalendarDays,
      label: "Leave Requests",
      value: dashboard?.leave.total ?? "—",
      hint: dashboard
        ? `${dashboard.leave.pending} pending · ${dashboard.leave.approved} approved · ${dashboard.leave.rejected} rejected`
        : undefined,
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
      <SeoHead title="Dashboard" path="/home" />
      <Reveal y={20}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            An overview of your organization's activity.
          </p>
        </div>
      </Reveal>

      <Reveal y={30}>
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
              Here's what's happening with your organization today.
            </p>
          </div>
        </section>
      </Reveal>

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
        <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((card) => (
            <Reveal key={card.label}>
              <StatCard
                icon={card.icon}
                label={card.label}
                value={card.value}
                hint={card.hint}
              />
            </Reveal>
          ))}
        </Reveal>
      )}

      {/* Analytics charts */}
      <section aria-label="Analytics charts">
        <Reveal y={20}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Analytics
          </h2>
        </Reveal>
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
          <>
            <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              <Reveal><DoughnutChartCard title="Employees" items={employeeChartItems} /></Reveal>
              <Reveal>
                <DoughnutChartCard
                  title="Attendance Today"
                  items={attendanceChartItems}
                />
              </Reveal>
              <Reveal>
                <DoughnutChartCard
                  title="Leave Requests"
                  items={leaveChartItems}
                />
              </Reveal>
            </Reveal>
            <Reveal stagger className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-5">
              <Reveal>
                <BarChartCard
                  title="Employees per Department"
                  items={departmentChartItems}
                />
              </Reveal>
              <Reveal>
                <BarChartCard
                  title="Performance Distribution"
                  items={performanceChartItems}
                />
              </Reveal>
            </Reveal>
          </>
        )}
      </section>

      {/* Secondary panels */}
      <Reveal stagger className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Recent activities */}
        <Reveal className="xl:col-span-2">
          <Panel
            title="Recent Activities"
            action={
              user?.role === "Admin" ? (
                <button
                  type="button"
                  onClick={() => navigate("/audit-logs")}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ) : undefined
            }
          >
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
                    <ActivityItem key={activity.id} activity={activity} />
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
        </Reveal>

        {/* Summary column */}
        <Reveal className="space-y-4 sm:space-y-5">
          <Panel title="Departments">
            {dashboardQuery.isLoading ? (
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    <AnimatedNumber value={dashboard?.departments.total ?? 0} />
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total departments
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
                    <AnimatedNumber value={dashboard?.notifications.unread ?? 0} />
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Unread · <AnimatedNumber value={dashboard?.notifications.total ?? 0} /> total
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
                    <AnimatedNumber value={dashboard?.attendance.attendanceRate ?? 0} suffix="%" />
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Today's rate
                  </p>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="System Health"
            action={
              <button
                onClick={() => healthQuery.refetch()}
                disabled={healthQuery.isFetching}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${healthQuery.isFetching ? "animate-spin" : ""}`} />
              </button>
            }
          >
            {healthQuery.isLoading ? (
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
            ) : healthQuery.isError ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <XCircle className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Unreachable
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Could not reach backend
                  </p>
                </div>
              </div>
            ) : (
              (() => {
                const h = healthQuery.data!;
                const allUp = h.data.database === "up" && h.data.redis === "up";
                const StatusIcon = h.data.degraded
                  ? AlertTriangle
                  : allUp
                    ? CheckCircle2
                    : XCircle;
                const statusColor = h.data.degraded
                  ? "text-amber-500"
                  : allUp
                    ? "text-emerald-500"
                    : "text-red-500";
                const statusBg = h.data.degraded
                  ? "bg-amber-500/10"
                  : allUp
                    ? "bg-emerald-500/10"
                    : "bg-red-500/10";
                const statusLabel = h.data.degraded
                  ? "Degraded"
                  : allUp
                    ? "All Systems Up"
                    : "Partial Outage";

                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center h-11 w-11 rounded-xl ${statusBg} ${statusColor}`}>
                        <StatusIcon className="w-5 h-5" />
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${statusColor}`}>
                          {statusLabel}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Redis {h.details.redis.latencyMs}ms
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <StatusBadge
                        label="Database"
                        status={h.data.database}
                      />
                      <StatusBadge
                        label="Redis"
                        status={h.data.redis}
                      />
                    </div>
                  </div>
                );
              })()
            )}
          </Panel>
        </Reveal>
      </Reveal>
    </div>
  );
};

const Home = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // The user record is only available after session restore completes.
  // Rendering either dashboard before that could fire a request for the
  // wrong endpoint (e.g. an employee hitting /dashboard/admin).
  if (!user) {
    return <FullPageLoader />;
  }

  if (user.role === "Employee") {
    return <EmployeeHome />;
  }

  if (user.role === "Manager") {
    return <ManagerHome />;
  }

  return <AdminHome />;
};

export default Home;
