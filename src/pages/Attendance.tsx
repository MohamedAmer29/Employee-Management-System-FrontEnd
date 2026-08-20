import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  UserCheck,
  UserX,
  Timer,
  ClockArrowDown,
  ClockArrowUp,
  RefreshCw,
  Users,
  TrendingUp,
  Building2,
  CalendarDays,
  CalendarRange,
  UserMinus,
} from "lucide-react";
import {
  useAttendanceTrend,
  useAttendance,
  useAttendanceSummary,
  useEmployeeAttendanceSummary,
} from "@/features/attendance/attendance.hooks";
import { useEmployees } from "@/features/employees/employees.hooks";
import {
  DoughnutChartCard,
  LineChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import Avatar from "@/components/common/Avatar";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { getAssetUrl } from "@/utils/assetUrl";
import type { AttendancePeriod } from "@/api/user.api";
import Reveal from "@/components/common/Reveal";
import { formatDateInUserZone } from "@/utils/formatDate";

const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const periodOptions: { value: AttendancePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

const Attendance = () => {
  const [period, setPeriod] = useState<AttendancePeriod>("today");
  const navigate = useNavigate();
  const [summaryDate, setSummaryDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().slice(0, 10);
  });

  const {
    data: daySummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useAttendanceSummary(summaryDate);

  const {
    data: trendData,
    isLoading: isTrendLoading,
    isError: isTrendError,
    refetch: refetchTrend,
  } = useAttendanceTrend(period);

  const {
    data: attendance = [],
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
    refetch: refetchAttendance,
  } = useAttendance();

  const [summaryEmployeeId, setSummaryEmployeeId] = useState("");

  const { data: employees = [] } = useEmployees();

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        id: employee.id,
        name: employee.fullName,
      })),
    [employees],
  );

  const effectiveEmployeeId =
    summaryEmployeeId || (employeeOptions[0]?.id?.toString() ?? "");

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => employee.id === Number(effectiveEmployeeId),
      ) ?? null,
    [employees, effectiveEmployeeId],
  );

  const {
    data: employeeSummary,
    isLoading: isEmployeeSummaryLoading,
    isError: isEmployeeSummaryError,
    refetch: refetchEmployeeSummary,
  } = useEmployeeAttendanceSummary(effectiveEmployeeId || undefined);

  const employeeSummaryChartItems: ChartItem[] = useMemo(
    () =>
      employeeSummary
        ? [
            {
              label: "Present",
              value: employeeSummary.present,
              color: "#10B981",
            },
            {
              label: "Absent",
              value: employeeSummary.absent,
              color: "#EF4444",
            },
            {
              label: "Late",
              value: employeeSummary.late,
              color: "#F59E0B",
            },
            {
              label: "Leave",
              value: employeeSummary.leave,
              color: "#0EA5E9",
            },
          ]
        : [],
    [employeeSummary],
  );

  const presentChartItems: ChartItem[] = useMemo(
    () =>
      trendData?.attendanceTrend.map((point) => ({
        label: formatDateInUserZone(point.date, { dateOnly: true }),
        value: point.present,
        color: "#10B981",
      })) ?? [],
    [trendData],
  );

  const absentChartItems: ChartItem[] = useMemo(
    () =>
      trendData?.attendanceTrend.map((point) => ({
        label: formatDateInUserZone(point.date, { dateOnly: true }),
        value: point.absent,
        color: "#EF4444",
      })) ?? [],
    [trendData],
  );

  const departmentChartItems: ChartItem[] = useMemo(
    () =>
      (trendData?.departments ?? []).map((dept) => ({
        label: dept.departmentName,
        value: dept.present,
        color:
          dept.attendanceRate >= 80
            ? "#10B981"
            : dept.attendanceRate >= 50
              ? "#F59E0B"
              : "#EF4444",
      })),
    [trendData],
  );

  const summary = trendData?.summary;

  const summaryChartItems: ChartItem[] = useMemo(
    () =>
      daySummary
        ? [
            { label: "Present", value: daySummary.present, color: "#10B981" },
            { label: "Absent", value: daySummary.absent, color: "#EF4444" },
            { label: "Late", value: daySummary.late, color: "#F59E0B" },
            { label: "On Leave", value: daySummary.onLeave, color: "#0EA5E9" },
          ]
        : [],
    [daySummary],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Reveal y={20}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              Attendance
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track employee attendance and presence trends
            </p>
          </div>
        </div>
      </Reveal>

      {/* Quick links */}
      <Reveal stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate("/attendance/today")}
          className="group rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm text-left hover:border-primary/40 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Today's Attendance
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Live snapshot for today
              </p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate("/attendance/monthly")}
          className="group rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm text-left hover:border-primary/40 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/15 text-primary">
              <CalendarRange className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Monthly Attendance
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Per-employee monthly view
              </p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate("/attendance/absent")}
          className="group rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm text-left hover:border-primary/40 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400">
              <UserMinus className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Absent
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                List of absent employees
              </p>
            </div>
          </div>
        </button>
      </Reveal>

      {/* Stats */}
      <Reveal stagger className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <TrendingUp className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {summary ? `${summary.attendanceRate}%` : "—"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Attendance rate
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {summary?.totalPresent ?? "—"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Present
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400">
            <UserX className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {summary?.totalAbsent ?? "—"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Absent
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <ClockArrowDown className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {summary?.totalLate ?? "—"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Late
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <ClockArrowUp className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {summary?.totalLeave ?? "—"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              On leave
            </p>
          </div>
        </div>
      </Reveal>

      {/* Trend */}
      <Reveal>
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/15 text-primary">
              <CalendarCheck className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Attendance Trend
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Present vs absent over the selected period
              </p>
            </div>
          </div>
          <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 p-1">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  period === option.value
                    ? "bg-white dark:bg-dark-surface text-primary shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {isTrendLoading ? (
            <div
              className="flex items-center justify-center py-16"
              role="status"
              aria-label="Loading attendance trend"
            >
              <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : isTrendError ? (
            <div className="py-10 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load attendance trend
              </p>
              <button
                type="button"
                onClick={() => refetchTrend()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : presentChartItems.length > 0 ? (
            <LineChartCard
              title="Present vs Absent"
              series={[
                {
                  title: "Present",
                  color: "#10B981",
                  items: presentChartItems,
                },
                { title: "Absent", color: "#EF4444", items: absentChartItems },
              ]}
              pointDelay={period === "year" ? 20 : 100}
              duration={period === "year" ? 300 : 1000}
            />
          ) : (
            <div className="py-10 text-center">
              <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No attendance data for this period.
              </p>
            </div>
          )}
        </div>
        </div>
      </Reveal>

      {/* Departments breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard
          title="Present by Department"
          items={departmentChartItems}
        />
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Department Breakdown
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Present / absent / late / on-leave per department
            </p>
          </div>
          {departmentChartItems.length > 0 ? (
            <div className="table-scrollbar overflow-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {trendData?.departments.map((dept) => (
                    <tr
                      key={dept.departmentId}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2
                            className="w-4 h-4 text-gray-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {dept.departmentName}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {dept.present} present · {dept.absent} absent ·{" "}
                          {dept.late} late · {dept.onLeave} on leave
                        </p>
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {dept.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No department data for this period.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Day Summary */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Daily Attendance Summary
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Summary for a specific day
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={summaryDate}
              max="9999-12-31"
              onChange={(e) => setSummaryDate(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={() => refetchSummary()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Refresh summary"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {isSummaryLoading ? (
            <div
              className="flex items-center justify-center py-16"
              role="status"
              aria-label="Loading attendance summary"
            >
              <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : isSummaryError ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load attendance summary
              </p>
              <button
                type="button"
                onClick={() => refetchSummary()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : daySummary ? (
            <div
              key={summaryDate}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <DoughnutChartCard
                title="Attendance Breakdown"
                items={summaryChartItems}
              />
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    <AnimatedNumber value={daySummary.totalEmployees} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total employees
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    <AnimatedNumber value={daySummary.present} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Present
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    <AnimatedNumber value={daySummary.absent} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Absent
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    <AnimatedNumber value={daySummary.late} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Late
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                    <AnimatedNumber value={daySummary.onLeave} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    On leave
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <p className="text-2xl font-bold text-primary">
                    <AnimatedNumber value={daySummary.workingDays} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Working days
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-3 rounded-2xl bg-primary/5 border border-primary/15 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Attendance rate
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {daySummary.date}
                    </p>
                  </div>
                  <p className="text-3xl font-extrabold text-primary">
                    <AnimatedNumber value={daySummary.attendanceRate} />%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No summary data for the selected date.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Employee Summary */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Employee Attendance Summary
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Monthly summary for a selected employee
            </p>
          </div>
          <select
            value={effectiveEmployeeId}
            onChange={(e) => setSummaryEmployeeId(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {employees.length === 0 && (
              <option value="">No employees</option>
            )}
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                #{employee.id} · {employee.fullName} · {employee.email}
              </option>
            ))}
          </select>
        </div>
        <div className="p-6">
          {isEmployeeSummaryLoading ? (
            <div
              className="flex items-center justify-center py-16"
              role="status"
              aria-label="Loading employee attendance summary"
            >
              <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : isEmployeeSummaryError ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load employee attendance summary
              </p>
              <button
                type="button"
                onClick={() => refetchEmployeeSummary()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : employeeSummary ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DoughnutChartCard
                title="Attendance Breakdown"
                items={employeeSummaryChartItems}
              />
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 rounded-2xl bg-primary/5 border border-primary/15 p-5 flex items-center gap-4">
                  <Avatar
                    name={selectedEmployee?.fullName}
                    src={getAssetUrl(selectedEmployee?.profilePicture)}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-50 truncate">
                      {selectedEmployee?.fullName ?? employeeSummary.employeeName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      ID #{employeeSummary.employeeId} · {selectedEmployee?.role ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {selectedEmployee?.email ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedEmployee?.position ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    <AnimatedNumber value={employeeSummary.present} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Present
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    <AnimatedNumber value={employeeSummary.absent} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Absent
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    <AnimatedNumber value={employeeSummary.late} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Late
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                  <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                    <AnimatedNumber value={employeeSummary.leave} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Leave
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    <AnimatedNumber value={employeeSummary.totalWorkingDays} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total working days
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                  <p className="text-2xl font-bold text-primary">
                    <AnimatedNumber value={employeeSummary.attendanceRate} />%
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Attendance rate
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No employee selected or no summary data available.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Attendance records */}
      <Reveal>
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Attendance Records
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {attendance.length} record{attendance.length === 1 ? "" : "s"}
          </span>
        </div>
        {isAttendanceLoading ? (
          <div
            className="flex items-center justify-center py-16"
            role="status"
            aria-label="Loading attendance records"
          >
            <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : isAttendanceError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load attendance records
            </p>
            <button
              type="button"
              onClick={() => refetchAttendance()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : attendance.length === 0 ? (
          <div className="py-12 text-center">
            <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No attendance records found.
            </p>
          </div>
        ) : (
          <div className="table-scrollbar max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[760px]">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {attendance.map((record) => (
                  <tr
                    key={record.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      navigate(`/attendance/${record.employee.id}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/attendance/${record.employee.id}`);
                      }
                    }}
                    className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-primary/5 dark:focus-visible:bg-white/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={record.employee.fullName}
                          src={getAssetUrl(record.employee.profilePicture)}
                          size="md"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {record.employee.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {record.employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDateInUserZone(record.date, { dateOnly: true })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <ClockArrowDown
                          className="w-4 h-4 text-sky-500 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {record.checkIn ? formatTime(record.checkIn) : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <ClockArrowUp
                          className="w-4 h-4 text-amber-500 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {record.checkOut ? formatTime(record.checkOut) : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {record.employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      {record.isPresent ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <span
                            className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                            aria-hidden="true"
                          />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                          <span
                            className="h-2 w-2 rounded-full bg-red-500"
                            aria-hidden="true"
                          />
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </Reveal>
    </div>
  );
};

export default Attendance;
