import { useForm } from "react-hook-form";
import { X, Loader2, MinusCircle } from "lucide-react";
import { useAddDeduction } from "@/features/payroll/payroll.hooks";
import type { DeductionType } from "@/api/user.api";

interface FormValues {
  amount: number;
  type: DeductionType;
  reason: string;
}

const deductionTypeOptions: { value: DeductionType; label: string }[] = [
  { value: "ABSENCE", label: "Absence" },
  { value: "LATE", label: "Late" },
  { value: "UNPAID_LEAVE", label: "Unpaid Leave" },
  { value: "DISCIPLINARY", label: "Disciplinary" },
  { value: "OTHER", label: "Other" },
];

const AddDeductionModal = ({
  payrollId,
  onClose,
}: {
  payrollId: string;
  onClose: () => void;
}) => {
  const { mutate: addDeduction, isPending } = useAddDeduction();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      amount: 0,
      type: "ABSENCE",
      reason: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    addDeduction(
      {
        payrollId,
        data: { amount: data.amount, type: data.type, reason: data.reason },
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add deduction"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!isPending) onClose();
        }}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Add Deduction
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select a type and enter amount
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close modal"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 grid grid-cols-1 gap-5"
        >
          <div>
            <label
              htmlFor="deduction-type"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Type
            </label>
            <select
              id="deduction-type"
              {...register("type", { required: "Type is required" })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {deductionTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-xs text-red-600">
                {errors.type.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="deduction-amount"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Amount
            </label>
            <input
              id="deduction-amount"
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "Must be greater than 0" },
              })}
              placeholder="e.g. 200"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="deduction-reason"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Reason
            </label>
            <input
              id="deduction-reason"
              type="text"
              {...register("reason", {
                required: "Reason is required",
                minLength: { value: 2, message: "At least 2 characters" },
              })}
              placeholder="e.g. Unauthorized absence on June 10"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-600">
                {errors.reason.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <MinusCircle className="w-4 h-4" aria-hidden="true" />
            )}
            {isPending ? "Adding..." : "Add Deduction"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDeductionModal;
