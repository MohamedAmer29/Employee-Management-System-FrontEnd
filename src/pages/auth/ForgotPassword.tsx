import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useForgotPassword } from "@/features/auth/auth.hooks";
import SeoHead from "@/components/common/SeoHead";

interface FormValues {
  email: string;
}

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
  });

  const onSubmit = (data: FormValues) => {
    forgotPassword(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#E3F2FD] dark:bg-[#0A1C33]">
      <SeoHead title="Forgot Password" path="/forgot-password" />
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
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter your email and we'll send you a reset code
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  aria-invalid={errors.email ? "true" : "false"}
                  disabled={isPending}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500" role="alert">
                  {errors.email.message}
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
                  Sending...
                </span>
              ) : (
                "Send Reset Code"
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

export default ForgotPassword;
