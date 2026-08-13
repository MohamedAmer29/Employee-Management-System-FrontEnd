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
} from "lucide-react";
import {
  useAttendanceTrend,
  useAttendance,
} from "@/features/attendance/attendance.hooks";
import { BarChartCard, type ChartItem } from "@/components/dashboard/charts";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import type { AttendancePeriod } from "@/api/user.api";
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

  const stats = useMemo(() => {
    const present = attendance.filter((record) => record.isPresent).length;
    const absent = attendance.length - present;
    const checkedIn = attendance.filter((record) => record.checkIn).length;
    const checkedOut = attendance.filter((record) => record.checkOut).length;
    return { total: attendance.length, present, absent, checkedIn, checkedOut };
  }, [attendance]);

    return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <Users className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.total}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.present}
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
              {stats.absent}
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
              {stats.checkedIn}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Checked in
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <ClockArrowUp className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.checkedOut}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Checked out
            </p>
          </div>
        </div>
      </div>

      {/* Trend */}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChartCard title="Present" items={presentChartItems} />
              <BarChartCard title="Absent" items={absentChartItems} />
            </div>
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

      {/* Attendance records */}
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
                    onClick={() => navigate(`/attendance/${record.employee.id}`)}
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
                        <ClockArrowDown className="w-4 h-4 text-sky-500 shrink-0" aria-hidden="true" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {record.checkIn ? formatTime(record.checkIn) : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <ClockArrowUp className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
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
    </div>
  );
};

export default Attendance;