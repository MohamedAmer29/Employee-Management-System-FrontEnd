import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  Phone,
  Briefcase,
  ShieldCheck,
  Mail,
  RefreshCw,
  Loader2,
  X,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  useDepartment,
  useUpdateDepartment,
  useUpdateEmployee,
  useDeleteDepartment,
} from "@/features/employees/employees.hooks";
import AssignEmployeesToDepartmentModal from "@/components/departments/AssignEmployeesToDepartmentModal";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";

const roleBadgeClass: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Employee: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const DepartmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateEmployee = useUpdateEmployee();
  const [editPositionTarget, setEditPositionTarget] = useState<{
    id: number;
    fullName: string;
    position: string;
  } | null>(null);
  const [positionInput, setPositionInput] = useState("");
  const [editNameTarget, setEditNameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [nameInput, setNameInput] = useState("");
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const { data: department, isLoading, isError, refetch } = useDepartment(id);

  const openEditNameModal = (dept: { id: string; name: string }) => {
    setEditNameTarget({ id: dept.id, name: dept.name });
    setNameInput(dept.name);
  };

  const handleSaveName = async () => {
    if (!editNameTarget) return;
    const name = nameInput.trim();
    if (!name) return;
    try {
      await updateDepartment.mutateAsync({
        id: String(editNameTarget.id),
        name,
      });
      setEditNameTarget(null);
      setNameInput("");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDepartment.mutateAsync(String(id));
      navigate("/departments");
    } catch {
      // Error is handled by the mutation
    }
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

  const stats = useMemo(() => {
    const employees = department?.employees ?? [];
    return {
      total: employees.length,
      active: employees.filter((employee) => employee.isActive).length,
      inactive: employees.filter((employee) => !employee.isActive).length,
    };
  }, [department]);

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Loading department details"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !department) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load the department details.
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl opacity-50" />
          <div className="relative flex items-center gap-3">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
              <Building2 className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
                  {department.name}
                </h1>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditNameModal({
                      id: department.id,
                      name: department.name,
                    });
                  }}
                  title="Rename department"
                  aria-label="Rename department"
                  className="flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-input text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-500 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {department.description || "Department details"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete department"
            aria-label="Delete department"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800/60 hover:bg-red-600 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>

          <button
            type="button"
            onClick={() => setIsAssigning(true)}
            title="Assign employees"
            aria-label="Assign employees to this department"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Assign Employees
          </button>
          <button
            type="button"
            onClick={() => navigate("/departments")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Departments
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <Users className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.total}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total employees
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.active}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Active
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gray-500/15 text-gray-600 dark:text-gray-400">
            <Users className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.inactive}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Inactive
            </p>
          </div>
        </div>
      </div>

      {/* Employees table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Employees in {department.name}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {stats.total} employee{stats.total === 1 ? "" : "s"}
          </span>
        </div>
        {department.employees && department.employees.length > 0 ? (
          <div className="table-scrollbar max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {department.employees.map((employee) => (
                  <tr
                    key={employee.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/employees/${employee.id}`)}
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
                          name={employee.fullName}
                          src={getAssetUrl(employee.profilePicture)}
                          size="md"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {employee.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            #{employee.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <Mail
                          className="w-4 h-4 text-gray-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {employee.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <Phone
                          className="w-4 h-4 text-gray-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {employee.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
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
                          className="w-4 h-4 text-gray-400 group-hover:text-blue-500 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {employee.position}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
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
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateInUserZone(employee.createdAt, {
                          dateOnly: true,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No employees assigned to this department yet.
            </p>
          </div>
        )}
      </div>

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
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Change position
              </h3>
              <button
                type="button"
                onClick={() => setEditPositionTarget(null)}
                disabled={updateEmployee.isPending}
                aria-label="Close change position modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Changing position for{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {editPositionTarget.fullName}
                </span>
                :
              </p>
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

      {editNameTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Rename department"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!updateDepartment.isPending) setEditNameTarget(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Rename department
              </h3>
              <button
                type="button"
                onClick={() => setEditNameTarget(null)}
                disabled={updateDepartment.isPending}
                aria-label="Close rename department modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveName();
                }}
              >
                <label
                  htmlFor="department-name-input"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Department name
                </label>
                <input
                  id="department-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setEditNameTarget(null)}
                    disabled={updateDepartment.isPending}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateDepartment.isPending || !nameInput.trim()}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {updateDepartment.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Pencil className="w-4 h-4" />
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

      {isAssigning && id && (
        <AssignEmployeesToDepartmentModal
          departmentId={id}
          departmentName={department.name}
          onClose={() => setIsAssigning(false)}
        />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete department"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleteDepartment.isPending) setShowDeleteConfirm(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
                <Trash2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Delete this department?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this department? This action
                cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteDepartment.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteDepartment.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {deleteDepartment.isPending ? (
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
    </div>
  );
};

export default DepartmentDetails;
