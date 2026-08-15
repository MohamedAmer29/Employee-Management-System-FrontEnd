import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarCheck,
  UserCheck,
  UserX,
  ClockArrowDown,
  ClockArrowUp,
  RefreshCw,
  TrendingUp,
  CalendarDays,
  Clock3,
  Timer,
} from "lucide-react";
import {
  useMyAttendance,
  useMyAttendanceSummary,
  useCheckIn,
  useCheckOut,
} from "@/features/attendance/attendance.hooks";
import {
  DoughnutChartCard,
  LineChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import Avatar from "@/components/common/Avatar";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";

const formatTime = (time: string) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatUserNow = ({ hour, minute }: { hour: number; minute: number }) => {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatShortDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return `${MONTH_NAMES[month - 1]} ${day}`;
};

const MyAttendance = () => {
  const {
    data: records = [],
    isLoading: isRecordsLoading,
    isError: isRecordsError,
    refetch: refetchRecords,
  } = useMyAttendance();

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useMyAttendanceSummary();

  const employee = records[0]?.employee;

  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { mutate: checkOut, isPending: isCheckingOut } = useCheckOut();

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = useMemo(() => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const get = (type: string) =>
      parts.find((part) => part.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  }, [timeZone, now]);

  const nowTime = useMemo(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(now);
    return {
      hour: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
      minute: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
    };
  }, [timeZone, now]);

  const todayRecord = records.find((record) => record.date === todayStr);
  const checkedInToday = Boolean(todayRecord?.checkIn);
  const checkedOutToday = Boolean(todayRecord?.checkOut);
  const isAfterCheckInDeadline =
    nowTime.hour > 12 || (nowTime.hour === 12 && nowTime.minute > 0);

  const canCheckIn = !checkedInToday && !isAfterCheckInDeadline;
  const checkInMessage = checkedInToday
    ? "Already checked in"
    : isAfterCheckInDeadline
      ? "Didn't check in before 12:00 PM"
      : "";

  const isBeforeCheckOutTime = nowTime.hour < 16;

  const canCheckOut =
    checkedInToday && !checkedOutToday && !isBeforeCheckOutTime;
  const checkOutMessage = !checkedInToday
    ? "Didn't check in first"
    : checkedOutToday
      ? "Already checked out"
      : isBeforeCheckOutTime
        ? "Didn't come 4 o'clock yet"
        : "";

  const isPastAutoCheckOutTime =
    nowTime.hour > 18 || (nowTime.hour === 18 && nowTime.minute > 0);

  const autoCheckedOutDayRef = useRef<string>("");

  useEffect(() => {
    if (
      checkedInToday &&
      !checkedOutToday &&
      isPastAutoCheckOutTime &&
      autoCheckedOutDayRef.current !== todayStr
    ) {
      autoCheckedOutDayRef.current = todayStr;
      checkOut();
    }
  }, [checkedInToday, checkedOutToday, isPastAutoCheckOutTime, todayStr, checkOut]);

  const breakdownChartItems: ChartItem[] = useMemo(
    () =>
      summary
        ? [
            { label: "Present", value: summary.present, color: "#10B981" },
            { label: "Absent", value: summary.absent, color: "#EF4444" },
            { label: "Late", value: summary.late, color: "#F59E0B" },
            { label: "Leave", value: summary.leave, color: "#0EA5E9" },
          ]
        : [],
    [summary],
  );

  const timelinePoints = useMemo(() => {
    const byDate = new Map<string, { label: string; isPresent: boolean }>();
    for (const record of [...records].sort((a, b) =>
      a.date.localeCompare(b.date),
    )) {
      byDate.set(record.date, {
        label: formatShortDate(record.date),
        isPresent: record.isPresent,
      });
    }
    return [...byDate.values()];
  }, [records]);

  const presentTrend: ChartItem[] = useMemo(
    () =>
      timelinePoints.map((point) => ({
        label: point.label,
        value: point.isPresent ? 1 : 0,
        color: "#10B981",
      })),
    [timelinePoints],
  );

  const absentTrend: ChartItem[] = useMemo(
    () =>
      timelinePoints.map((point) => ({
        label: point.label,
        value: point.isPresent ? 0 : 1,
        color: "#EF4444",
      })),
    [timelinePoints],
  );

  const timelineSeries = useMemo(
    () => [
      { title: "Present", color: "#10B981", items: presentTrend },
      { title: "Absent", color: "#EF4444", items: absentTrend },
    ],
    [presentTrend, absentTrend],
  );

  const isLoading = isRecordsLoading || isSummaryLoading;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            My Attendance
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your attendance records and presence overview
          </p>
        </div>
      </div>

      {/* Employee card */}
      <section className="rounded-2xl bg-gradient-to-br from-dark via-primary-dark to-primary p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <Avatar
            name={employee?.fullName ?? summary?.employeeName}
            src={getAssetUrl(employee?.profilePicture)}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-extrabold truncate">
              {summary?.employeeName ?? employee?.fullName ?? "Employee"}
            </h2>
            <p className="text-sm text-white/75 mt-0.5">
              {employee?.position ?? "—"} ·{" "}
              {employee ? `ID #${employee.id}` : summary?.employeeId ? `ID #${summary.employeeId}` : "—"}
            </p>
            <p className="text-xs text-white/60 mt-0.5 truncate">
              {employee?.email ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 px-5 py-3 text-center">
            <p className="text-2xl font-extrabold">
              {summary ? (
                <AnimatedNumber value={summary.attendanceRate} />
              ) : (
                "—"
              )}
              {summary ? "%" : ""}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold mt-0.5">
              Attendance rate
            </p>
          </div>
        </div>
      </section>

      {/* Check in / Check out */}
      <section className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Today's Attendance
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDateInUserZone(todayStr, { dateOnly: true })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-50 tabular-nums">
              {formatUserNow(nowTime)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Current time
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Check In */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center justify-center h-11 w-11 rounded-xl shrink-0 ${
                  canCheckIn
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-gray-500/10 text-gray-400 dark:text-gray-500"
                }`}
              >
                <ClockArrowDown className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Check In
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {todayRecord?.checkIn
                    ? `Checked in at ${formatTime(todayRecord.checkIn)}`
                    : "Available until 12:00 PM"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => checkIn()}
              disabled={!canCheckIn || isCheckingIn}
              className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:cursor-not-allowed ${
                canCheckIn
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500"
              }`}
            >
              <ClockArrowDown className="w-4 h-4" aria-hidden="true" />
              {isCheckingIn ? "Checking in..." : "Check In"}
            </button>
            {!canCheckIn && checkInMessage && (
              <p
                className={`mt-2 text-center text-xs font-medium ${
                  checkedInToday
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {checkInMessage}
              </p>
            )}
          </div>
          {/* Check Out */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center justify-center h-11 w-11 rounded-xl shrink-0 ${
                  canCheckOut
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-gray-500/10 text-gray-400 dark:text-gray-500"
                }`}
              >
                <ClockArrowUp className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Check Out
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {todayRecord?.checkOut
                    ? `Checked out at ${formatTime(todayRecord.checkOut)}`
                    : checkedInToday
                      ? "You're checked in"
                      : "Check in first to check out"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => checkOut()}
              disabled={!canCheckOut || isCheckingOut}
              className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:cursor-not-allowed ${
                canCheckOut
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500"
              }`}
            >
              <ClockArrowUp className="w-4 h-4" aria-hidden="true" />
              {isCheckingOut ? "Checking out..." : "Check Out"}
            </button>
            {!canCheckOut && checkOutMessage && (
              <p
                className={`mt-2 text-center text-xs font-medium ${
                  checkedOutToday
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {checkOutMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Loading skeleton */}
      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          role="status"
          aria-label="Loading attendance summary"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse"
            >
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10" />
              <div className="mt-3 h-8 w-14 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      ) : isSummaryError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">
            Failed to load your attendance summary
          </p>
          <button
            type="button"
            onClick={() => refetchSummary()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      ) : (
        /* Stats */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary shrink-0">
              <TrendingUp className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary?.attendanceRate ?? 0} />%
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Attendance rate
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <UserCheck className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary?.present ?? 0} />
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Present
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
              <UserX className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary?.absent ?? 0} />
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Absent
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock3 className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary?.late ?? 0} />
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Late
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
              <CalendarDays className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary?.leave ?? 0} />
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                On leave
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Timer className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary?.totalWorkingDays ?? 0} />
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Working days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard
          title="Attendance Breakdown"
          items={breakdownChartItems}
        />
        {records.length > 0 ? (
          <LineChartCard
            title="Attendance Timeline"
            series={timelineSeries}
            pointDelay={60}
            duration={800}
          />
        ) : (
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
              Attendance Timeline
            </h2>
            <div className="flex items-center justify-center h-60 text-sm text-gray-400 dark:text-gray-500">
              No attendance records yet.
            </div>
          </div>
        )}
      </div>

      {/* Attendance records */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Attendance Records
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {records.length} record{records.length === 1 ? "" : "s"}
          </span>
        </div>
        {isRecordsLoading ? (
          <div
            className="flex items-center justify-center py-16"
            role="status"
            aria-label="Loading attendance records"
          >
            <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : isRecordsError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load your attendance records
            </p>
            <button
              type="button"
              onClick={() => refetchRecords()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
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
                      {record.status ? (
                        <AttendanceStatusBadge status={record.status} />
                      ) : record.isPresent ? (
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

export default MyAttendance;
