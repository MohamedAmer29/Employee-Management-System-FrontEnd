import { useMemo, useState } from "react";
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
  Trash2,
  Loader2,
  Network,
  X,
  Plus,
  Save,
} from "lucide-react";
import Avatar from "@/components/common/Avatar";
import {
  useEmployees,
  useDeleteEmployee,
  useDepartments,
  useAssignDepartment,
  useCreateEmployee,
  useUsers,
  useUpdateEmployee,
} from "@/features/employees/employees.hooks";
import type { RootState } from "@/store/store";
import type { UpdateEmployeeRequest, User } from "@/api/user.api";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";

const roleBadgeClass: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Employee: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const formatUserOption = (user: User) => {
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

const initialCreateForm = {
  userId: "",
  position: "",
  departmentId: "",
};

const formatDate = (dateString: string) =>
  formatDateInUserZone(dateString, { dateOnly: true });

const Employees = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserEmail = currentUser?.username?.toLowerCase();
  const { data: employees, isLoading, isError, refetch } = useEmployees();
  const deleteEmployee = useDeleteEmployee();
  const assignDepartment = useAssignDepartment();
  const createEmployee = useCreateEmployee();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    fullName: string;
    isActive: boolean;
  } | null>(null);
  const [assignTarget, setAssignTarget] = useState<{
    id: number;
    fullName: string;
  } | null>(null);
  const [editPositionTarget, setEditPositionTarget] = useState<{
    id: number;
    fullName: string;
    position: string;
  } | null>(null);
  const [positionInput, setPositionInput] = useState("");
  const updateEmployee = useUpdateEmployee();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [inactiveConfirm, setInactiveConfirm] = useState<{
    user: User;
    previous: string;
  } | null>(null);
  const {
    data: departments = [],
    isFetching: isFetchingDepartments,
    isError: departmentsError,
    refetch: refetchDepartments,
  } = useDepartments(assignTarget !== null || isAddModalOpen);
  const { data: users = [], isLoading: isUsersLoading } =
    useUsers(isAddModalOpen);

  const handleCreate = async () => {
    const selectedUser = users.find(
      (user) => String(user.id) === createForm.userId,
    );
    if (!selectedUser) return;

    const fullName =
      `${selectedUser.firstName} ${selectedUser.lastName}`.trim() ||
      selectedUser.username;
    const email = (selectedUser.username || "").trim();
    const phone = (selectedUser.phoneNumber || "").replace(/[\s-]/g, "");
    const position = createForm.position.trim();

    if (fullName.length < 2) {
      toast.error("Full name must be at least 2 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(
        "The selected user has an invalid email address; it must be a valid email.",
      );
      return;
    }
    if (!/^(?:\+?20)?01[0-9]{9}$/.test(phone)) {
      toast.error(
        "The selected user's phone must be a valid Egyptian number (e.g. 01xxxxxxxxx or +20 1xxxxxxxxx).",
      );
      return;
    }
    if (position.length < 2) {
      toast.error("Position must be at least 2 characters.");
      return;
    }

    const data: UpdateEmployeeRequest = {
      fullName,
      email,
      phone: selectedUser.phoneNumber,
      position,
      role: selectedUser.role as "Admin" | "Manager" | "Employee",
      userId: String(selectedUser.id),
      isActive: selectedUser.isActive,
    };
    if (createForm.departmentId.trim()) {
      data.departmentId = createForm.departmentId.trim();
    }
    try {
      await createEmployee.mutateAsync(data);
      setIsAddModalOpen(false);
      setCreateForm(initialCreateForm);
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleUserIdChange = (value: string) => {
    if (!value) {
      setCreateForm({ ...createForm, userId: "" });
      return;
    }
    const user = users.find((u) => String(u.id) === value);
    if (user && !user.isActive) {
      setInactiveConfirm({ user, previous: createForm.userId });
    } else {
      setCreateForm({ ...createForm, userId: value });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee.mutateAsync(String(deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  const openAssignModal = (employee: {
    id: number;
    fullName: string;
    currentDepartmentId?: string;
  }) => {
    setAssignTarget({ id: employee.id, fullName: employee.fullName });
    setSelectedDepartmentId(employee.currentDepartmentId ?? "");
  };

  const openEditPositionModal = (employee: {
    id: number;
    fullName: string;
    position: string;
  }) => {
    setEditPositionTarget({
      id: employee.id,
      fullName: employee.fullName,
      position: employee.position,
    });
    setPositionInput(employee.position);
  };

  const handleSavePosition = async () => {
    if (!editPositionTarget) return;
    const position = positionInput.trim();
    if (!position) return;
    try {
      await updateEmployee.mutateAsync({
        id: String(editPositionTarget.id),
        data: { position },
      });
      setEditPositionTarget(null);
      setPositionInput("");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleAssign = async () => {
    if (!assignTarget || !selectedDepartmentId) return;
    try {
      await assignDepartment.mutateAsync({
        id: String(assignTarget.id),
        departmentId: selectedDepartmentId,
      });
      setAssignTarget(null);
      setSelectedDepartmentId("");
    } catch {
      // Error is handled by the mutation
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return employees ?? [];
    return (employees ?? []).filter((employee) =>
      [
        employee.fullName,
        employee.email,
        employee.phone,
        employee.position,
        employee.role,
        employee.department?.name,
      ]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(query)),
    );
  }, [employees, searchQuery]);

  const total = employees?.length ?? 0;

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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, position, role, or department..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Employees Table */}
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
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {searchQuery
                ? "No employees match your search"
                : "No employees found"}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search query"
                : "Employees will appear here once they are added."}
            </p>
          </div>
        ) : (
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
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    onClick={() => navigate(`/employees/${employee.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/employees/${employee.id}`);
                      }
                    }}
                    className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-primary/5 dark:focus-visible:bg-white/5"
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPositionModal(employee);
                        }}
                        title="Change position"
                        className="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-input px-2.5 py-1.5 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors"
                      >
                        <Briefcase
                          className="w-4 h-4 text-gray-400 group-hover:text-blue-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {employee.position}
                        </span>
                      </button>
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
                            openAssignModal({
                              id: employee.id,
                              fullName: employee.fullName,
                              currentDepartmentId: employee.department?.id
                                ? String(employee.department.id)
                                : "",
                            });
                          }}
                          title="Assign to department"
                          aria-label={`Assign ${employee.fullName} to a department`}
                          className="flex items-center justify-center h-9 w-9 rounded-lg text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          <Network className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({
                              id: employee.id,
                              fullName: employee.fullName,
                              isActive: employee.isActive,
                            });
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
        )}
      </div>

      {/* Add employee modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add employee"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!createEmployee.isPending) setIsAddModalOpen(false);
            }}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Add Employee
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Fill in the employee details and account assignment
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={createEmployee.isPending}
                aria-label="Close add employee modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label
                  htmlFor="create-user"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  User account
                </label>
                <select
                  id="create-user"
                  value={createForm.userId}
                  onChange={(e) => handleUserIdChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">
                    {isUsersLoading
                      ? "Loading user accounts..."
                      : "Select a user account..."}
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {formatUserOption(user)}
                    </option>
                  ))}
                </select>
              </div>

              {createForm.userId &&
                (() => {
                  const selectedUser = users.find(
                    (user) => String(user.id) === createForm.userId,
                  );
                  if (!selectedUser) return null;
                  return (
                    <div className="sm:col-span-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                        Employee details (from selected user)
                      </p>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">
                            Full name
                          </dt>
                          <dd className="font-semibold text-gray-900 dark:text-gray-100">
                            {`${selectedUser.firstName} ${selectedUser.lastName}`.trim()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">
                            Email
                          </dt>
                          <dd className="font-semibold text-gray-900 dark:text-gray-100 break-all">
                            {selectedUser.username}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">
                            Phone
                          </dt>
                          <dd className="font-semibold text-gray-900 dark:text-gray-100">
                            {selectedUser.phoneNumber}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">
                            Role
                          </dt>
                          <dd className="font-semibold text-gray-900 dark:text-gray-100">
                            {selectedUser.role}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">
                            Active status
                          </dt>
                          <dd
                            className={`font-semibold ${
                              selectedUser.isActive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {selectedUser.isActive ? "Active" : "Inactive"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  );
                })()}

              <div>
                <label
                  htmlFor="create-position"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Position
                </label>
                <input
                  id="create-position"
                  type="text"
                  value={createForm.position}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, position: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="create-department"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Department
                </label>
                <select
                  id="create-department"
                  value={createForm.departmentId}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      departmentId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">
                    {isFetchingDepartments ? "Loading departments..." : "None"}
                  </option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={createEmployee.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={createEmployee.isPending || !createForm.userId}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {createEmployee.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Add Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inactive user confirmation modal */}
      {inactiveConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Inactive user confirmation"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setCreateForm({
                ...createForm,
                userId: inactiveConfirm.previous,
              });
              setInactiveConfirm(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-5">
                <Users className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                User account is inactive
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {`${inactiveConfirm.user.firstName} ${inactiveConfirm.user.lastName}`.trim()}
                </span>{" "}
                is inactive. Are you sure you want to select this user account?
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setCreateForm({
                      ...createForm,
                      userId: inactiveConfirm.previous,
                    });
                    setInactiveConfirm(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateForm({
                      ...createForm,
                      userId: String(inactiveConfirm.user.id),
                    });
                    setInactiveConfirm(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  Yes, select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign department modal */}
      {assignTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Assign employee to department"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!assignDepartment.isPending) setAssignTarget(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Assign Department
              </h3>
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
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
                  {assignTarget.fullName}
                </span>{" "}
                to a department:
              </p>

              {isFetchingDepartments ? (
                <div
                  className="flex items-center justify-center py-12"
                  role="status"
                  aria-label="Loading departments"
                >
                  <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
              ) : departmentsError ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Failed to load departments
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchDepartments()}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    Try Again
                  </button>
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
                onClick={() => setAssignTarget(null)}
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete employee"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleteEmployee.isPending) setDeleteTarget(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
                <Trash2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {deleteTarget.isActive
                  ? "Delete this employee?"
                  : "User is inactive"}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {deleteTarget.isActive ? (
                  <>
                    This will permanently delete{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {deleteTarget.fullName}
                    </span>
                    . This action cannot be undone.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {deleteTarget.fullName}
                    </span>{" "}
                    is inactive. Are you sure you want to delete this employee?
                  </>
                )}
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
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
                      Sure
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editPositionTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Change position"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!updateEmployee.isPending) setEditPositionTarget(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Briefcase className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    Change position
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editPositionTarget.fullName}
                  </p>
                </div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePosition();
                }}
              >
                <label
                  htmlFor="position-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Position
                </label>
                <input
                  id="position-input"
                  type="text"
                  value={positionInput}
                  onChange={(e) => setPositionInput(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-dark-input border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setEditPositionTarget(null)}
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
    </div>
  );
};

export default Employees;
