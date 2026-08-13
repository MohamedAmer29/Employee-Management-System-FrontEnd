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
  X,
  Save,
  Loader2,
  Trash2,
  Network,
  UserPlus,
  Camera,
  ZoomIn,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import Avatar from "@/components/common/Avatar";
import ImageLightbox from "@/components/common/ImageLightbox";
import {
  useEmployee,
  useUpdateEmployee,
  useDepartments,
  useUsers,
  useDeleteEmployee,
  useAssignDepartment,
  useAssignUser,
  useUploadEmployeeProfilePicture,
} from "@/features/employees/employees.hooks";
import { formatDateInUserZone } from "@/utils/formatDate";

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
  onClick?: () => void;
}

const InfoItem = ({ icon: Icon, label, value, onClick }: InfoItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-4 p-6 rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-xl hover:border-primary/40 dark:hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-all duration-300" />

      <span className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shrink-0 group-hover:from-primary/25 group-hover:via-primary/20 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/10">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        {onClick ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-input px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
            {value ?? "—"}
            <Pencil
              className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          </span>
        ) : (
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 break-all leading-tight">
            {value ?? "—"}
          </p>
        )}
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

const formatUserOption = (user: {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  employee?: unknown | null;
  manager?: unknown | null;
}) => {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const assignedLabel = user.employee
    ? " - Assigned as employee"
    : user.manager
      ? " - Assigned to manager"
      : "";
  return `${fullName} - ${user.role} - ${
    user.isActive ? "Active" : "Inactive"
  } - ${user.isEmailVerified ? "Email verified" : "Email not verified"}${assignedLabel}`;
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

const EmployeeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserEmail = currentUser?.username?.toLowerCase();
  const { data: employee, isLoading, isError, refetch } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const assignDepartment = useAssignDepartment();
  const assignUser = useAssignUser();
  const uploadProfilePicture = useUploadEmployeeProfilePicture();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isAssigningDept, setIsAssigningDept] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isEditingPosition, setIsEditingPosition] = useState(false);
  const [positionInput, setPositionInput] = useState("");
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useDepartments();
  const { data: users = [], isLoading: isUsersLoading } = useUsers(
    isEditing || isAssigningUser,
  );

  const openAssignModal = () => {
    setSelectedDepartmentId(
      employee?.department?.id ? String(employee.department.id) : "",
    );
    setIsAssigningDept(true);
  };

  const handleAssign = async () => {
    if (!id || !selectedDepartmentId) return;
    try {
      await assignDepartment.mutateAsync({
        id,
        departmentId: selectedDepartmentId,
      });
      setIsAssigningDept(false);
      setSelectedDepartmentId("");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const openAssignUserModal = () => {
    setSelectedUserId(employee?.user?.id ? String(employee.user.id) : "");
    setIsAssigningUser(true);
  };

  const handleAssignUser = async () => {
    if (!id || !selectedUserId) return;
    try {
      await assignUser.mutateAsync({ id, userId: selectedUserId });
      setIsAssigningUser(false);
      setSelectedUserId("");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };
  const [form, setForm] = useState({
    position: "",
    departmentId: "",
    userId: "",
    isActive: true,
  });

  const openEditModal = () => {
    if (!employee) return;
    setForm({
      position: employee.position,
      departmentId: employee.department?.id
        ? String(employee.department.id)
        : "",
      userId: employee.user?.id ? String(employee.user.id) : "",
      isActive: employee.isActive,
    });
    setIsEditing(true);
  };

  const closeEditModal = () => {
    if (updateEmployee.isPending) return;
    setIsEditing(false);
  };

  const openEditPositionModal = () => {
    if (!employee) return;
    setPositionInput(employee.position);
    setIsEditingPosition(true);
  };

  const handleSavePosition = async () => {
    if (!employee || !id) return;
    const position = positionInput.trim();
    if (!position) return;
    try {
      await updateEmployee.mutateAsync({ id, data: { position } });
      setIsEditingPosition(false);
      setPositionInput("");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleSave = async () => {
    if (!employee || !id) return;

    const data: Parameters<typeof updateEmployee.mutate>[0]["data"] = {
      position: form.position.trim(),
      isActive: form.isActive,
    };

    if (form.departmentId.trim()) {
      data.departmentId = form.departmentId.trim();
    }
    if (form.userId.trim()) {
      data.userId = form.userId.trim();
    }

    try {
      await updateEmployee.mutateAsync({ id, data });
      setIsEditing(false);
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteEmployee.mutateAsync(id);
      setIsConfirmingDelete(false);
      navigate("/employees");
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleProfilePictureChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;
    try {
      await uploadProfilePicture.mutateAsync({ id, file });
      refetch();
    } catch {
      // Error is handled by the mutation
    } finally {
      event.target.value = "";
    }
  };

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
            onClick={openAssignUserModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-900/60 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Assign User
          </button>
          <button
            type="button"
            onClick={openAssignModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Network className="w-4 h-4" aria-hidden="true" />
            Assign
          </button>
          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
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

      {/* Identity card */}
      <section className="rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200 dark:border-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full blur-2xl opacity-30 scale-110" />
            <div className="group relative rounded-full p-1.5 bg-gradient-to-br from-primary to-primary-dark shadow-xl ring-2 ring-white/60 dark:ring-dark-surface">
              <Avatar
                firstName={employee.user?.firstName}
                lastName={employee.user?.lastName}
                name={employee.fullName}
                src={profileImageUrl}
                size="xl"
                className="rounded-full"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProfilePicture.isPending}
                title="Update profile picture"
                aria-label="Update profile picture"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploadProfilePicture.isPending ? (
                  <Loader2
                    className="w-6 h-6 text-white animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-white" aria-hidden="true" />
                )}
              </button>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
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
          <InfoItem
            icon={UserRound}
            label="Full name"
            value={employee.fullName}
          />
          <InfoItem icon={Mail} label="Email" value={employee.email} />
          <InfoItem icon={Phone} label="Phone" value={employee.phone} />
          <InfoItem
            icon={Briefcase}
            label="Position"
            value={employee.position}
            onClick={openEditPositionModal}
          />
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
            <InfoItem
              icon={Building2}
              label="City"
              value={employee.user.city}
            />
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
            <InfoItem
              icon={ShieldCheck}
              label="Role"
              value={employee.user.role}
            />
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

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit employee"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Edit Employee
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update the employee details and account assignment
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                aria-label="Close edit modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="edit-position"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Position
                </label>
                <input
                  id="edit-position"
                  type="text"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-department"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Department
                </label>
                <select
                  id="edit-department"
                  value={form.departmentId}
                  onChange={(e) =>
                    setForm({ ...form, departmentId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">None</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="edit-user"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Linked user account
                </label>
                <select
                  id="edit-user"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">None</option>
                  {users.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.firstName} {user.lastName} ({user.username})
                    </option>
                  ))}
                </select>
              </div>
              {/* <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Active status
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Toggle whether this employee is currently active
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  aria-label="Toggle active status"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    form.isActive
                      ? "bg-emerald-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      form.isActive ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div> */}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={updateEmployee.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateEmployee.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {updateEmployee.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign department modal */}
      {isAssigningDept && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Assign employee to department"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!assignDepartment.isPending) setIsAssigningDept(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Assign Department
              </h3>
              <button
                type="button"
                onClick={() => setIsAssigningDept(false)}
                disabled={assignDepartment.isPending}
                aria-label="Close assign department modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assigning{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {employee?.fullName}
                </span>{" "}
                to a department:
              </p>

              {isDepartmentsLoading ? (
                <div
                  className="flex items-center justify-center py-12"
                  role="status"
                  aria-label="Loading departments"
                >
                  <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="mt-5">
                  <label
                    htmlFor="assign-department"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Department
                  </label>
                  <select
                    id="assign-department"
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select a department...</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name} ({department.employees?.length ?? 0}{" "}
                        employee
                        {(department.employees?.length ?? 0) === 1 ? "" : "s"})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <button
                type="button"
                onClick={() => setIsAssigningDept(false)}
                disabled={assignDepartment.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={assignDepartment.isPending || !selectedDepartmentId}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {assignDepartment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Network className="w-4 h-4" />
                    Assign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign user account modal */}
      {isAssigningUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Assign user account to employee"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!assignUser.isPending) setIsAssigningUser(false);
            }}
          />
          <div className="relative w-full max-md:max-w-md max-w-[43rem] rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Assign User Account
              </h3>
              <button
                type="button"
                onClick={() => setIsAssigningUser(false)}
                disabled={assignUser.isPending}
                aria-label="Close assign user account modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assigning a user account to{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {employee?.fullName}
                </span>
                :
              </p>

              {isUsersLoading ? (
                <div
                  className="flex items-center justify-center py-12"
                  role="status"
                  aria-label="Loading user accounts"
                >
                  <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="mt-5">
                  <label
                    htmlFor="assign-user"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    User account
                  </label>
                  <select
                    id="assign-user"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select a user account...</option>
                    {users.map((user) => (
                      <option key={user.id} value={String(user.id)}>
                        {formatUserOption(user)}
                      </option>
                    ))}
                  </select>
                  {users.length > 0 && (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      "Assigned as employee" means the account is linked to an
                      employee; "Assigned to manager" means it is linked to a
                      manager.
                    </p>
                  )}
                  {users.length === 0 && !isUsersLoading && (
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      No user accounts available.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <button
                type="button"
                onClick={() => setIsAssigningUser(false)}
                disabled={assignUser.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignUser}
                disabled={assignUser.isPending || !selectedUserId}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {assignUser.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Assign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isEditingPosition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Change position"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!updateEmployee.isPending) setIsEditingPosition(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Change position
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingPosition(false)}
                disabled={updateEmployee.isPending}
                aria-label="Close change position modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePosition();
                }}
              >
                <label
                  htmlFor="position-input"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Position
                </label>
                <input
                  id="position-input"
                  type="text"
                  value={positionInput}
                  onChange={(e) => setPositionInput(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditingPosition(false)}
                    disabled={updateEmployee.isPending}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateEmployee.isPending || !positionInput.trim()}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {updateEmployee.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isConfirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete employee"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleteEmployee.isPending) setIsConfirmingDelete(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
                <Trash2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Delete this employee?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                This will permanently delete{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {employee?.fullName}
                </span>
                . This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={deleteEmployee.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteEmployee.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {deleteEmployee.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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

export default EmployeeDetails;
