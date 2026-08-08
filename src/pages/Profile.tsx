import type { LucideIcon } from "lucide-react";
import {
  Mail,
  Phone,
  MapPin,
  IdCard,
  BadgeCheck,
  ShieldCheck,
  Fingerprint,
  CalendarClock,
  RefreshCw,
  UserRound,
  Building,
  Edit,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import Avatar from "@/components/common/Avatar";
import { useCurrentUser, useUpdateUser } from "@/features/user/user.hooks";

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
  editable?: boolean;
  onEdit?: () => void;
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
  editable,
  onEdit,
}: InfoItemProps) => {
  return (
    <div className="group relative flex items-start gap-4 p-6 rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-xl hover:border-primary/40 dark:hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Background decoration */}
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
      {editable && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="relative flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300 group-hover:opacity-100 opacity-60"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const roleBadgeClass: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Employee: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const Profile = () => {
  const { data: user, isLoading, isError, refetch } = useCurrentUser();
  const updateUser = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editField || !editValue.trim()) return;

    const updateData: Record<string, string> = {};
    updateData[editField] = editValue.trim();

    try {
      await updateUser.mutateAsync(updateData);
      setIsEditing(false);
      setEditField(null);
      setEditValue("");
      refetch();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditField(null);
    setEditValue("");
  };

  const editableFields = [
    "firstName",
    "lastName",
    "country",
    "city",
    "phoneNumber",
  ];

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      country: "Country",
      city: "City",
      phoneNumber: "Phone Number",
    };
    return labels[field] || field;
  };

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Loading profile"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load your profile.
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl opacity-50" />
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Manage your account details and view your verification status
          </p>
        </div>
      </div>

      {/* Identity card */}
      <section className="rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200 dark:border-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full blur-xl opacity-20" />
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              name={displayName}
              size="lg"
              className="relative"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 truncate">
              {displayName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
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
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          <div className="relative">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 text-center">
              Account Information
            </h2>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <InfoItem
            icon={UserRound}
            label="First name"
            value={user.firstName}
            editable={editableFields.includes("firstName")}
            onEdit={() => handleEdit("firstName", user.firstName || "")}
          />
          <InfoItem
            icon={UserRound}
            label="Last name"
            value={user.lastName}
            editable={editableFields.includes("lastName")}
            onEdit={() => handleEdit("lastName", user.lastName || "")}
          />
          <InfoItem
            icon={Mail}
            label="Username (email)"
            value={user.username}
          />
          <InfoItem
            icon={MapPin}
            label="Country"
            value={user.country}
            editable={editableFields.includes("country")}
            onEdit={() => handleEdit("country", user.country || "")}
          />
          <InfoItem
            icon={Building}
            label="City"
            value={user.city}
            editable={editableFields.includes("city")}
            onEdit={() => handleEdit("city", user.city || "")}
          />
          <InfoItem
            icon={Phone}
            label="Phone number"
            value={user.phoneNumber}
            editable={editableFields.includes("phoneNumber")}
            onEdit={() => handleEdit("phoneNumber", user.phoneNumber || "")}
          />
          <InfoItem icon={IdCard} label="National ID" value={user.nationalId} />
          <InfoItem icon={Fingerprint} label="User ID" value={user.id} />
          <InfoItem icon={ShieldCheck} label="Role" value={role} />
          <InfoItem
            icon={RefreshCw}
            label="Token version"
            value={user.tokenVersion}
          />
          <InfoItem
            icon={CalendarClock}
            label="Email verified at"
            value={formatDate(user.emailVerifiedAt)}
          />
        </div>
      </section>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Edit {getFieldLabel(editField || "")}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder={`Enter ${getFieldLabel(editField || "")}`}
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateUser.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
      )}
    </div>
  );
};

export default Profile;
