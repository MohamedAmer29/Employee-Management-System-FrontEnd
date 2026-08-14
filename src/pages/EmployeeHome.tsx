import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ClockArrowDown,
  ClockArrowUp,
  Bell,
  Building2,
  Briefcase,
  CalendarClock,
  Star,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useCurrentUser } from "@/features/user/user.hooks";
import { useEmployeeDashboard } from "@/features/dashboard/dashboard.hooks";
import StatCard from "@/components/dashboard/StatCard";
import {
  DoughnutChartCard,
  LineChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import { formatDateInUserZone } from "@/utils/formatDate";

const formatTime = (time: string | null) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
      {title}
    </h2>
    {children}
  </section>
);

const EmployeeHome = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserQuery = useCurrentUser();
  const dashboardQuery = useEmployeeDashboard();

  const dashboard = dashboardQuery.data;
  const displayName =
    dashboard?.employee.name ||
    currentUserQuery.data?.firstName ||
    user?.firstName ||
    user?.username ||
    "there";

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
          ]
        : [],
    [dashboard],
  );

  const statCards = [
    {
      icon: TrendingUp,
      label: "Attendance Rate",
      value: dashboard ? `${dashboard.attendance.attendanceRate}%` : "—",
      hint: dashboard
        ? `${dashboard.attendance.monthlyRate}% this month`
        : undefined,
      accentClass: "bg-primary/10 text-primary",
    },
    {
      icon: CalendarCheck,
      label: "Present Today",
      value: dashboard?.attendance.presentToday ?? "—",
      hint: dashboard
        ? `${dashboard.attendance.absentToday} absent today`
        : undefined,
      accentClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: CalendarDays,
      label: "Leave Approved",
      value: dashboard?.leave.approved ?? "—",
      hint: dashboard
        ? `${dashboard.leave.pending} pending · ${dashboard.leave.rejected} rejected`
        : undefined,
      accentClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      icon: Star,
      label: "Performance",
      value:
        dashboard && dashboard.performance.averageRating > 0
          ? `${dashboard.performance.averageRating.toFixed(1)} / 5`
          : "—",
      hint: dashboard
        ? `${dashboard.performance.totalReviews} reviews · ${dashboard.performance.reviewsThisMonth} this month`
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
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  ) : null;

  const latestNotifications = dashboard?.notifications.latest ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
          My Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your personal attendance and performance overview.
        </p>
      </div>

      <section className="rounded-2xl bg-gradient-to-br from-dark via-primary-dark to-primary p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute top-10 right-20 h-20 w-20 rounded-full bg-white/5" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/80">Welcome back,</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {displayName} 👋
            </h2>
            {dashboard && (
              <p className="text-sm text-white/75 mt-2 max-w-xl">
                {dashboard.employee.position} · {dashboard.employee.department}
                {dashboard.employee.hireDate
                  ? ` · Hired ${formatDateInUserZone(dashboard.employee.hireDate, { dateOnly: true })}`
                  : ""}
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 px-5 py-4">
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider">
              <ClockArrowDown className="w-4 h-4" />
              Today's status
            </div>
            <div className="mt-2">
              <AttendanceStatusBadge
                status={dashboard?.attendance.today.status ?? "UPCOMING"}
              />
            </div>
          </div>
        </div>
      </section>

      {loadError}

      {dashboardQuery.isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
          role="status"
          aria-label="Loading dashboard"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse"
            >
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10" />
              <div className="mt-2 h-7 w-16 rounded bg-gray-200 dark:bg-white/10" />
              <div className="mt-2 h-3 w-32 rounded bg-gray-200 dark:bg-white/10" />
            </div>
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

      {/* Today's check-in / check-out */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <Panel title="Today's Attendance">
          {dashboardQuery.isLoading ? (
            <div className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-2 text-sky-500">
                  <ClockArrowDown className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Check In
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-50">
                  {formatTime(dashboard?.attendance.today.checkIn ?? null)}
                </p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <ClockArrowUp className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Check Out
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-50">
                  {formatTime(dashboard?.attendance.today.checkOut ?? null)}
                </p>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Personal Info">
          {dashboardQuery.isLoading ? (
            <div className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                  <Briefcase className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    {dashboard?.employee.position ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Position
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    {dashboard?.employee.department ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Department
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <CalendarClock className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    {dashboard?.employee.hireDate
                      ? formatDateInUserZone(dashboard.employee.hireDate, {
                          dateOnly: true,
                        })
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hire date
                  </p>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {dashboardQuery.isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
          role="status"
          aria-label="Loading charts"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse"
            >
              <div className="h-3 w-32 rounded bg-gray-200 dark:bg-white/10" />
              <div className="mt-4 h-40 rounded-lg bg-gray-200 dark:bg-white/10" />
            </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Recent activities */}
        <div className="xl:col-span-2">
          <Panel title="Recent Activities">
            {dashboardQuery.isLoading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-4 rounded bg-gray-200 dark:bg-white/10" />
                ))}
              </div>
            ) : (dashboard?.recentActivities ?? []).length ? (
              <ul className="space-y-4">
                {(dashboard?.recentActivities ?? []).slice(0, 7).map((activity) => (
                  <li key={activity.id} className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-gray-500/10 text-gray-500 dark:text-gray-400 shrink-0">
                      <Users className="w-4 h-4" aria-hidden="true" />
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
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                No recent activity yet.
              </p>
            )}
          </Panel>
        </div>

        {/* Notifications + latest review */}
        <div className="space-y-4 sm:space-y-5">
          <Panel title="Notifications">
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer mb-2"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Bell className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {dashboard?.notifications.unread ?? 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Unread notifications
                </p>
              </div>
            </div>
            {latestNotifications.length > 0 && (
              <ul className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                {latestNotifications.slice(0, 3).map((notification) => (
                  <li key={notification.id} className="text-sm">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Latest Review">
            {dashboardQuery.isLoading ? (
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
            ) : dashboard?.performance.latestReview ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Star className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                      {dashboard.performance.latestReview.rating} / 5
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Reviewed{" "}
                      {formatDateInUserZone(
                        dashboard.performance.latestReview.reviewDate,
                        { dateOnly: true },
                      )}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {dashboard.performance.latestReview.feedback || "No feedback."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                No performance review yet.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;