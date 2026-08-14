import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  UserX,
  CalendarDays,
} from "lucide-react";
import { useAbsentAttendance } from "@/features/attendance/attendance.hooks";
import { useDepartments, useEmployees } from "@/features/employees/employees.hooks";
import { BarChartCard, type ChartItem } from "@/components/dashboard/charts";

const formatTime = (time: string | null) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const AbsentAttendance = () => {
  const navigate = useNavigate();
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, refetch } = useAbsentAttendance({
    page,
    limit,
    search: search.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    departmentId: departmentId || undefined,
    employeeId: employeeId || undefined,
  });

  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;

  const deptChartItems: ChartItem[] = useMemo(() => {
    const counts: Record<string, number> = {};
    (data?.data ?? []).forEach((record) => {
      counts[record.department] = (counts[record.department] ?? 0) + 1;
    });
    return Object.entries(counts).map(([label, value], index) => ({
      label,
      value,
      color: ["#EF4444", "#F59E0B", "#0EA5E9", "#8B5CF6", "#10B981"][index % 5],
    }));
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
              Absent
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Records of absent employees
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
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
                placeholder="Employee name"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setPage(1);
              }}
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
        </div>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-24"
          role="status"
          aria-label="Loading absent attendance"
        >
          <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">
            We couldn't load the absent attendance.
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <BarChartCard
              title="Absent by Department"
              items={deptChartItems}
              height={260}
            />
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-red-500" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {data.pagination.total}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Absent records
                </p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    className="w-5 h-5 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-2">
                  {data.workingDays}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Working days
                </p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {data.pagination.totalPages}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pages
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Absent Records
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {data.data.length} on page {data.pagination.page}
              </span>
            </div>
            {data.data.length === 0 ? (
              <div className="py-12 text-center">
                <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No absent records found.
                </p>
              </div>
            ) : (
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
                    {data.data.map((record) => (
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
                          {record.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle text-sm text-gray-600 dark:text-gray-300">
                          {formatTime(record.checkIn)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle text-sm text-gray-600 dark:text-gray-300">
                          {formatTime(record.checkOut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                            Absent
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Rows per page
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {total} total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {data.pagination.page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AbsentAttendance;
