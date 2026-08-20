import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  UserCheck,
  UserX,
  ClockArrowDown,
  Users,
  ChevronDown,
  ChevronUp,
  CalendarRange,
  Search,
} from "lucide-react";
import { useMonthlyAttendance } from "@/features/attendance/attendance.hooks";
import { useDepartments, useEmployees } from "@/features/employees/employees.hooks";
import type {
  MonthlyAttendanceEmployee,
  MonthlyDayAttendance,
} from "@/api/user.api";
import {
  DoughnutChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import Reveal from "@/components/common/Reveal";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const statusColor: Record<string, string> = {
  PRESENT: "bg-emerald-500",
  ABSENT: "bg-red-500",
  ON_LEAVE: "bg-sky-500",
  LATE: "bg-amber-500",
  WEEKEND: "bg-gray-400",
  UPCOMING: "bg-gray-200 dark:bg-gray-700",
};

const statusTitle: Record<string, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  ON_LEAVE: "On leave",
  LATE: "Late",
  WEEKEND: "Weekend",
  UPCOMING: "Upcoming",
};

const normalize = (status: string) =>
  (status ?? "").toUpperCase().replace(/\s+/g, "_");

const MonthlyAttendance = () => {
  const navigate = useNavigate();
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [departmentId, setDepartmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useMonthlyAttendance({
    month,
    year,
    departmentId: departmentId || undefined,
    employeeId: employeeId || undefined,
    search: search.trim() || undefined,
  });

  const summaryItems: ChartItem[] = useMemo(
    () =>
      data
        ? [
            {
              label: "Present",
              value: data.summary.totalPresent,
              color: "#10B981",
            },
            {
              label: "Absent",
              value: data.summary.totalAbsent,
              color: "#EF4444",
            },
            {
              label: "Late",
              value: data.summary.totalLate,
              color: "#F59E0B",
            },
            {
              label: "On leave",
              value: data.summary.totalLeave,
              color: "#0EA5E9",
            },
          ]
        : [],
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
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer mb-3"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Attendance
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
                Monthly Attendance
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Per-employee attendance for a selected month
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={index} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Year
            </label>
            <input
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 w-28"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="">All departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Employee
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 min-w-[200px]"
            >
              <option value="">All employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  #{employee.id} · {employee.fullName} · {employee.role}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Search
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Employee name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-24"
          role="status"
          aria-label="Loading monthly attendance"
        >
          <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">
            We couldn't load the monthly attendance.
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
          <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DoughnutChartCard title="Monthly Breakdown" items={summaryItems} />
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {MONTH_LABELS[data.month - 1]} {data.year}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Period
                </p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-2">
                  <AnimatedNumber value={data.summary.totalEmployees} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Employees
                </p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2">
                  <UserCheck
                    className="w-5 h-5 text-emerald-500"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  <AnimatedNumber value={data.summary.totalPresent} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Present
                </p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-red-500" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                  <AnimatedNumber value={data.summary.totalAbsent} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Absent
                </p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2">
                  <ClockArrowDown
                    className="w-5 h-5 text-amber-500"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                  <AnimatedNumber value={data.summary.totalLate} />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Late
                </p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <p className="text-2xl font-bold text-primary">
                  <AnimatedNumber value={data.summary.overallAttendanceRate} />%
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Rate
                </p>
              </div>
            </div>
          </div>
          </Reveal>

          <Reveal>
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Employees
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {data.employees.length} employee
                {data.employees.length === 1 ? "" : "s"}
              </span>
            </div>
            {data.employees.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No employees found for the selected month.
                </p>
              </div>
            ) : (
              <div className="table-scrollbar overflow-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Present
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Absent
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Leave
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Late
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.employees.map((employee) => {
                      const isOpen = expanded === employee.employeeId;
                      return (
                        <EmployeeRow
                          key={employee.employeeId}
                          employee={employee}
                          open={isOpen}
                          onToggle={() =>
                            setExpanded(isOpen ? null : employee.employeeId)
                          }
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </Reveal>
        </>
      ) : (
        <div className="py-16 text-center">
          <CalendarRange className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No monthly attendance data available.
          </p>
        </div>
      )}
    </div>
  );
};

const EmployeeRow = ({
  employee,
  open,
  onToggle,
}: {
  employee: MonthlyAttendanceEmployee;
  open: boolean;
  onToggle: () => void;
}) => (
  <>
    <tr
      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {employee.employeeName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {employee.position} · {employee.department}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        {employee.summary.present}
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle text-sm font-semibold text-red-600 dark:text-red-400">
        {employee.summary.absent}
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle text-sm font-semibold text-sky-600 dark:text-sky-400">
        {employee.summary.leave}
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle text-sm font-semibold text-amber-600 dark:text-amber-400">
        {employee.summary.late}
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          {employee.summary.attendanceRate}%
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle text-right">
        {open ? (
          <ChevronUp
            className="w-4 h-4 inline text-gray-400"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            className="w-4 h-4 inline text-gray-400"
            aria-hidden="true"
          />
        )}
      </td>
    </tr>
    {open && (
      <tr>
        <td colSpan={7} className="px-6 py-5 bg-gray-50/50 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Day-by-day attendance
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-2">
            {(employee.attendance ?? []).map((day) => (
              <DayCell key={day.date} day={day} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            {Object.entries(statusTitle).map(([key, label]) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${statusColor[key]}`}
                />
                {label}
              </span>
            ))}
          </div>
        </td>
      </tr>
    )}
  </>
);

const DayCell = ({ day }: { day: MonthlyDayAttendance }) => {
  const key = normalize(day.status);
  return (
    <div
      title={`${day.date} · ${statusTitle[key] ?? day.status}`}
      className={`rounded-lg p-2 text-center ${statusColor[key] ?? "bg-gray-200 dark:bg-gray-700"}`}
    >
      <p className="text-[10px] font-bold text-white">{day.day.slice(0, 3)}</p>
      <p className="text-[10px] text-white/80">{day.date.slice(8, 10)}</p>
    </div>
  );
};

export default MonthlyAttendance;
