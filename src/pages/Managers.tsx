import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Search,
  RefreshCw,
  Users,
  UserRound,
  Phone,
  MapPin,
  ShieldCheck,
  CalendarClock,
  Building2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
} from "lucide-react";
import Avatar from "@/components/common/Avatar";
import EditManagerModal from "@/components/managers/EditManagerModal";
import DeleteManagerModal from "@/components/managers/DeleteManagerModal";
import AddManagerModal from "@/components/managers/AddManagerModal";
import { useManagers } from "@/features/managers/managers.hooks";
import { useDepartments } from "@/features/employees/employees.hooks";
import { useCreateManager } from "@/features/managers/managers.hooks";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";
import type { ManagersParams, Manager } from "@/api/user.api";

const PAGE_SIZES = [5, 10, 15, 20];

const formatDate = (dateString?: string | null) =>
  dateString ? formatDateInUserZone(dateString, { dateOnly: true }) : "—";

const fullName = (firstName?: string, lastName?: string) =>
  `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Unknown";

const ManagersPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const params = useMemo<ManagersParams>(
    () => ({
      page,
      limit,
      search: searchQuery.trim() || undefined,
      status: statusFilter || undefined,
      departmentId: departmentFilter || undefined,
    }),
    [page, limit, searchQuery, statusFilter, departmentFilter],
  );

  const { data, isLoading, isError, refetch } = useManagers(params);
  const { data: departments = [] } = useDepartments();
  const [editTarget, setEditTarget] = useState<Manager | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Manager | null>(null);
  const [addTarget, setAddTarget] = useState(false);
  const createManager = useCreateManager();

  const managers = data?.data ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const startIndex = (page - 1) * limit + 1;

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load managers");
    }
  }, [isError]);

  const goTo = (target: number) => {
    if (target < 1 || target > totalPages) return;
    setPage(target);
  };

  const changePageSize = (nextSize: number) => {
    setLimit(nextSize);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDepartmentFilter("");
    setPage(1);
  };

  const hasFilters = Boolean(
    searchQuery.trim() || statusFilter || departmentFilter,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Managers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} manager{total === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddTarget(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UserRound className="w-4 h-4" aria-hidden="true" />
          Add Manager
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by username, email, or employee full name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Filter by status"
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            aria-label="Filter by department"
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          >
            <option value="">All departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Managers Table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading managers...
            </p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load managers
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        ) : managers.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {hasFilters
                ? "No managers match your filters"
                : "No managers found"}
            </p>
          </div>
        ) : (
          <>
            <div className="table-scrollbar max-h-[65vh] overflow-auto">
              <table className="w-full min-w-[960px]">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Phone
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Location
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Verified
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {managers.map((manager) => (
                    <tr
                      key={manager.id}
                      onClick={() => navigate(`/managers/${manager.id}`)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/managers/${manager.id}`);
                        }
                      }}
                      className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    >
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={fullName(manager.firstName, manager.lastName)}
                            firstName={manager.firstName}
                            lastName={manager.lastName}
                            src={getAssetUrl(manager.profilePicture)}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {fullName(manager.firstName, manager.lastName)}
                              </p>
                              <span className="inline-flex shrink-0 items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                                <ShieldCheck
                                  className="w-3 h-3 mr-1"
                                  aria-hidden="true"
                                />
                                Manager
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                              {manager.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        {manager.employee?.department ? (
                          <div className="flex items-center gap-2">
                            <Building2
                              className="w-4 h-4 text-gray-400 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {manager.employee.department.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Phone
                            className="w-4 h-4 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {manager.phoneNumber || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <MapPin
                            className="w-4 h-4 text-gray-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {[manager.city, manager.country]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        {manager.isActive ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <UserCheck
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-400">
                            <UserX className="w-3.5 h-3.5" aria-hidden="true" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <CalendarClock
                            className="w-4 h-4 text-gray-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {manager.isEmailVerified
                              ? formatDate(manager.emailVerifiedAt)
                              : "Not verified"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTarget(manager);
                            }}
                            title="Edit manager"
                            aria-label={`Edit ${fullName(manager.firstName, manager.lastName)}`}
                            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(manager);
                            }}
                            title="Delete manager"
                            aria-label={`Delete ${fullName(manager.firstName, manager.lastName)}`}
                            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {total === 0 ? 0 : startIndex}–
                  {Math.min(startIndex + limit - 1, total)} of {total} manager
                  {total === 1 ? "" : "s"}
                </span>
                <select
                  value={limit}
                  onChange={(e) => changePageSize(Number(e.target.value))}
                  aria-label="Rows per page"
                  className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goTo(page + 1)}
                  disabled={page === totalPages}
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

      {editTarget && (
        <EditManagerModal
          manager={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => refetch()}
        />
      )}

      {deleteTarget && (
        <DeleteManagerModal
          managerId={deleteTarget.id}
          managerName={fullName(deleteTarget.firstName, deleteTarget.lastName)}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => refetch()}
        />
      )}

      {addTarget && (
        <AddManagerModal
          onClose={() => setAddTarget(false)}
          onCreated={() => refetch()}
        />
      )}
    </div>
  );
};

export default ManagersPage;
