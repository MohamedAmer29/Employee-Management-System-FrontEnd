import { useForm } from "react-hook-form";
import { X, Loader2, Calculator } from "lucide-react";
import { useCalculateEmployeeSalary } from "@/features/payroll/payroll.hooks";
import { useEmployees } from "@/features/employees/employees.hooks";

interface FormValues {
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  workingDays: number;
}

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

const CalculateEmployeeSalaryModal = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const { mutate: calculateSalary, isPending } = useCalculateEmployeeSalary();
  const { data: employees = [] } = useEmployees();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      employeeId: "",
      month: new Date().getMonth() + 1,
      year: currentYear,
      baseSalary: 0,
      workingDays: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    const { employeeId, ...rest } = data;
    calculateSalary(
      { employeeId, data: rest },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Calculate employee salary"
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
              Calculate Employee Salary
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Generate a payroll record for an employee
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
              htmlFor="emp-id"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Employee
            </label>
            <select
              id="emp-id"
              {...register("employeeId", {
                required: "Employee is required",
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} — {emp.position}
                </option>
              ))}
            </select>
            {errors.employeeId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.employeeId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="emp-month"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Month
              </label>
              <select
                id="emp-month"
                {...register("month", {
                  required: "Month is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Min 1" },
                  max: { value: 12, message: "Max 12" },
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {monthNames.map((name, i) =>
                  i === 0 ? null : (
                    <option key={i} value={i}>
                      {name}
                    </option>
                  ),
                )}
              </select>
              {errors.month && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.month.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="emp-year"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Year
              </label>
              <select
                id="emp-year"
                {...register("year", {
                  required: "Year is required",
                  valueAsNumber: true,
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.year.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="emp-salary"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Base Salary
              </label>
              <input
                id="emp-salary"
                type="number"
                {...register("baseSalary", {
                  required: "Base salary is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Must be greater than 0" },
                })}
                placeholder="e.g. 5000"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {errors.baseSalary && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.baseSalary.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="emp-days"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Working Days
              </label>
              <input
                id="emp-days"
                type="number"
                {...register("workingDays", {
                  required: "Working days is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Must be at least 1" },
                  max: { value: 31, message: "Max 31" },
                })}
                placeholder="e.g. 22"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {errors.workingDays && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.workingDays.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Calculator className="w-4 h-4" aria-hidden="true" />
            )}
            {isPending ? "Calculating..." : "Calculate Salary"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CalculateEmployeeSalaryModal;
