import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  UserCheck,
  UserX,
  ClockArrowDown,
  ClockArrowUp,
  Timer,
  RefreshCw,
  TrendingUp,
  Clock3,
  CalendarDays,
} from "lucide-react";
import {
  useManagerAttendance,
  useMyAttendanceSummary,
  useCheckIn,
  useCheckOut,
} from "@/features/attendance/attendance.hooks";
import {
  DoughnutChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import Avatar from "@/components/common/Avatar";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";
import Reveal from "@/components/common/Reveal";

const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const ManagerAttendance = () => {
  const navigate = useNavigate();
  const {
    data: records = [],
    isLoading,
    isError,
    refetch,
  } = useManagerAttendance();

  const stats = useMemo(() => {
    const present = records.filter((r) => r.isPresent).length;
    const absent = records.length - present;
    return { total: records.length, present, absent };
  }, [records]);

  const doughnutItems: ChartItem[] = useMemo(
    () => [
      { label: "Present", value: stats.present, color: "#10B981" },
      { label: "Absent", value: stats.absent, color: "#EF4444" },
    ],
    [stats],
  );

  const {
    data: summary,
  } = useMyAttendanceSummary();

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
  }, [
    checkedInToday,
    checkedOutToday,
    isPastAutoCheckOutTime,
    todayStr,
    checkOut,
  ]);

  const formatUserNow = ({ hour, minute }: { hour: number; minute: number }) => {
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
  };

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

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Loading attendance"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load attendance records.
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Reveal y={20}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Attendance
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Team attendance overview
          </p>
        </div>
      </div>
      </Reveal>

      {/* Employee card */}
      <Reveal>
      <section className="rounded-2xl bg-gradient-to-br from-dark via-primary-dark to-primary p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <Avatar
            name={summary?.employeeName ?? records[0]?.employee.fullName}
            src={getAssetUrl(records[0]?.employee.profilePicture)}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-extrabold truncate">
              {summary?.employeeName ?? records[0]?.employee.fullName ?? "Manager"}
            </h2>
            <p className="text-sm text-white/75 mt-0.5">
              {records[0]?.employee.position ?? "—"} ·{" "}
              {records[0]?.employee.id ? `ID #${records[0].employee.id}` : "—"}
            </p>
            <p className="text-xs text-white/60 mt-0.5 truncate">
              {records[0]?.employee.email ?? "—"}
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
      </Reveal>

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

      {/* My Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DoughnutChartCard
          title="Attendance Breakdown"
          items={breakdownChartItems}
        />
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
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
      </div>

      {/* Stats */}
      <Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <Timer className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.total} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total records
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={stats.present} />
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
              <AnimatedNumber value={stats.absent} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Absent
            </p>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Chart + Records */}
      <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DoughnutChartCard title="Present vs Absent" items={doughnutItems} />

        {/* Records */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Attendance Records
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {records.length} record{records.length === 1 ? "" : "s"}
            </span>
          </div>
          {records.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No attendance records found.
              </p>
            </div>
          ) : (
            <div className="table-scrollbar max-h-[65vh] overflow-auto">
              <table className="w-full min-w-[700px]">
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {records.map((record) => (
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
                          {formatDateInUserZone(record.date, {
                            dateOnly: true,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <ClockArrowDown
                            className="w-4 h-4 text-sky-500 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {record.checkIn
                              ? formatTime(record.checkIn)
                              : "—"}
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
                            {record.checkOut
                              ? formatTime(record.checkOut)
                              : "—"}
                          </span>
                        </div>
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
      </Reveal>
    </div>
  );
};

export default ManagerAttendance;
