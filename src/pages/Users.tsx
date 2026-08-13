import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Search,
  RefreshCw,
  Users,
  Phone,
  MapPin,
  ShieldCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  Loader2,
  LogOut,
  UserPlus,
} from "lucide-react";
import Avatar from "@/components/common/Avatar";
import {
  useUsers,
  useCreateUser,
  useDeleteUser,
  useUpdateUserById,
  useAdminLogoutUser,
} from "@/features/users/users.hooks";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";
import type { User } from "@/api/user.api";
import type { RootState } from "@/store/store";

const roleBadgeClass: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Employee: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const PAGE_SIZES = [5, 10, 15, 20];

type UserRole = "Admin" | "Manager" | "Employee";

interface CreateUserFormValues {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  username: string;
  password: string;
  role: UserRole;
}

const formatDate = (dateString?: string | null) =>
  dateString ? formatDateInUserZone(dateString, { dateOnly: true }) : "—";

const fullName = (user: User) =>
  `${user.firstName} ${user.lastName}`.trim() || "Unknown";

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const { data: users = [], isLoading, isError, refetch } = useUsers(true);
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUserById();
  const adminLogoutUser = useAdminLogoutUser();
  const createUser = useCreateUser();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [logoutTarget, setLogoutTarget] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      city: "",
      phoneNumber: "",
      nationalId: "",
      username: "",
      password: "",
      role: "Employee",
    },
  });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    country: "",
    city: "",
    phoneNumber: "",
    nationalId: "",
    role: "Employee" as "Admin" | "Manager" | "Employee",
  });

  const isCurrentUser = (userId: number) =>
    String(currentUserId) === String(userId);

  const openEditModal = (user: User) => {
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      phoneNumber: user.phoneNumber ?? "",
      nationalId: user.nationalId ?? "",
      role: (user.role as "Admin" | "Manager" | "Employee") ?? "Employee",
    });
    setEditTarget(user);
  };

  const handleSave = async () => {
    if (!editTarget) return;
    try {
      await updateUser.mutateAsync({
        id: String(editTarget.id),
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
      setEditTarget(null);
      toast.success("User updated successfully!");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("User deleted successfully!");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const onAddUserSubmit: SubmitHandler<CreateUserFormValues> = async (data) => {
    try {
      await createUser.mutateAsync(data);
      toast.success("User created successfully!");
      setIsAddModalOpen(false);
      reset();
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleLogout = async () => {
    if (!logoutTarget) return;
    try {
      await adminLogoutUser.mutateAsync(logoutTarget.id);
      setLogoutTarget(null);
      toast.success("User logged out from all devices successfully!");
      refetch();
    } catch {
      // Error is handled by the mutation
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [
        user.firstName,
        user.lastName,
        fullName(user),
        user.username,
        user.phoneNumber,
        user.role,
        user.city,
        user.country,
      ]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(query)),
    );
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const goTo = (target: number) => {
    if (target < 1 || target > totalPages) return;
    setPage(target);
  };

  const changePageSize = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {users.length} user{users.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Add User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, phone, role, city, or country..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading users...
            </p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load users
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
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {searchQuery ? "No users match your search" : "No users found"}
            </p>
          </div>
        ) : (
          <>
            <div className="table-scrollbar max-h-[65vh] overflow-auto">
              <table className="w-full min-w-[960px]">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Phone
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Location
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
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
                  {pageUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/users/${user.id}`)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/users/${user.id}`);
                        }
                      }}
                      className="group cursor-pointer hover:bg-[#2196F3]/30 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    >
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={fullName(user)}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            src={getAssetUrl(user.profilePicture)}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {fullName(user)}
                              </p>
                              {isCurrentUser(user.id) && (
                                <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                  ME
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                              {user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Phone
                            className="w-4 h-4 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {user.phoneNumber}
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
                            {[user.city, user.country]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeClass[user.role] ?? "bg-gray-500/10 text-gray-600 dark:text-gray-300"}`}
                        >
                          <ShieldCheck
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                          />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span
                              className="h-2 w-2 rounded-full bg-emerald-500"
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
                            className="w-4 h-4 text-gray-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {user.isEmailVerified
                              ? formatDate(user.emailVerifiedAt)
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
                              openEditModal(user);
                            }}
                            title="Edit user"
                            aria-label={`Edit ${fullName(user)}`}
                            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogoutTarget(user);
                            }}
                            title="Log out user"
                            aria-label={`Log out ${fullName(user)}`}
                            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                          >
                            <LogOut className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(user);
                            }}
                            disabled={isCurrentUser(user.id)}
                            title={
                              isCurrentUser(user.id)
                                ? "You cannot delete your own account"
                                : "Delete user"
                            }
                            aria-label={`Delete ${fullName(user)}`}
                            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + pageSize, filteredUsers.length)} of{" "}
                  {filteredUsers.length} user
                  {filteredUsers.length === 1 ? "" : "s"}
                </span>
                <select
                  value={pageSize}
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
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage === totalPages}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit user"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!updateUser.isPending) setEditTarget(null);
            }}
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
                onClick={() => setEditTarget(null)}
                disabled={updateUser.isPending}
                aria-label="Close edit modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                    setForm({ ...form, role: e.target.value as typeof form.role })
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
                  onClick={() => setEditTarget(null)}
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
                      <Pencil className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {logoutTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Logout user"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!adminLogoutUser.isPending) setLogoutTarget(null);
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
                  {fullName(logoutTarget)}
                </span>{" "}
                out of all devices and revoke all active sessions.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setLogoutTarget(null)}
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

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete user"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleteUser.isPending) setDeleteTarget(null);
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
                  {fullName(deleteTarget)}
                </span>
                . This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
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

      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add user"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!isSubmitting) setIsAddModalOpen(false);
            }}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Add User
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Create a new user account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                aria-label="Close add modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onAddUserSubmit)}
              className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="add-firstName"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  First name
                </label>
                <input
                  id="add-firstName"
                  type="text"
                  placeholder="e.g. Mohamed"
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z][A-Za-z\s'-]*$/,
                      message: "First name must contain only letters",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.firstName
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="add-lastName"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Last name
                </label>
                <input
                  id="add-lastName"
                  type="text"
                  placeholder="e.g. Amer"
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "Last name must be at least 2 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z][A-Za-z\s'-]*$/,
                      message: "Last name must contain only letters",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.lastName
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="add-country"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Country
                </label>
                <input
                  id="add-country"
                  type="text"
                  placeholder="e.g. Egypt"
                  {...register("country", {
                    required: "Country is required",
                    minLength: {
                      value: 2,
                      message: "Country must be at least 2 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z][A-Za-z\s'-]*$/,
                      message: "Country must contain only letters",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.country
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.country.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="add-city"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  City
                </label>
                <input
                  id="add-city"
                  type="text"
                  placeholder="e.g. Cairo"
                  {...register("city", {
                    required: "City is required",
                    minLength: {
                      value: 2,
                      message: "City must be at least 2 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z][A-Za-z\s'-]*$/,
                      message: "City must contain only letters",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.city
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="add-phoneNumber"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Phone
                </label>
                <input
                  id="add-phoneNumber"
                  type="tel"
                  placeholder="+20 123 456 7890"
                  {...register("phoneNumber", {
                    required: "Phone is required",
                    validate: (value) => {
                      const normalized = (value || "").replace(/[\s-]/g, "");
                      return (
                        /^(?:01[0-9]{9}|\+201[0-9]{9})$/.test(normalized) ||
                        "The phone must be a valid Egyptian number (e.g. 01xxxxxxxxx or +20 1xxxxxxxxx)."
                      );
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.phoneNumber
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="add-nationalId"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  National ID
                </label>
                <input
                  id="add-nationalId"
                  type="text"
                  placeholder="14-digit national ID"
                  {...register("nationalId", {
                    required: "National ID is required",
                    pattern: {
                      value: /^\d{14}$/,
                      message: "National ID must be 14 digits",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.nationalId
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                />
                {errors.nationalId && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.nationalId.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="add-username"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="add-username"
                  type="text"
                  placeholder="email@example.com"
                  {...register("username", {
                    required: "Username is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.username
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="add-password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="add-password"
                  type="password"
                  placeholder="At least 8 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
                      message:
                        "Password must include an uppercase letter, a lowercase letter, and a number",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.password
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="add-role"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Role
                </label>
                <select
                  id="add-role"
                                    {...register("role", {
                    required: "Role is required",
                  })}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.role
                      ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.role.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
