import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Banknote,
  Clock,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { useEmployeePayrollRecord } from "@/features/payroll/payroll.hooks";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { formatDateInUserZone } from "@/utils/formatDate";
import type { PayrollStatus } from "@/api/user.api";

const monthNames = [
  "",
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

const getStatusBadge = (status: PayrollStatus) => {
  switch (status) {
    case "PAID":
      return {
        className:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
        label: "Paid",
      };
    case "CALCULATED":
      return {
        className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        icon: CircleDot,
        label: "Calculated",
      };
    case "DRAFT":
      return {
        className:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: Clock,
        label: "Draft",
      };
    case "APPROVED":
      return {
        className:
          "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        icon: CheckCircle2,
        label: "Approved",
      };
    default:
      return {
        className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
        icon: CircleDot,
        label: status,
      };
  }
};

const InfoRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span
      className={`text-sm font-semibold ${className ?? "text-gray-900 dark:text-gray-50"}`}
    >
      {typeof value === "number" ? value.toLocaleString() : value}
    </span>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
      {title}
    </h3>
    {children}
  </div>
);

const EmployeePayrollDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: record,
    isLoading,
    isError,
    refetch,
  } = useEmployeePayrollRecord(id ?? "", !!id);

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate("/my-payroll")}
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Back to payroll"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">
            We couldn't load this payroll record.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse"
            >
              <div className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-white/10 mb-3" />
              <div className="h-7 w-16 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!record) return null;

  const statusCfg = getStatusBadge(record.status);
  const StatusIcon = statusCfg.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/my-payroll")}
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Back to payroll"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            {monthNames[record.month]} {record.year} — Payroll
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
            >
              <StatusIcon className="w-3 h-3" aria-hidden="true" />
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <DollarSign className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              <AnimatedNumber value={record.baseSalary} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Base Salary
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={record.netSalary} />
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
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              <AnimatedNumber value={record.totalDeductions} />
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
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              <AnimatedNumber value={record.totalBonuses} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Bonuses
            </p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Salary Breakdown">
          <InfoRow label="Base Salary" value={record.baseSalary} />
          <InfoRow label="Daily Salary" value={record.dailySalary} />
          <InfoRow
            label="Net Salary"
            value={record.netSalary}
            className="text-emerald-600 dark:text-emerald-400"
          />
        </Section>

        <Section title="Attendance">
          <InfoRow label="Working Days" value={record.workingDays} />
          <InfoRow label="Attended Days" value={record.attendedDays} />
          <InfoRow
            label="Absent Days"
            value={record.absentDays}
            className="text-red-600 dark:text-red-400"
          />
          <InfoRow
            label="Leave Days"
            value={record.leaveDays}
            className="text-amber-600 dark:text-amber-400"
          />
          <InfoRow
            label="Attendance Deduction"
            value={record.attendanceDeduction}
            className="text-red-600 dark:text-red-400"
          />
        </Section>
      </div>

      {/* Deductions & Bonuses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Deductions">
          {record.deductions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              No deductions recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {record.deductions.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {d.type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {d.reason}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    -{d.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Bonuses">
          {record.bonuses.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              No bonuses recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {record.bonuses.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {b.type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {b.reason}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    +{b.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Meta */}
      <Section title="Details">
        <InfoRow
          label="Period"
          value={`${monthNames[record.month]} ${record.year}`}
        />
        <InfoRow
          label="Created"
          value={formatDateInUserZone(record.createdAt)}
        />
        <InfoRow
          label="Last Updated"
          value={formatDateInUserZone(record.updatedAt)}
        />
        {record.createdBy && (
          <InfoRow label="Processed By" value={record.createdBy.fullName} />
        )}
      </Section>
    </div>
  );
};

export default EmployeePayrollDetails;
