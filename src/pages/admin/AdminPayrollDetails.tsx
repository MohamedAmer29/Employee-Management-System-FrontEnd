import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  CalendarDays,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  CircleDot,
  User,
  Building2,
  Briefcase,
  MinusCircle,
  PlusCircle,
  ShieldCheck,
  Banknote,
} from "lucide-react";
import {
  usePayrollRecord,
  useApprovePayroll,
  useMarkPayrollPaid,
} from "@/features/payroll/payroll.hooks";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";
import AddDeductionModal from "@/components/payroll/AddDeductionModal";
import AddBonusModal from "@/components/payroll/AddBonusModal";

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return {
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
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
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: Clock,
        label: "Draft",
      };
    case "APPROVED":
      return {
        className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
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

const AdminPayrollDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: record,
    isLoading,
    isError,
    refetch,
  } = usePayrollRecord(id ?? "", !!id);

  const { mutate: approvePayroll, isPending: isApproving } = useApprovePayroll();
  const { mutate: markPaid, isPending: isMarkingPaid } = useMarkPayrollPaid();

  const [isDeductionOpen, setIsDeductionOpen] = useState(false);
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "markPaid" | null>(null);

  const isBusy = isApproving || isMarkingPaid;

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Loading payroll details"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !record) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load the payroll record.
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

  const statusCfg = getStatusBadge(record.status);
  const StatusIcon = statusCfg.icon;
  const person = record.employee ?? record.manager;
  const isEmployee = !!record.employee;
  const canTakeAction = record.status !== "PAID";

  const handleApprove = () => {
    approvePayroll(record.id);
  };

  const handleMarkPaid = () => {
    markPaid(record.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight truncate">
            {person?.fullName ?? "Payroll Record"}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {monthNames[record.month]} {record.year}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
            >
              <StatusIcon className="w-3 h-3" aria-hidden="true" />
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canTakeAction && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDeductionOpen(true)}
            disabled={isBusy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <MinusCircle className="w-4 h-4" aria-hidden="true" />
            Add Deduction
          </button>
          <button
            type="button"
            onClick={() => setIsBonusOpen(true)}
            disabled={isBusy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            Add Bonus
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />
          {record.status !== "APPROVED" && record.status !== "PAID" && confirmAction !== "approve" && (
            <button
              type="button"
              onClick={() => setConfirmAction("approve")}
              disabled={isBusy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-900/50 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Approve
            </button>
          )}
          {record.status !== "APPROVED" && record.status !== "PAID" && confirmAction === "approve" && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-900/50 text-sm">
              <span className="text-violet-700 dark:text-violet-300 font-medium">Approve this record?</span>
              <button
                type="button"
                onClick={() => { handleApprove(); setConfirmAction(null); }}
                disabled={isBusy}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isApproving ? <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                {isApproving ? "..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isBusy}
                className="px-3 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                No
              </button>
            </span>
          )}
          {record.status === "APPROVED" && confirmAction !== "markPaid" && (
            <button
              type="button"
              onClick={() => setConfirmAction("markPaid")}
              disabled={isBusy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Banknote className="w-4 h-4" aria-hidden="true" />
              Mark as Paid
            </button>
          )}
          {record.status === "APPROVED" && confirmAction === "markPaid" && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 text-sm">
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">Mark as paid?</span>
              <button
                type="button"
                onClick={() => { handleMarkPaid(); setConfirmAction(null); }}
                disabled={isBusy}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isMarkingPaid ? <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Banknote className="w-3 h-3" />}
                {isMarkingPaid ? "..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isBusy}
                className="px-3 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                No
              </button>
            </span>
          )}
        </div>
      )}

      {/* Person Info */}
      {person && (
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex items-center gap-4">
          <Avatar
            name={person.fullName}
            src={getAssetUrl(person.profilePicture)}
            size="lg"
          />
          <div>
            <button
              type="button"
              onClick={() => {
                if (isEmployee) {
                  navigate(`/payroll/employee/${person.id}`);
                } else {
                  navigate(`/payroll/manager/${person.userId}`);
                }
              }}
              className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:underline cursor-pointer"
            >
              {person.fullName}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {person.email} · {person.position}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                <Briefcase className="w-3 h-3" aria-hidden="true" />
                {person.role}
              </span>
              {person.department && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                  <Building2 className="w-3 h-3" aria-hidden="true" />
                  {person.department.name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Salary Details */}
      <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Salary Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <DollarSign className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {record.baseSalary.toLocaleString()}
              </p>
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                Base Salary
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <DollarSign className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {record.dailySalary.toLocaleString()}
              </p>
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                Daily Salary
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/5">
              <TrendingUp className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {record.netSalary.toLocaleString()}
              </p>
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                Net Salary
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5">
              <TrendingUp className="w-5 h-5 mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {record.totalBonuses.toLocaleString()}
              </p>
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                Total Bonuses
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Attendance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <CalendarDays className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {record.workingDays}
              </p>
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                Working Days
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/5">
              <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {record.attendedDays}
              </p>
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                Attended
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-500/5">
              <TrendingDown className="w-5 h-5 mx-auto text-red-500 mb-1" />
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {record.absentDays}
              </p>
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                Absent
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5">
              <Clock className="w-5 h-5 mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {record.leaveDays}
              </p>
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                Leave Days
              </p>
            </div>
          </div>
        </div>

        {/* Deductions & Bonuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 dark:text-red-500">
                Deductions
              </h3>
              {canTakeAction && (
                <button
                  type="button"
                  onClick={() => setIsDeductionOpen(true)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="w-3 h-3" aria-hidden="true" />
                  Add
                </button>
              )}
            </div>
            {record.deductions.length > 0 ? (
              <div className="space-y-2">
                {record.deductions.map((deduction) => (
                  <div
                    key={deduction.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {deduction.reason}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                        {deduction.type}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400 ml-3 shrink-0">
                      -{deduction.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-100 dark:bg-red-500/10">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Total Deductions
                  </span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    -{record.totalDeductions.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No deductions
              </p>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 dark:text-amber-500">
                Bonuses
              </h3>
              {canTakeAction && (
                <button
                  type="button"
                  onClick={() => setIsBonusOpen(true)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="w-3 h-3" aria-hidden="true" />
                  Add
                </button>
              )}
            </div>
            {record.bonuses.length > 0 ? (
              <div className="space-y-2">
                {record.bonuses.map((bonus) => (
                  <div
                    key={bonus.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {bonus.reason}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                        {bonus.type}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 ml-3 shrink-0">
                      +{bonus.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-500/10">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Total Bonuses
                  </span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    +{record.totalBonuses.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No bonuses
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {record.createdBy && (
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 shrink-0">
                <User className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created By</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {record.createdBy.fullName}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-500/15 text-gray-600 dark:text-gray-400 shrink-0">
              <CalendarDays className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatDateInUserZone(record.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-500/15 text-gray-600 dark:text-gray-400 shrink-0">
              <CalendarDays className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatDateInUserZone(record.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isDeductionOpen && (
        <AddDeductionModal
          payrollId={record.id}
          onClose={() => setIsDeductionOpen(false)}
        />
      )}
      {isBonusOpen && (
        <AddBonusModal
          payrollId={record.id}
          onClose={() => setIsBonusOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPayrollDetails;
