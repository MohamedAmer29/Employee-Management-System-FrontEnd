import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Search,
  RefreshCw,
  Users,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import Avatar from "@/components/common/Avatar";
import AddEmployeeModal from "@/components/managerEmployees/AddEmployeeModal";
import EditEmployeeModal from "@/components/managerEmployees/EditEmployeeModal";
import DeleteEmployeeModal from "@/components/managerEmployees/DeleteEmployeeModal";
import StatusEmployeeModal from "@/components/managerEmployees/StatusEmployeeModal";
import { useManagerEmployees } from "@/features/employees/employees.hooks";
import type { RootState } from "@/store/store";
import type { ManagerEmployeeParams, EmployeeDetail } from "@/api/user.api";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";

const PAGE_SIZES = [5, 10, 15, 20];

const roleBadgeClass: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Employee: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const formatDate = (dateString?: string | null) =>
  dateString ? formatDateInUserZone(dateString, { dateOnly: true }) : "—";

const ManagerEmployeesPage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserEmail = currentUser?.username?.toLowerCase();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [addTarget, setAddTarget] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeDetail | null>(null);
  const [statusTarget, setStatusTarget] = useState<EmployeeDetail | null>(null);

  const params = useMemo<ManagerEmployeeParams>(
    () => ({
      page,
      limit,
      search: searchQuery.trim() || undefined,
      status: statusFilter || undefined,
    }),
    [page, limit, searchQuery, statusFilter],
  );

  const { data, isLoading, isError, refetch } = useManagerEmployees(params);

  const employees = data?.data ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const startIndex = (page - 1) * limit + 1;

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load employees");
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Employees
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} employee{total === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddTarget(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Employee
        </button>
      </div>

      {/* Search & filters */}
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
            placeholder="Search by employee full name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
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
      </div>

      {/* Employees table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading employees...
            </p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load employees
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {searchQuery.trim() || statusFilter
                ? "No employees match your filters"
                : "No employees found"}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery.trim() || statusFilter
                ? "Try adjusting your search query"
                : "Employees will appear here once they are added."}
            </p>
          </div>
        ) : (
          <>
            <div className="table-scrollbar max-h-[65vh] overflow-auto">
              <table className="w-full min-w-[960px]">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Phone
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Position
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Role
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/employees/${employee.id}`);
                        }
                      }}
                      className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    >
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar
                            firstName={employee.user?.firstName}
                            lastName={employee.user?.lastName}
                            name={employee.fullName}
                            src={getAssetUrl(employee.profilePicture)}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {employee.fullName}
                              </p>
                              {employee.email.toLowerCase() ===
                                currentUserEmail && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                  Me
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Phone
                            className="w-4 h-4 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {employee.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Briefcase
                            className="w-4 h-4 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {employee.position}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <Building2
                            className="w-4 h-4 text-gray-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {employee.department?.name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeClass[employee.role] ?? "bg-gray-500/10 text-gray-600 dark:text-gray-300"}`}
                        >
                          <ShieldCheck
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                          />
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        {employee.isActive ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span
                              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                              aria-hidden="true"
                            />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-400">
                            <span
                              className="h-2 w-2 rounded-full bg-gray-400"
                              aria-hidden="true"
                            />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <CalendarClock
                            className="w-4 h-4 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(employee.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTarget(employee);
                            }}
                            title="Edit employee"
                            aria-label={`Edit ${employee.fullName}`}
                            className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusTarget(employee);
                            }}
                            title={
                              employee.isActive
                                ? "Deactivate employee"
                                : "Activate employee"
                            }
                            aria-label={`${
                              employee.isActive ? "Deactivate" : "Activate"
                            } ${employee.fullName}`}
                            className={`flex items-center justify-center h-9 w-9 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 ${
                              employee.isActive
                                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-600 hover:text-white focus-visible:ring-amber-500"
                                : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white focus-visible:ring-emerald-500"
                            }`}
                          >
                            {employee.isActive ? (
                              <UserX className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <UserCheck className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(employee);
                            }}
                            title="Delete employee"
                            aria-label={`Delete ${employee.fullName}`}
                            className="flex items-center justify-center h-9 w-9 rounded-lg text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-600 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
                  {Math.min(startIndex + limit - 1, total)} of {total} employee
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

      {addTarget && (
        <AddEmployeeModal
          onClose={() => setAddTarget(false)}
          onCreated={() => refetch()}
        />
      )}

      {editTarget && (
        <EditEmployeeModal
          employee={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => refetch()}
        />
      )}

      {deleteTarget && (
        <DeleteEmployeeModal
          employeeId={deleteTarget.id}
          employeeName={deleteTarget.fullName}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => refetch()}
        />
      )}

      {statusTarget && (
        <StatusEmployeeModal
          employeeId={statusTarget.id}
          employeeName={statusTarget.fullName}
          isActive={statusTarget.isActive}
          onClose={() => setStatusTarget(null)}
          onUpdated={() => refetch()}
        />
      )}
    </div>
  );
};

export default ManagerEmployeesPage;
