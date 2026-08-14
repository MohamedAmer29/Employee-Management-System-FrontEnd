import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "react-toastify";
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
  ZoomIn,
  Camera,
  Loader2,
  Pencil,
  UserCheck,
  UserX,
  Trash2,
} from "lucide-react";
import Avatar from "@/components/common/Avatar";
import ImageLightbox from "@/components/common/ImageLightbox";
import EditAdminModal from "@/components/admins/EditAdminModal";
import { useAdmin } from "@/features/admins/admins.hooks";
import { useActivateAdmin } from "@/features/admins/admins.hooks";
import { useDeactivateAdmin } from "@/features/admins/admins.hooks";
import { useUploadUserProfilePicture } from "@/features/users/users.hooks";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";

const formatDate = (value?: string | null) =>
  value ? formatDateInUserZone(value) : "—";

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-4 shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="w-5 h-5" aria-hidden="true" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-semibold truncate">
        {value ?? "—"}
      </p>
    </div>
  </div>
);

const AdminDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: admin, isLoading, isError, refetch } = useAdmin(id);
  const uploadProfilePicture = useUploadUserProfilePicture();
  const activateAdminMutation = useActivateAdmin();
  const deactivateAdminMutation = useDeactivateAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);
  const [imageVersion, setImageVersion] = useState<number>(0);

  useEffect(() => {
    if (isError) toast.error("Failed to load admin details");
  }, [isError]);

  const handleProfilePictureChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !admin) return;
    try {
      await uploadProfilePicture.mutateAsync({
        id: String(admin.id),
        file,
      });
      setImageVersion(Date.now());
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
        aria-label="Loading admin details"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !admin) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load this admin.
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

  const fullName = `${admin.firstName ?? ""} ${admin.lastName ?? ""}`.trim();
  const displayName = fullName || admin.username;
  const profileImageUrl = getAssetUrl(admin.profilePicture);
  const profileImageSrc =
    profileImageUrl && imageVersion > 0
      ? `${profileImageUrl}${profileImageUrl.includes("?") ? "&" : "?"}v=${imageVersion}`
      : profileImageUrl;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admins")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to admins
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Admin Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View admin account and employee information
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
          {admin.isActive ? (
            <button
              type="button"
              onClick={() => setIsConfirmingDeactivate(true)}
              disabled={deactivateAdminMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserX className="w-4 h-4" aria-hidden="true" />
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => activateAdminMutation.mutate(String(admin.id))}
              disabled={activateAdminMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck className="w-4 h-4" aria-hidden="true" />
              Activate
            </button>
          )}
        </div>
      </div>

      {/* Identity card */}
      <section className="rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200 dark:border-gray-800 p-8 shadow-lg">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full blur-2xl opacity-30 scale-110" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProfilePicture.isPending}
              title="Update profile picture"
              aria-label="Update profile picture"
              className="group relative rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Avatar
                firstName={admin.firstName}
                lastName={admin.lastName}
                name={displayName}
                src={profileImageSrc}
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
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
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 truncate flex items-center justify-center gap-2">
              {displayName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Admin
              </span>
              {admin.isActive && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                    aria-hidden="true"
                  />
                  Active
                </span>
              )}
              {admin.isEmailVerified && (
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
            value={admin.firstName}
          />
          <DetailItem
            icon={UserRound}
            label="Last name"
            value={admin.lastName}
          />
          <DetailItem icon={Mail} label="Email" value={admin.username} />
          <DetailItem
            icon={Phone}
            label="Phone number"
            value={admin.phoneNumber}
          />
          <DetailItem
            icon={MapPin}
            label="City"
            value={
              [admin.city, admin.country].filter(Boolean).join(", ") || "—"
            }
          />
          <DetailItem
            icon={IdCard}
            label="National ID"
            value={admin.nationalId}
          />
          <DetailItem icon={ShieldCheck} label="Role" value={admin.role} />
          <DetailItem
            icon={CalendarClock}
            label="Email verified at"
            value={formatDate(admin.emailVerifiedAt)}
          />
        </div>
      </section>

      {/* Employee details */}
      {admin.employee ? (
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
              value={admin.employee.fullName}
            />
            <DetailItem
              icon={Mail}
              label="Email"
              value={admin.employee.email}
            />
            <DetailItem
              icon={Phone}
              label="Phone"
              value={admin.employee.phone}
            />
            <DetailItem
              icon={Briefcase}
              label="Position"
              value={admin.employee.position}
            />
            <DetailItem
              icon={ShieldCheck}
              label="Role"
              value={admin.employee.role}
            />
            <DetailItem
              icon={Building}
              label="Department"
              value={admin.employee.department?.name}
            />
            <DetailItem
              icon={CalendarClock}
              label="Joined"
              value={formatDate(admin.employee.createdAt)}
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

      {isImageZoomOpen && (
        <ImageLightbox
          src={profileImageSrc}
          alt={`${displayName} profile picture`}
          onClose={() => setIsImageZoomOpen(false)}
        />
      )}

      {isEditing && (
        <EditAdminModal
          admin={admin}
          onClose={() => setIsEditing(false)}
          onSaved={() => refetch()}
        />
      )}

      {isConfirmingDeactivate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <p className="text-center text-lg font-medium text-gray-900 dark:text-gray-50 mb-6">
              Are you sure you want to deactivate this admin?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmingDeactivate(false)}
                disabled={deactivateAdminMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deactivateAdminMutation.mutate(String(admin.id), {
                    onSuccess: () => setIsConfirmingDeactivate(false),
                  });
                }}
                disabled={deactivateAdminMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {deactivateAdminMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    Deactivate
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

export default AdminDetails;
