import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  Users,
  Banknote,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useManagerPayrollSummary, useManagerPayrollList } from "@/features/payroll/payroll.hooks";
import type { PayrollStatus } from "@/api/user.api";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import {
  DoughnutChartCard,
  BarChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import { formatDateInUserZone } from "@/utils/formatDate";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import Reveal from "@/components/common/Reveal";

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "CALCULATED", label: "Calculated" },
  { value: "APPROVED", label: "Approved" },
  { value: "PAID", label: "Paid" },
];

const monthOptions = [
  { value: "", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getStatusBadge = (status: PayrollStatus) => {
  switch (status) {
    case "PAID":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "CALCULATED":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
    case "DRAFT":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "APPROVED":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  }
};

const ManagerPayroll = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const years: { value: string; label: string }[] = [{ value: "", label: "All years" }];
    for (let y = current; y >= current - 5; y--) {
      years.push({ value: String(y), label: String(y) });
    }
    return years;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      status: (statusFilter || undefined) as PayrollStatus | undefined,
      month: monthFilter ? Number(monthFilter) : undefined,
      year: yearFilter ? Number(yearFilter) : undefined,
    }),
    [page, limit, debouncedSearch, statusFilter, monthFilter, yearFilter],
  );

  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError, refetch: refetchSummary } =
    useManagerPayrollSummary(params);
  const { data, isLoading, isError, refetch } = useManagerPayrollList(params);

  const records = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const statusChartItems: ChartItem[] = useMemo(() => {
    if (!records.length) return [];
    const paid = records.filter((r) => r.status === "PAID").length;
    const calculated = records.filter((r) => r.status === "CALCULATED").length;
    const draft = records.filter((r) => r.status === "DRAFT").length;
    const approved = records.filter((r) => r.status === "APPROVED").length;
    return [
      { label: "Paid", value: paid, color: "#10B981" },
      { label: "Calculated", value: calculated, color: "#0EA5E9" },
      { label: "Draft", value: draft, color: "#F59E0B" },
      { label: "Approved", value: approved, color: "#8B5CF6" },
    ];
  }, [records]);

  const salaryChartItems: ChartItem[] = useMemo(() => {
    if (!records.length) return [];
    const grouped: Record<string, number> = {};
    records.forEach((r) => {
      const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
      grouped[key] = (grouped[key] ?? 0) + r.netSalary;
    });
    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
    return sorted.map(([key, value]) => ({
      label: key,
      value,
      color: "#2196F3",
    }));
  }, [records]);

  const startIndex = (page - 1) * limit + 1;

  if (isError || isSummaryError) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load payroll data.
        </p>
        <button
          type="button"
          onClick={() => { refetch(); refetchSummary(); }}
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Department Payroll
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Overview of payroll records for your department
          </p>
        </div>
      </div>
      </Reveal>

      {/* Stats from API */}
      <Reveal>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isSummaryLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4 animate-pulse"
              >
                <span className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-white/10 shrink-0" />
                <div className="space-y-2">
                  <span className="block h-7 w-12 rounded bg-gray-200 dark:bg-white/10" />
                  <span className="block h-3 w-16 rounded bg-gray-200 dark:bg-white/10" />
                </div>
              </div>
            ))
          : summary && (
              <>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                  <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
                    <Users className="w-6 h-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                      <AnimatedNumber value={summary.totalEmployees} />
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Total Employees
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                  <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-6 h-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                      <AnimatedNumber value={summary.totalNetSalary} />
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Net Salary
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                  <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                      <AnimatedNumber value={summary.totalDeductions} />
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Deductions
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                  <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Banknote className="w-6 h-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                      <AnimatedNumber value={summary.totalBonuses} />
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Bonuses
                    </p>
                  </div>
                </div>
              </>
            )}
      </div>
      </Reveal>

      {/* Summary breakdown row */}
      {!isSummaryLoading && summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary.pendingPayroll} />
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pending
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-violet-500" aria-hidden="true" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary.approvedPayroll} />
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Approved
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                <AnimatedNumber value={summary.paidPayroll} />
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Paid
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {!isLoading && records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DoughnutChartCard title="Status Distribution" items={statusChartItems} />
          <BarChartCard title="Net Salary by Month" items={salaryChartItems} />
        </div>
      )}

      {/* Filters */}
      <Reveal>
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <CalendarDays
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <CalendarDays
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {yearOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="table-scrollbar max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {["Employee", "Period", "Base Salary", "Net Salary", "Deductions", "Bonuses", "Status", "Created"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <span className="block h-4 rounded bg-gray-200 dark:bg-white/10" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No payroll records found.
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Rows per page:
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="table-scrollbar max-h-[65vh] overflow-auto">
              <table className="w-full min-w-[900px]">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Base Salary
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bonuses
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {records.map((record) => {
                    const person = record.employee ?? record.manager;
                    return (
                      <tr
                        key={record.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (record.employee) {
                            navigate(`/manager-payroll/employee/${record.employee.id}`);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (record.employee) {
                              navigate(`/manager-payroll/employee/${record.employee.id}`);
                            }
                          }
                        }}
                        className={`group transition-colors focus:outline-none focus-visible:bg-primary/5 dark:focus-visible:bg-white/5 ${
                          record.employee
                            ? "cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            {person && (
                              <Avatar
                                name={person.fullName}
                                src={getAssetUrl(person.profilePicture)}
                                size="sm"
                              />
                            )}
                            <div>
                              {person ? (
                                <>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {person.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {person.email}
                                  </p>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {monthOptions.find((m) => m.value === String(record.month))?.label ?? record.month}{" "}
                            {record.year}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {record.baseSalary.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {record.netSalary.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm text-red-600 dark:text-red-400">
                            {record.totalDeductions.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm text-amber-600 dark:text-amber-400">
                            {record.totalBonuses.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle text-right">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateInUserZone(record.createdAt, { dateOnly: true })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex}–
              {Math.min(page * limit, total)} of {total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerPayroll;
