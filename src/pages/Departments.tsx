import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Users,
  RefreshCw,
  Briefcase,
  Loader2,
  X,
  Pencil,
  Trash2,
  UserPlus,
  Plus,
} from "lucide-react";
import { useDepartments, useUpdateDepartment, useDeleteDepartment, useCreateDepartment } from "@/features/employees/employees.hooks";
import AssignEmployeesToDepartmentModal from "@/components/departments/AssignEmployeesToDepartmentModal";
import {
  BarChartCard,
  DoughnutChartCard,
  type ChartItem,
} from "@/components/dashboard/charts";
import type { Department } from "@/api/user.api";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";

const Departments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const createDepartment = useCreateDepartment();
  const [editNameTarget, setEditNameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [assignTarget, setAssignTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDepartment.mutateAsync(String(deleteTarget.id));
      setDeleteTarget(null);
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };
  const {
    data: departments = [],
    isLoading,
    isError,
    refetch,
  } = useDepartments();

  const handleCreate = async () => {
    const name = newDepartmentName.trim();
    if (!name) return;
    try {
      const created = await createDepartment.mutateAsync(name);
      queryClient.setQueryData<Department[]>(
        ["departments"],
        (old = []) => [created, ...old],
      );
      setIsAddOpen(false);
      setNewDepartmentName("");
    } catch {
      // Error is handled by the mutation
    }
  };

  const openEditNameModal = (department: { id: string; name: string }) => {
    setEditNameTarget({ id: department.id, name: department.name });
    setNameInput(department.name);
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

  const stats = useMemo(() => {
    const totalEmployees = departments.reduce(
      (sum, dept) => sum + (dept.employees?.length ?? 0),
      0,
    );
    const withEmployees = departments.filter(
      (dept) => (dept.employees?.length ?? 0) > 0,
    ).length;
    return { totalDepartments: departments.length, totalEmployees, withEmployees };
  }, [departments]);

  const chartItems: ChartItem[] = useMemo(
    () =>
      departments.map((dept) => ({
        label: dept.name,
        value: dept.employees?.length ?? 0,
      })),
    [departments],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl opacity-50" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              Departments
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Overview of departments and their employee distribution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setNewDepartmentName("");
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Department
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <Building2 className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.totalDepartments}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Departments
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.totalEmployees}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total employees
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Briefcase className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.withEmployees}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Departments with employees
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard title="Employees per department" items={chartItems} />
        <DoughnutChartCard title="Department distribution" items={chartItems} />
      </div>

      {/* Departments table */}
      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-16 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading departments...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-12 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">
            We couldn't load the departments.
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
      ) : departments.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No departments available yet.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="table-scrollbar max-h-[60vh] overflow-auto">
            <table className="w-full min-w-[760px]">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee names
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {departments.map((department) => (
                  <tr
                    key={department.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/departments/${department.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/departments/${department.id}`);
                      }
                    }}
                    className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-primary/5 dark:focus-visible:bg-white/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
                          <Building2 className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditNameModal(department);
                          }}
                          title="Rename department"
                          className="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-input px-2.5 py-1.5 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors"
                        >
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {department.name}
                          </span>
                          <Pencil className="w-3.5 h-3.5 text-gray-400 opacity-60 group-hover:opacity-100 group-hover:text-blue-500 transition-opacity" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        <Users className="w-3.5 h-3.5" aria-hidden="true" />
                        {department.employees?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {department.employees && department.employees.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {department.employees.map((employee) => (
                            <span
                              key={employee.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-medium text-gray-700 dark:text-gray-300"
                            >
                              <Avatar
                                firstName={undefined}
                                lastName={undefined}
                                name={employee.fullName}
                                src={getAssetUrl(employee.profilePicture)}
                                size="sm"
                              />
                              <span className="flex flex-col leading-tight">
                                <span>{employee.fullName}</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {employee.email}
                                </span>
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          No employees assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ id: department.id, name: department.name });
                          }}
                          title="Delete department"
                          aria-label={`Delete ${department.name}`}
                          className="flex items-center justify-center h-9 w-9 rounded-lg text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-600 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignTarget({ id: department.id, name: department.name });
                          }}
                          title="Assign employees"
                          aria-label={`Assign employees to ${department.name}`}
                          className="flex items-center justify-center h-9 w-9 rounded-lg text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          <UserPlus className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete department"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleteDepartment.isPending) setDeleteTarget(null);
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
                This will permanently delete{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {deleteTarget.name}
                </span>
                . This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
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

      {assignTarget && (
        <AssignEmployeesToDepartmentModal
          departmentId={assignTarget.id}
          departmentName={assignTarget.name}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add department"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!createDepartment.isPending) setIsAddOpen(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Add Department
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                disabled={createDepartment.isPending}
                aria-label="Close add department modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
              >
                <label
                  htmlFor="add-department-name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Department name
                </label>
                <input
                  id="add-department-name"
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  autoFocus
                  placeholder="e.g. Human Resources"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    disabled={createDepartment.isPending}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createDepartment.isPending || !newDepartmentName.trim()}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {createDepartment.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create
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

export default Departments;
