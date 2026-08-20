import type { LucideIcon } from "lucide-react";
import {
  UserRound,
  Mail,
  Phone,
  Briefcase,
  Building2,
  CalendarClock,
  MapPin,
  IdCard,
  ShieldCheck,
  BadgeCheck,
  Fingerprint,
  RefreshCw,
  ArrowLeft,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  ZoomIn,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import Avatar from "@/components/common/Avatar";
import ImageLightbox from "@/components/common/ImageLightbox";
import EditEmployeeModal from "@/components/managerEmployees/EditEmployeeModal";
import DeleteEmployeeModal from "@/components/managerEmployees/DeleteEmployeeModal";
import StatusEmployeeModal from "@/components/managerEmployees/StatusEmployeeModal";
import {
  useManagerEmployee,
  useDeleteManagerEmployee,
  useUpdateManagerEmployeeStatus,
} from "@/features/employees/employees.hooks";
import { formatDateInUserZone } from "@/utils/formatDate";
import Reveal from "@/components/common/Reveal";

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => {
  return (
    <div className="group relative flex items-start gap-4 p-6 rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-xl hover:border-primary/40 dark:hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-all duration-300" />
      <span className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shrink-0 group-hover:from-primary/25 group-hover:via-primary/20 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/10">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 break-all leading-tight">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDateInUserZone(value);
};

const roleBadgeClass: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Employee: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const resolveImageUrl = (url?: string | null) => {
  if (!url) return null;
  return url.startsWith("http") || url.startsWith("data:")
    ? url
    : `${import.meta.env.VITE_BACKEND_URL}${url}`;
};

const ManagerEmployeeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserEmail = currentUser?.username?.toLowerCase();
  const { data: employee, isLoading, isError, refetch } = useManagerEmployee(id);
  const deleteEmployee = useDeleteManagerEmployee();
  const updateStatus = useUpdateManagerEmployeeStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingStatus, setIsConfirmingStatus] = useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Loading employee details"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load the employee details.
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

  const role = employee.role ?? "Employee";
  const profileImageUrl = resolveImageUrl(employee.profilePicture);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <Reveal y={20}>
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl opacity-50" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              Employee Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              View the full profile and account information of this employee
            </p>
          </div>
        </div>
        <div className="flex flex-wrap max-md:flex-wrap-reverse items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingStatus(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 ${
              employee.isActive
                ? "text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/20 focus-visible:ring-amber-500"
                : "text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 focus-visible:ring-emerald-500"
            }`}
          >
            {employee.isActive ? (
              <UserX className="w-4 h-4" aria-hidden="true" />
            ) : (
              <UserCheck className="w-4 h-4" aria-hidden="true" />
            )}
            {employee.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Employees
          </button>
        </div>
      </div>
      </Reveal>

      {/* Identity card */}
      <Reveal>
      <section className="rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200 dark:border-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full blur-2xl opacity-30 scale-110" />
            <div className="relative rounded-full p-1.5 bg-gradient-to-br from-primary to-primary-dark shadow-xl ring-2 ring-white/60 dark:ring-dark-surface">
              <Avatar
                firstName={employee.user?.firstName}
                lastName={employee.user?.lastName}
                name={employee.fullName}
                src={profileImageUrl}
                size="xl"
                className="rounded-full"
              />
            </div>
            {profileImageUrl && (
              <button
                type="button"
                onClick={() => setIsImageZoomOpen(true)}
                title="View larger"
                aria-label="View larger profile picture"
                className="absolute -bottom-2 -right-2 flex items-center justify-center h-11 w-11 rounded-full bg-white dark:bg-dark-surface shadow-lg ring-2 ring-white/60 dark:ring-dark-surface text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ZoomIn className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 truncate flex items-center justify-center gap-2">
              {employee.fullName}
              {currentUserEmail &&
                employee.email.toLowerCase() === currentUserEmail && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Me
                  </span>
                )}
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${roleBadgeClass[role] ?? "bg-gray-500/10 text-gray-600 dark:text-gray-300"}`}
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                {role}
              </span>
              {employee.isActive ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                    aria-hidden="true"
                  />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-400">
                  <span
                    className="h-2 w-2 rounded-full bg-gray-400"
                    aria-hidden="true"
                  />
                  Inactive
                </span>
              )}
              {employee.user?.isEmailVerified && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                  Email verified
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      {/* Employee information */}
      <section aria-label="Employee information" className="relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          <div className="relative">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 text-center">
              Employee Information
            </h2>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <InfoItem icon={UserRound} label="Full name" value={employee.fullName} />
          <InfoItem icon={Mail} label="Email" value={employee.email} />
          <InfoItem icon={Phone} label="Phone" value={employee.phone} />
          <InfoItem icon={Briefcase} label="Position" value={employee.position} />
          <InfoItem
            icon={Building2}
            label="Department"
            value={employee.department?.name}
          />
          <InfoItem
            icon={CalendarClock}
            label="Joined"
            value={formatDate(employee.createdAt)}
          />
        </div>
      </section>

      {/* User account information */}
      <section aria-label="User account information" className="relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          <div className="relative">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 text-center">
              User Account
            </h2>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        </div>
        {employee.user ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <InfoItem
              icon={UserRound}
              label="First name"
              value={employee.user.firstName}
            />
            <InfoItem
              icon={UserRound}
              label="Last name"
              value={employee.user.lastName}
            />
            <InfoItem
              icon={Mail}
              label="Username (email)"
              value={employee.user.username}
            />
            <InfoItem
              icon={MapPin}
              label="Country"
              value={employee.user.country}
            />
            <InfoItem icon={Building2} label="City" value={employee.user.city} />
            <InfoItem
              icon={Phone}
              label="Phone number"
              value={employee.user.phoneNumber}
            />
            <InfoItem
              icon={IdCard}
              label="National ID"
              value={employee.user.nationalId}
            />
            <InfoItem icon={ShieldCheck} label="Role" value={employee.user.role} />
            <InfoItem
              icon={Fingerprint}
              label="User ID"
              value={employee.user.id}
            />
            <InfoItem
              icon={RefreshCw}
              label="Token version"
              value={employee.user.tokenVersion}
            />
            <InfoItem
              icon={BadgeCheck}
              label="Email verified"
              value={employee.user.isEmailVerified ? "Yes" : "No"}
            />
            <InfoItem
              icon={CalendarClock}
              label="Email verified at"
              value={formatDate(employee.user.emailVerifiedAt)}
            />
          </div>
        ) : (
          <div className="rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200/50 dark:border-gray-800/50 p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No user account linked to this employee.
            </p>
          </div>
        )}
      </section>

      {isEditing && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setIsEditing(false)}
          onSaved={() => refetch()}
        />
      )}

      {isConfirmingDelete && (
        <DeleteEmployeeModal
          employeeId={employee.id}
          employeeName={employee.fullName}
          onClose={() => setIsConfirmingDelete(false)}
          onDeleted={() => navigate("/employees")}
        />
      )}

      {isConfirmingStatus && (
        <StatusEmployeeModal
          employeeId={employee.id}
          employeeName={employee.fullName}
          isActive={employee.isActive}
          onClose={() => setIsConfirmingStatus(false)}
          onUpdated={() => {
            setIsConfirmingStatus(false);
            refetch();
          }}
        />
      )}

      {(deleteEmployee.isPending || updateStatus.isPending) && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-medium shadow-xl">
          <Loader2 className="w-4 h-4 animate-spin" />
          Working...
        </div>
      )}

      {isImageZoomOpen && (
        <ImageLightbox
          src={profileImageUrl}
          alt={`${employee.fullName} profile picture`}
          onClose={() => setIsImageZoomOpen(false)}
        />
      )}
    </div>
  );
};

export default ManagerEmployeeDetails;
