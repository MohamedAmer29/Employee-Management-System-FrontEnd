import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  UserCheck,
  UserX,
  ClockArrowDown,
  ClockArrowUp,
  Timer,
  Users,
  CalendarCheck,
  TrendingUp,
  BellRing,
} from "lucide-react";
import { useTodayAttendance } from "@/features/attendance/attendance.hooks";
import {
  DoughnutChartCard,
  BarChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import Reveal from "@/components/common/Reveal";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";

const formatTime = (time: string | null) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const TodayAttendance = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useTodayAttendance();

  const breakdownItems: ChartItem[] = useMemo(
    () =>
      data
        ? [
            { label: "Present", value: data.present, color: "#10B981" },
            { label: "Absent", value: data.absent, color: "#EF4444" },
            { label: "Late", value: data.late, color: "#F59E0B" },
            { label: "On Leave", value: data.onLeave, color: "#0EA5E9" },
          ]
        : [],
    [data],
  );

  const departmentItems: ChartItem[] = useMemo(
    () =>
      (data?.departments ?? []).map((dept) => ({
        label: dept.department,
        value: dept.present,
        color:
          dept.attendanceRate >= 80
            ? "#10B981"
            : dept.attendanceRate >= 50
              ? "#F59E0B"
              : "#EF4444",
      })),
    [data],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Reveal y={20}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <button
                type="button"
                onClick={() => navigate("/attendance")}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer mb-3 "
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Attendance
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
                Today's Attendance
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Live attendance snapshot for today
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-24"
          role="status"
          aria-label="Loading today's attendance"
        >
          <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">
            We couldn't load today's attendance.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      ) : data ? (
        <>
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {data.date}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Expected
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                  {data.totalExpected} / {data.totalEmployees}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Working days
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                  {data.workingDays}
                </p>
              </div>
            </div>
          </div>

          <Reveal stagger className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
              <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  <AnimatedNumber value={data.present} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Present
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
              <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400">
                <UserX className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  <AnimatedNumber value={data.absent} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Absent
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
              <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <ClockArrowDown className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  <AnimatedNumber value={data.late} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Late
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
              <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <ClockArrowUp className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  <AnimatedNumber value={data.onLeave} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  On leave
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
              <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
                <TrendingUp className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-primary">
                  <AnimatedNumber value={data.attendanceRate} />%
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Rate
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                On time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {data.onTime}
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Checked in
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {data.checkedInToday}
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Checked out
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {data.checkedOutToday}
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Not checked in
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {data.notCheckedIn.length}
              </p>
            </div>
          </div>

          <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DoughnutChartCard
              title="Attendance Breakdown"
              items={breakdownItems}
            />
            <BarChartCard
              title="Present by Department"
              items={departmentItems}
            />
          </div>
          </Reveal>

          {data.notCheckedIn.length > 0 && (
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <BellRing
                  className="w-5 h-5 text-amber-500"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Not Checked In
                </h2>
              </div>
              <div className="table-scrollbar overflow-auto">
                <table className="w-full min-w-[480px]">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Department
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.notCheckedIn.map((item) => (
                      <tr
                        key={item.employeeId}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.employeeName}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {item.department}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Reveal>
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Today's Records
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {data.attendance.length} record
                {data.attendance.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="table-scrollbar max-h-[65vh] overflow-auto">
              <table className="w-full min-w-[720px]">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
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
                  {data.attendance.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap align-middle text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {record.employeeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle text-sm text-gray-600 dark:text-gray-300">
                        {record.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle text-sm text-gray-600 dark:text-gray-300">
                        {formatTime(record.checkIn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle text-sm text-gray-600 dark:text-gray-300">
                        {formatTime(record.checkOut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <AttendanceStatusBadge status={record.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.attendance.length === 0 && (
              <div className="py-12 text-center">
                <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No attendance records for today.
                </p>
              </div>
            )}
          </div>
          </Reveal>
        </>
      ) : (
        <div className="py-16 text-center">
          <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4 inline-block mr-1" />
            No attendance data available.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayAttendance;
