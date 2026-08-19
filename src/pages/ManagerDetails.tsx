import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Trash2,
  Building2,
} from "lucide-react";
import Avatar from "@/components/common/Avatar";
import ImageLightbox from "@/components/common/ImageLightbox";
import EditManagerModal from "@/components/managers/EditManagerModal";
import DeleteManagerModal from "@/components/managers/DeleteManagerModal";
import AssignDepartmentModal from "@/components/managers/AssignDepartmentModal";
import { useManager } from "@/features/managers/managers.hooks";
import { useUploadUserProfilePicture } from "@/features/users/users.hooks";
import { userApi } from "@/api/user.api";
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

const ManagerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: manager, isLoading, isError, refetch } = useManager(id);
  const queryClient = useQueryClient();
  const uploadProfilePicture = useUploadUserProfilePicture();
  const activateManagerMutation = useMutation({
    mutationFn: (id: string) => userApi.activateManager(id),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["managers", variables], (old: any) => {
        if (!old) return old;
        return { ...old, isActive: true };
      });
      toast.success("Manager activated successfully!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to activate manager");
    },
  });
  const deactivateManagerMutation = useMutation({
    mutationFn: (id: string) => userApi.deactivateManager(id),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["managers", variables], (old: any) => {
        if (!old) return old;
        return { ...old, isActive: false };
      });
      toast.success("Manager deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate manager");
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isAssigningDepartment, setIsAssigningDepartment] = useState(false);

  useEffect(() => {
    if (isError) toast.error("Failed to load manager details");
  }, [isError]);

  const handleProfilePictureChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !manager) return;
    try {
      await uploadProfilePicture.mutateAsync({
        id: String(manager.id),
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
        aria-label="Loading manager details"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !manager) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load this manager.
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

  const fullName =
    `${manager.firstName ?? ""} ${manager.lastName ?? ""}`.trim();
  const displayName = fullName || manager.username;
  const profileImageUrl = getAssetUrl(manager.profilePicture);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/managers")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to managers
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Manager Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View manager account and employee information
          </p>
        </div>
        <div className="gap-4 flex max-sm:m-auto max-sm:flex-col">
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
          onClick={() => setIsAssigningDepartment(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Building2 className="w-4 h-4" aria-hidden="true" />
          Assign department
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmingDelete(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>
          {manager.isActive ? null : (
            <button
              type="button"
              onClick={() => activateManagerMutation.mutate(id!)}
              disabled={activateManagerMutation.isPending || manager.isActive}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Activate
            </button>
          )}
          { !manager.isActive ? null : (
            <button
              type="button"
              onClick={() => setIsConfirmingDeactivate(true)}
              disabled={deactivateManagerMutation.isPending || !manager.isActive}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Deactivate
            </button>
          )}
          {isConfirmingDeactivate && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-surface rounded-lg p-8 max-w-sm w-full shadow-xl transform scale-100">
                <p className="text-center text-lg font-medium mb-6">Are you sure you want to deactivate this manager?</p>
                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDeactivate(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deactivateManagerMutation.mutate(id!);
                      setIsConfirmingDeactivate(false);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
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
                firstName={manager.firstName}
                lastName={manager.lastName}
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
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Manager
              </span>
              {manager.isActive && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                    aria-hidden="true"
                  />
                  Active
                </span>
              )}
              {manager.isEmailVerified && (
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
            value={manager.firstName}
          />
          <DetailItem
            icon={UserRound}
            label="Last name"
            value={manager.lastName}
          />
          <DetailItem icon={Mail} label="Email" value={manager.username} />
          <DetailItem
            icon={Phone}
            label="Phone number"
            value={manager.phoneNumber}
          />
          <DetailItem
            icon={MapPin}
            label="City"
            value={
              [manager.city, manager.country].filter(Boolean).join(", ") || "—"
            }
          />
          <DetailItem
            icon={IdCard}
            label="National ID"
            value={manager.nationalId}
          />
          <DetailItem icon={ShieldCheck} label="Role" value={manager.role} />
          <DetailItem
            icon={CalendarClock}
            label="Email verified at"
            value={formatDate(manager.emailVerifiedAt)}
          />
        </div>
      </section>

      {/* Employee details */}
      {manager.employee ? (
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
              value={manager.employee.fullName}
            />
            <DetailItem
              icon={Mail}
              label="Email"
              value={manager.employee.email}
            />
            <DetailItem
              icon={Phone}
              label="Phone"
              value={manager.employee.phone}
            />
            <DetailItem
              icon={Briefcase}
              label="Position"
              value={manager.employee.position}
            />
            <DetailItem
              icon={ShieldCheck}
              label="Role"
              value={manager.employee.role}
            />
            <DetailItem
              icon={Building}
              label="Department"
              value={manager.employee.department?.name}
            />
            <DetailItem
              icon={CalendarClock}
              label="Joined"
              value={formatDate(manager.employee.createdAt)}
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
          src={profileImageUrl}
          alt={`${displayName} profile picture`}
          onClose={() => setIsImageZoomOpen(false)}
        />
      )}

      {isEditing && (
        <EditManagerModal
          manager={manager}
          onClose={() => setIsEditing(false)}
          onSaved={() => refetch()}
        />
      )}

      {isConfirmingDelete && (
        <DeleteManagerModal
          managerId={manager.id}
          managerName={displayName}
          onClose={() => setIsConfirmingDelete(false)}
          onDeleted={() => navigate("/managers")}
        />
      )}

      {isAssigningDepartment && (
        <AssignDepartmentModal
          manager={manager}
          onClose={() => setIsAssigningDepartment(false)}
          onSaved={() => refetch()}
        />
      )}
    </div>
  );
};

export default ManagerDetails;
