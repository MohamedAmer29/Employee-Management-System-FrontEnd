import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  TrendingUp,
  RefreshCw,
  Star,
  StarHalf,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  MessageSquareQuote,
  CalendarDays,
  Phone,
  ShieldCheck,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  usePerformanceReviews,
  useUpdatePerformanceReview,
  useDeletePerformanceReview,
  useCreatePerformanceReview,
} from "@/features/performance/performance.hooks";
import { useEmployees } from "@/features/employees/employees.hooks";
import Avatar from "@/components/common/Avatar";
import { getAssetUrl } from "@/utils/assetUrl";
import { formatDateInUserZone } from "@/utils/formatDate";

const ratingOptions = ["all", 1, 2, 3, 4, 5];

const Stars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

const getRatingColor = (rating: number) => {
  if (rating >= 4)
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (rating >= 3) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-red-500/10 text-red-600 dark:text-red-400";
};

const getRatingLabel = (rating: number) => {
  if (rating >= 4) return "Good";
  if (rating >= 3) return "Average";
  return "Needs improvement";
};

const StarsInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
            className="p-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hovered || value)
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 dark:text-gray-600 hover:text-amber-400"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value} star{value === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
};

const defaultForm = {
  employeeId: "",
  feedback: "",
  rating: 0,
  reviewDate: "",
};

