import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useResetPassword } from "@/features/auth/auth.hooks";
import SeoHead from "@/components/common/SeoHead";

interface FormValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const { mutate: resetPassword, isPending } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
  });

  const onSubmit = (data: FormValues) => {
    resetPassword({
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#E3F2FD] dark:bg-[#0A1C33]">
      <SeoHead title="Reset Password" path="/reset-password" />
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 text-primary mb-4">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Min 8 characters" },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                      message: "Requires uppercase, lowercase, number, and special character",
                    },
                  })}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  aria-invalid={errors.password ? "true" : "false"}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === getValues("password") || "Passwords do not match",
                  })}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-primary-dark hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Reset Password
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
