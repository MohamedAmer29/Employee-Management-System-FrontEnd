import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState, type ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { RootState } from "@/store/store";
import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Mail,
  Phone,
  MapPin,
  IdCard,
  BadgeCheck,
  CalendarClock,
  Briefcase,
  Building,
  Loader2,
  X,
  Pencil,
  Save,
  Camera,
  ZoomIn,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Power,
  UserCheck,
  UserX,
  LogOut,
} from "lucide-react";
import Avatar from "@/components/common/Avatar";
import ImageLightbox from "@/components/common/ImageLightbox";
import {
  useUser,
  useUpdateUserById,
  useDeleteUser,
  useResetUserPassword,
  useActivateUser,
  useDeactivateUser,
  useAdminLogoutUser,
} from "@/features/users/users.hooks";
import { useUploadEmployeeProfilePicture } from "@/features/employees/employees.hooks";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";

const roleBadgeClass: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Employee: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const formatDate = (value?: string | null) =>
  value ? formatDateInUserZone(value) : "—";

interface ChangePasswordForm {
  password: string;
  confirmPassword: string;
}

const DetailItem = ({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-4 shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="w-5 h-5" aria-hidden="true" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm text-gray-900 dark:text-gray-100 ${
          mono ? "font-mono" : "font-semibold"
        } truncate`}
      >
        {value ?? "—"}
      </p>
    </div>
  </div>
);

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, isError, refetch } = useUser(id);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const isCurrentUser = Boolean(
    user && String(currentUserId) === String(user.id),
  );
  const updateUser = useUpdateUserById();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const adminLogoutUser = useAdminLogoutUser();
  const uploadProfilePicture = useUploadEmployeeProfilePicture();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: {
      errors: passwordErrors,
      isSubmitting: isPasswordSubmitting,
    },
  } = useForm<ChangePasswordForm>({
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const passwordValue = watchPassword("password");
  const validateConfirmPassword = (value: string) =>
    value === passwordValue || "Passwords do not match";
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    country: "",
    city: "",
    phoneNumber: "",
    nationalId: "",
    role: "Employee" as "Admin" | "Manager" | "Employee",
  });

  const openEditModal = () => {
    if (!user) return;
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      phoneNumber: user.phoneNumber ?? "",
      nationalId: user.nationalId ?? "",
      role: (user.role as "Admin" | "Manager" | "Employee") ?? "Employee",
    });
    setIsEditing(true);
  };

  const closeEditModal = () => {
    if (updateUser.isPending) return;
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateUser.mutateAsync({
        id: String(user.id),
        data: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          phoneNumber: form.phoneNumber.trim(),
          nationalId: form.nationalId.trim(),
          role: form.role,
        },
      });
      setIsEditing(false);
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await deleteUser.mutateAsync(user.id);
      setIsConfirmingDelete(false);
      navigate("/users");
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleActivate = async () => {
    if (!user) return;
    try {
      await activateUser.mutateAsync(user.id);
      toast.success("User account activated successfully!");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    try {
      await deactivateUser.mutateAsync(user.id);
      setIsConfirmingDeactivate(false);
      toast.success("User account deactivated successfully!");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleLogout = async () => {
    if (!user) return;
    try {
      await adminLogoutUser.mutateAsync(user.id);
      setIsConfirmingLogout(false);
      toast.success("User logged out from all devices successfully!");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const onPasswordSubmit: SubmitHandler<ChangePasswordForm> = async (data) => {
    if (!user) return;
    try {
      await resetPassword.mutateAsync({
        id: String(user.id),
        data: {
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
      });
      setIsChangePasswordOpen(false);
      resetPasswordForm();
      toast.success("Password updated successfully!");
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleProfilePictureChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.employee) return;
    try {
      await uploadProfilePicture.mutateAsync({
        id: String(user.employee.id),
        file,
      });
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
        aria-label="Loading user details"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load this user.
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

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const displayName = fullName || user.username;
  const role = user.role ?? "Employee";
  const profileImageUrl = getAssetUrl(user.profilePicture);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to users
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            User Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View account and employee information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetPasswordForm();
              setIsChangePasswordOpen(true);
            }}
            disabled={!user}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            Change password
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            disabled={!user}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>
          <button
            type="button"
            onClick={openEditModal}
            disabled={!user}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>

      {/* Identity card */}
      <section className="rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200 dark:border-gray-800 p-8 shadow-lg">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full blur-2xl opacity-30 scale-110" />
            {user.employee ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProfilePicture.isPending}
                title="Update profile picture"
                aria-label="Update profile picture"
                className="group relative rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Avatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  name={displayName}
                  src={profileImageUrl}
                  size="xl"
                  className="relative rounded-full p-1.5 bg-gradient-to-br from-primary to-primary-dark shadow-xl ring-2 ring-white/60 dark:ring-dark-surface"
                />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadProfilePicture.isPending ? (
                    <Loader2
                      className="w-6 h-6 text-white animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-white" aria-hidden="true" />
                  )}
                </span>
              </button>
            ) : (
              <Avatar
                firstName={user.firstName}
                lastName={user.lastName}
                name={displayName}
                src={profileImageUrl}
                size="xl"
                className="relative rounded-full p-1.5 bg-gradient-to-br from-primary to-primary-dark shadow-xl ring-2 ring-white/60 dark:ring-dark-surface"
              />
            )}
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
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 truncate flex items-center justify-center gap-2">
              {displayName}
              {isCurrentUser && (
                <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                  ME
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
              {user.isActive && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                    aria-hidden="true"
                  />
                  Active
                </span>
              )}
              {user.isEmailVerified && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                  Email verified
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Account details */}
      <section aria-label="Account details" className="relative">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 text-center">
            Account Information
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <DetailItem
            icon={UserRound}
            label="First name"
            value={user.firstName}
          />
          <DetailItem
            icon={UserRound}
            label="Last name"
            value={user.lastName}
          />
          <DetailItem icon={Mail} label="Email" value={user.username} />
          <DetailItem
            icon={Phone}
            label="Phone number"
            value={user.phoneNumber}
          />
          <DetailItem
            icon={MapPin}
            label="City"
            value={[user.city, user.country].filter(Boolean).join(", ") || "—"}
          />
          <DetailItem
            icon={IdCard}
            label="National ID"
            value={user.nationalId}
          />
          <DetailItem icon={ShieldCheck} label="Role" value={role} />
          <DetailItem
            icon={CalendarClock}
            label="Email verified at"
            value={formatDate(user.emailVerifiedAt)}
          />
        </div>
      </section>

      {/* Employee details */}
      {user.employee ? (
        <section aria-label="Employee details" className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 text-center">
              Employee Information
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <DetailItem
              icon={UserRound}
              label="Full name"
              value={user.employee.fullName}
            />
            <DetailItem icon={Mail} label="Email" value={user.employee.email} />
            <DetailItem
              icon={Phone}
              label="Phone"
              value={user.employee.phone}
            />
            <DetailItem
              icon={Briefcase}
              label="Position"
              value={user.employee.position}
            />
            <DetailItem
              icon={ShieldCheck}
              label="Role"
              value={user.employee.role}
            />
            <DetailItem
              icon={CalendarClock}
              label="Joined"
              value={formatDate(user.employee.createdAt)}
            />
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <Building
            className="w-8 h-8 text-gray-400 mx-auto mb-2"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No employee record is linked to this account.
          </p>
        </section>
      )}

      {/* Account status actions */}
      <section
        aria-label="Account status actions"
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            Account status
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user.isActive
              ? "This account is currently active."
              : "This account is currently deactivated."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleActivate}
            disabled={user.isActive || activateUser.isPending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activateUser.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserCheck className="w-4 h-4" aria-hidden="true" />
            )}
            Activate
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDeactivate(true)}
            disabled={!user.isActive || deactivateUser.isPending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deactivateUser.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserX className="w-4 h-4" aria-hidden="true" />
            )}
            Deactivate
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingLogout(true)}
            disabled={adminLogoutUser.isPending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adminLogoutUser.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="w-4 h-4" aria-hidden="true" />
            )}
            Logout
          </button>
        </div>
      </section>

      {/* Edit modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit user"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Edit User
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update the user details
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

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="edit-firstName"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  First name
                </label>
                <input
                  id="edit-firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-lastName"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Last name
                </label>
                <input
                  id="edit-lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-phoneNumber"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Phone
                </label>
                <input
                  id="edit-phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-country"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Country
                </label>
                <input
                  id="edit-country"
                  type="text"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-city"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  City
                </label>
                <input
                  id="edit-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-nationalId"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  National ID
                </label>
                <input
                  id="edit-nationalId"
                  type="text"
                  value={form.nationalId}
                  onChange={(e) =>
                    setForm({ ...form, nationalId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-role"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Role
                </label>
                <select
                  id="edit-role"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as typeof form.role,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updateUser.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateUser.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {updateUser.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Change password"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!resetPassword.isPending) setIsChangePasswordOpen(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Change password
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Set a new password for this account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                disabled={resetPassword.isPending}
                aria-label="Close change password modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...registerPassword("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Minimum 6 characters",
                      },
                    })}
                    aria-invalid={passwordErrors.password ? "true" : "false"}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordErrors.password && (
                  <p className="mt-0.5 text-xs text-red-500" role="alert">
                    {passwordErrors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...registerPassword("confirmPassword", {
                      required: "Confirm your password",
                      validate: validateConfirmPassword,
                    })}
                    aria-invalid={
                      passwordErrors.confirmPassword ? "true" : "false"
                    }
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-0.5 text-xs text-red-500" role="alert">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  disabled={resetPassword.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordSubmit(onPasswordSubmit)}
                  disabled={resetPassword.isPending || isPasswordSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {resetPassword.isPending || isPasswordSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConfirmingLogout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Logout user"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!adminLogoutUser.isPending) setIsConfirmingLogout(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-5">
                <LogOut className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Log out this user?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                This will log{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {displayName}
                </span>{" "}
                out of all devices and revoke all active sessions.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsConfirmingLogout(false)}
                  disabled={adminLogoutUser.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={adminLogoutUser.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {adminLogoutUser.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConfirmingDeactivate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Deactivate user"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deactivateUser.isPending) setIsConfirmingDeactivate(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
                <UserX className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Deactivate this account?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                This will deactivate the account for{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {displayName}
                </span>
                . They will no longer be able to sign in.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDeactivate(false)}
                  disabled={deactivateUser.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deactivateUser.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {deactivateUser.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deactivating...
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" />
                      Deactivate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConfirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete user"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleteUser.isPending) setIsConfirmingDelete(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
                <Trash2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Delete this user?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                This will permanently delete{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {displayName}
                </span>
                . This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={deleteUser.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteUser.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {deleteUser.isPending ? (
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
          alt={`${displayName} profile picture`}
          onClose={() => setIsImageZoomOpen(false)}
        />
      )}
    </div>
  );
};

export default UserDetails;
