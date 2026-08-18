import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarDays,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  CircleDot,
  Clock,
} from "lucide-react";
import { usePayrollEmployee } from "@/features/payroll/payroll.hooks";
import type { PayrollStatus } from "@/api/user.api";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { formatDateInUserZone } from "@/utils/formatDate";

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "CALCULATED", label: "Calculated" },
  { value: "APPROVED", label: "Approved" },
  { value: "PAID", label: "Paid" },
];

const getStatusBadge = (status: PayrollStatus) => {
  switch (status) {
    case "PAID":
      return { className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: CheckCircle2, label: "Paid" };
    case "CALCULATED":
      return { className: "bg-sky-500/10 text-sky-600 dark:text-sky-400", icon: CircleDot, label: "Calculated" };
    case "DRAFT":
      return { className: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Clock, label: "Draft" };
    case "APPROVED":
      return { className: "bg-violet-500/10 text-violet-600 dark:text-violet-400", icon: CheckCircle2, label: "Approved" };
    default:
      return { className: "bg-gray-500/10 text-gray-600 dark:text-gray-400", icon: CircleDot, label: status };
  }
};

const AdminPayrollEmployee = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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

  const params = useMemo(
    () => ({
      page,
      limit,
      status: (statusFilter || undefined) as PayrollStatus | undefined,
      month: monthFilter ? Number(monthFilter) : undefined,
      year: yearFilter ? Number(yearFilter) : undefined,
    }),
    [page, limit, statusFilter, monthFilter, yearFilter],
  );

  const { data: records = [], isLoading, isError, refetch } = usePayrollEmployee(
    employeeId ?? "",
    params,
    !!employeeId,
  );

  const stats = useMemo(() => {
    if (!records.length) return { total: 0, netSalary: 0, deductions: 0, bonuses: 0 };
    return {
      total: records.length,
      netSalary: records.reduce((sum, r) => sum + r.netSalary, 0),
      deductions: records.reduce((sum, r) => sum + r.totalDeductions, 0),
      bonuses: records.reduce((sum, r) => sum + r.totalBonuses, 0),
    };
  }, [records]);

  const employee = records[0]?.employee;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load payroll records.
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
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/payroll")}
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Back to payroll"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            {employee?.fullName ?? "Employee"} — Payroll
          </h1>
          {employee && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {employee.email} · {employee.position}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4 animate-pulse">
                <span className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-white/10 shrink-0" />
                <div className="space-y-2">
                  <span className="block h-7 w-12 rounded bg-gray-200 dark:bg-white/10" />
                  <span className="block h-3 w-16 rounded bg-gray-200 dark:bg-white/10" />
                </div>
              </div>
            ))
          : <>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
                  <DollarSign className="w-6 h-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    <AnimatedNumber value={stats.total} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Records
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-6 h-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    <AnimatedNumber value={stats.netSalary} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Net Salary
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400">
                  <TrendingDown className="w-6 h-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    <AnimatedNumber value={stats.deductions} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Deductions
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <TrendingUp className="w-6 h-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    <AnimatedNumber value={stats.bonuses} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Bonuses
                  </p>
                </div>
              </div>
            </>
        }
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
            <select
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {yearOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="table-scrollbar max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {["Period", "Base Salary", "Net Salary", "Deductions", "Bonuses", "Status", "Created"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><span className="block h-4 rounded bg-gray-200 dark:bg-white/10" /></td>
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
          <p className="text-sm text-gray-500 dark:text-gray-400">No payroll records found.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</label>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
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
              <table className="w-full min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    {["Period", "Base Salary", "Net Salary", "Deductions", "Bonuses", "Status", "Created"].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {records.map((record) => {
                    const statusCfg = getStatusBadge(record.status);
                    const StatusIcon = statusCfg.icon;
                    return (
                      <tr
                        key={record.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/payroll/${record.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(`/payroll/${record.id}`);
                          }
                        }}
                        className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-primary/5 dark:focus-visible:bg-white/5"
                      >
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {monthNames[record.month]} {record.year}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
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
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                            <StatusIcon className="w-3 h-3" aria-hidden="true" />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing 1–{records.length} of {records.length} records
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
              <span className="text-sm text-gray-600 dark:text-gray-400">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={records.length < limit}
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

export default AdminPayrollEmployee;