const Performance = () => {
  const {
    data: reviews = [],
    isLoading,
    isError,
    refetch,
  } = usePerformanceReviews();
  const updateReview = useUpdatePerformanceReview();
  const deleteReview = useDeletePerformanceReview();
  const createReview = useCreatePerformanceReview();
  const { data: employees = [] } = useEmployees();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(defaultForm);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [editTarget, setEditTarget] = useState<{
    performanceId: string;
    employeeId: string;
    employeeName: string;
  } | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<{
    performanceId: string;
    fullName: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesRating =
        ratingFilter === "all" || review.rating === Number(ratingFilter);
      const matchesDate =
        !dateFilter ||
        (review.reviewDate && review.reviewDate.startsWith(dateFilter));
      return matchesRating && matchesDate;
    });
  }, [reviews, ratingFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const stats = useMemo(() => {
    const average =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : "0";
    const total = reviews.length;
    const good = reviews.filter((r) => r.rating >= 4).length;
    const needsImprovement = reviews.filter((r) => r.rating < 3).length;
    return { average: Number(average), total, good, needsImprovement };
  }, [reviews]);

  const handleCreate = async () => {
    if (
      !createForm.employeeId ||
      !createForm.feedback.trim() ||
      !createForm.rating ||
      !createForm.reviewDate
    ) {
      return;
    }
    try {
      await createReview.mutateAsync({
        employeeId: createForm.employeeId,
        feedback: createForm.feedback.trim(),
        rating: createForm.rating,
        reviewDate: createForm.reviewDate,
      });
      setIsCreateOpen(false);
      setCreateForm(defaultForm);
    } catch {
      // Error is handled by the mutation
    }
  };

  const openCreateModal = () => {
    setCreateForm(defaultForm);
    setIsCreateOpen(true);
  };

  const openEditModal = (review: (typeof reviews)[number]) => {
    setEditTarget({
      performanceId: String(review.id),
      employeeId: String(review.employee.id),
      employeeName: review.employee.fullName,
    });
    setForm({
      employeeId: String(review.employee.id),
      feedback: review.feedback ?? "",
      rating: review.rating,
      reviewDate: review.reviewDate,
    });
  };

  const handleUpdate = async () => {
    if (!editTarget || !form.feedback.trim() || form.rating === 0) return;
    try {
      await updateReview.mutateAsync({
        performanceId: editTarget.performanceId,
        data: {
          employeeId: form.employeeId,
          feedback: form.feedback.trim(),
          rating: form.rating,
          reviewDate: form.reviewDate,
        },
      });
      setEditTarget(null);
      setForm(defaultForm);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview.mutateAsync(deleteTarget.performanceId);
      setDeleteTarget(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Performance
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review employee performance ratings and feedback
          </p>
        </div>
        <div className="flex items-center gap-2 max-sm:m-auto">
          <button
            type="button"
            onClick={() => {
              refetch();
              toast.success("Performance reviews refreshed successfully");
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create Review
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
            <TrendingUp className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.total}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total reviews
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Star className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.average}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Avg rating
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <StarHalf className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.good}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Good (4+)
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400">
            <StarHalf className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.needsImprovement}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Needs improvement
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <CalendarDays
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {ratingOptions.map((rating) => (
                <option key={rating} value={String(rating)}>
                  {rating === "all" ? "All ratings" : `${rating} stars`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          role="status"
          aria-label="Loading performance reviews"
        >
          <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-12 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">
            We couldn't load the performance reviews.
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
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No performance reviews found.
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Cards per page:
              </label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={review.employee.fullName}
                      src={getAssetUrl(review.employee.profilePicture)}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {review.employee.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {review.employee.position || "No position"} ·{" "}
                        {review.employee.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRatingColor(
                      review.rating,
                    )}`}
                  >
                    {review.rating}/5
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getRatingLabel(review.rating)}
                  </span>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3 flex items-start gap-2">
                  <MessageSquareQuote
                    className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                    {review.feedback || "No feedback provided."}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <CalendarDays
                        className="w-3.5 h-3.5"
                        aria-hidden="true"
                      />
                      Review date
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {formatDateInUserZone(review.reviewDate, {
                        dateOnly: true,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <User className="w-3.5 h-3.5" aria-hidden="true" />
                      Reviewer
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {review.reviewer || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      Role
                    </span>
                    <span className="text-xs font-medium capitalize text-gray-900 dark:text-gray-100">
                      {review.employee.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                      Phone
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {review.employee.phone || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span
                        className="inline-block h-2 w-2 rounded-full bg-emerald-500"
                        aria-hidden="true"
                      />
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        review.employee.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {review.employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(review)}
                      title="Update review"
                      aria-label={`Update ${review.employee.fullName}'s review`}
                      className="flex items-center justify-center h-9 w-9 rounded-lg text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-600 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          performanceId: String(review.id),
                          fullName: review.employee.fullName,
                        })
                      }
                      title="Delete review"
                      aria-label={`Delete ${review.employee.fullName}'s review`}
                      className="flex items-center justify-center h-9 w-9 rounded-lg text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-600 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredReviews.length)} of{" "}
              {filteredReviews.length} reviews
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create performance review"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!createReview.isPending) {
                setIsCreateOpen(false);
                setCreateForm(defaultForm);
              }
            }}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Create Performance Review
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateForm(defaultForm);
                }}
                disabled={createReview.isPending}
                aria-label="Close create review modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="create-perf-employee"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Employee
                  </label>
                  {employees.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No employees available.
                    </p>
                  ) : (
                    <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-300 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-800">
                      {employees.map((employee) => {
                        const selected =
                          createForm.employeeId === String(employee.id);
                        return (
                          <button
                            key={employee.id}
                            type="button"
                            onClick={() =>
                              setCreateForm({
                                ...createForm,
                                employeeId: String(employee.id),
                              })
                            }
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer focus:outline-none ${
                              selected
                                ? "bg-primary/10 dark:bg-primary/20"
                                : "hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <Avatar
                              name={employee.fullName}
                              src={getAssetUrl(employee.profilePicture)}
                              size="sm"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {employee.fullName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {employee.position || "No position"} ·{" "}
                                {employee.role}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 shrink-0">
                              {employee.department?.name ?? "Unassigned"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="create-perf-feedback"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Feedback
                  </label>
                  <textarea
                    id="create-perf-feedback"
                    value={createForm.feedback}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, feedback: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Rating
                  </label>
                  <StarsInput
                    value={createForm.rating}
                    onChange={(rating) =>
                      setCreateForm({ ...createForm, rating })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="create-perf-date"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Review date
                  </label>
                  <input
                    id="create-perf-date"
                    type="date"
                    value={createForm.reviewDate}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        reviewDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setCreateForm(defaultForm);
                    }}
                    disabled={createReview.isPending}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createReview.isPending ||
                      !createForm.employeeId ||
                      !createForm.feedback.trim() ||
                      !createForm.rating ||
                      !createForm.reviewDate
                    }
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {createReview.isPending ? (
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

      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Update performance review"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!updateReview.isPending) {
                setEditTarget(null);
                setForm(defaultForm);
              }
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Update review
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditTarget(null);
                  setForm(defaultForm);
                }}
                disabled={updateReview.isPending}
                aria-label="Close update review modal"
                className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Updating review for{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {editTarget.employeeName}
                </span>
                :
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="perf-feedback"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Feedback
                  </label>
                  <textarea
                    id="perf-feedback"
                    value={form.feedback}
                    onChange={(e) =>
                      setForm({ ...form, feedback: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="perf-rating"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Rating
                  </label>
                  <StarsInput
                    value={form.rating}
                    onChange={(rating) => setForm({ ...form, rating })}
                  />
                </div>
                <div>
                  <label
                    htmlFor="perf-date"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Review date
                  </label>
                  <input
                    id="perf-date"
                    type="date"
                    value={form.reviewDate}
                    onChange={(e) =>
                      setForm({ ...form, reviewDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditTarget(null);
                      setForm(defaultForm);
                    }}
                    disabled={updateReview.isPending}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      updateReview.isPending ||
                      !form.feedback.trim() ||
                      form.rating === 0 ||
                      !form.reviewDate
                    }
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {updateReview.isPending ? (
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
          aria-label="Delete performance review"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleteReview.isPending) setDeleteTarget(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-5">
                <Trash2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Delete this review?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Are you sure you want to delete the review for{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {deleteTarget.fullName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteReview.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteReview.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {deleteReview.isPending ? (
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

export default Performance;
