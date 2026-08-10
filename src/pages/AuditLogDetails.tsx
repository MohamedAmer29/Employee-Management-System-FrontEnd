import { useParams, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Clock,
  Hash,
  Globe,
  Monitor,
  User,
  Shield,
  Calendar,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  Fingerprint,
  KeyRound,
  ToggleLeft,
  RefreshCw,
  FileDiff,
  Boxes,
} from "lucide-react";
import { useAuditLog } from "@/features/audit/audit.hooks";

const actionColors: Record<string, string> = {
  LOGIN:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  LOGOUT: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  LOGIN_FAILED:
    "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  CREATE: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  UPDATE:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const getActionColor = (action: string) =>
  actionColors[action] ||
  "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const Card = ({ children }: { children: ReactNode }) => (
  <section className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
    {children}
  </section>
);

const CardTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
    {children}
  </h2>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 shrink-0">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm text-gray-900 dark:text-gray-100 break-all ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const JsonBlock = ({
  title,
  icon: Icon,
  data,
}: {
  title: string;
  icon: React.ElementType;
  data: unknown;
}) => (
  <Card>
    <CardTitle>
      <Icon className="w-4 h-4" aria-hidden="true" />
      {title}
    </CardTitle>
    <pre className="text-xs leading-relaxed bg-gray-50 dark:bg-dark rounded-xl p-4 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono max-h-80 overflow-y-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  </Card>
);

const AuditLogDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, isError, refetch } = useAuditLog(id);
  const log = response?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/audit-logs")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
            Audit Log Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono break-all">
            {id}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24" role="status">
          <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : isError || !log ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">
            We couldn't load this audit log.
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
      ) : (
        <>
          {/* Overview */}
          <Card>
            <CardTitle>
              <Clock className="w-4 h-4" aria-hidden="true" />
              Overview
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getActionColor(
                  log.action,
                )}`}
              >
                <Shield className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {log.action}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(log.createdAt)}
              </span>
            </div>
            <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
              {log.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              <InfoRow icon={Boxes} label="Entity" value={log.entity} />
              <InfoRow
                icon={Hash}
                label="Entity ID"
                value={log.entityId}
                mono
              />
              <InfoRow icon={User} label="User ID" value={log.userId} mono />
              <InfoRow
                icon={Globe}
                label="IP Address"
                value={log.ipAddress}
                mono
              />
              <InfoRow
                icon={Monitor}
                label="User Agent"
                value={log.userAgent || "—"}
              />
              <InfoRow
                icon={Calendar}
                label="Timestamp"
                value={formatDate(log.createdAt)}
              />
            </div>
          </Card>

          {/* User */}
          {log.user && (
            <Card>
              <CardTitle>
                <User className="w-4 h-4" aria-hidden="true" />
                User
              </CardTitle>
              <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary text-lg font-bold">
                  {log.user.firstName?.[0]}
                  {log.user.lastName?.[0]}
                </span>
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {log.user.firstName} {log.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{log.user.username}
                  </p>
                </div>
                <span className="ml-auto hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {log.user.role}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <InfoRow
                  icon={Mail}
                  label="Username"
                  value={log.user.username}
                />
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={
                    [log.user.country, log.user.city]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={log.user.phoneNumber || "—"}
                  mono
                />
                <InfoRow
                  icon={CreditCard}
                  label="National ID"
                  value={log.user.nationalId || "—"}
                  mono
                />
                <InfoRow
                  icon={KeyRound}
                  label="Token Version"
                  value={log.user.tokenVersion}
                  mono
                />
                <InfoRow
                  icon={ToggleLeft}
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        log.user.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {log.user.isActive ? "Active" : "Inactive"}
                    </span>
                  }
                />
                <InfoRow
                  icon={Fingerprint}
                  label="Email Verified"
                  value={
                    log.user.isEmailVerified
                      ? log.user.emailVerifiedAt
                        ? `Yes · ${formatDate(log.user.emailVerifiedAt)}`
                        : "Yes"
                      : "No"
                  }
                />
              </div>
            </Card>
          )}

          {/* Values diff */}
          {log.oldValues || log.newValues ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {log.oldValues && (
                <JsonBlock
                  title="Old Values"
                  icon={FileDiff}
                  data={log.oldValues}
                />
              )}
              {log.newValues && (
                <JsonBlock
                  title="New Values"
                  icon={FileDiff}
                  data={log.newValues}
                />
              )}
            </div>
          ) : (
            <Card>
              <CardTitle>
                <FileDiff className="w-4 h-4" aria-hidden="true" />
                Changes
              </CardTitle>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No changes were recorded for this event.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogDetails;
