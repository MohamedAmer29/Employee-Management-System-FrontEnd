import { useState } from "react";
import { useForm, type SubmitHandler, type FieldErrors } from "react-hook-form";
import { Lock, Eye, EyeOff, Camera } from "lucide-react";
import { useRegister } from "../../features/auth/auth.hooks";
import type { RegisterData } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { setVerificationEmail } from "../../utils/cookies";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
    setValue,
  } = useForm<RegisterData>({
    mode: "onChange",
  });

  const navigate = useNavigate();
  const { mutate: registerUser } = useRegister();
  const password = watch("password");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const profileFile = watch("profilePicture");

  const onSubmit: SubmitHandler<RegisterData> = (data) => {
    registerUser(data, {
      onSuccess: () => {
        setVerificationEmail(data.username);
        navigate("/verify-email");
      },
    });
  };

  const getErrorMessage = (
    error: FieldErrors<RegisterData>[keyof RegisterData],
  ): string => {
    if (error && typeof error === "object" && "message" in error) {
      return error.message as string;
    }
    return "Invalid input";
  };

  const inputClasses = (hasError: boolean) => `
    w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
    transition-all duration-200
    ${hasError ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
  `;

  const passwordInputClasses = (hasError: boolean) => `
    w-full pl-8 pr-8 py-2 text-sm rounded-lg border bg-white dark:bg-dark dark:text-gray-100 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
    transition-all duration-200
    ${hasError ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
  `;

  const passwordIconClasses = (hasError: boolean) => `
    absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
    ${hasError ? "text-red-500" : "text-gray-400 dark:text-gray-500"}
  `;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      {/* Profile Picture */}
      <div className="flex justify-center">
        <label
          htmlFor="profilePicture"
          className="relative group cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/10 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary">
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <input
            id="profilePicture"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 2 * 1024 * 1024) {
                  alert("Profile picture must be less than 2 MB");
                  return;
                }
                setValue("profilePicture", file, { shouldValidate: true });
                const reader = new FileReader();
                reader.onload = () => setProfilePreview(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
          <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-colors" />
        </label>
      </div>
      {profileFile instanceof File && (
        <p className="text-center text-[10px] text-gray-500 dark:text-gray-400">
          {profileFile.name}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="firstName"
            className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            First Name{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="Mohamed"
            autoComplete="given-name"
            {...register("firstName", { required: "First name is required" })}
            className={inputClasses(!!errors.firstName)}
            aria-invalid={errors.firstName ? "true" : "false"}
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="mt-0.5 text-xs text-red-500" role="alert">
              {getErrorMessage(errors.firstName)}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Last Name{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Amer"
            autoComplete="family-name"
            {...register("lastName", { required: "Last name is required" })}
            className={inputClasses(!!errors.lastName)}
            aria-invalid={errors.lastName ? "true" : "false"}
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="mt-0.5 text-xs text-red-500" role="alert">
              {getErrorMessage(errors.lastName)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="country"
            className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Country{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="country"
            type="text"
            placeholder="Egypt"
            autoComplete="country"
            {...register("country", { required: "Country is required" })}
            className={inputClasses(!!errors.country)}
            aria-invalid={errors.country ? "true" : "false"}
            disabled={isSubmitting}
          />
          {errors.country && (
            <p className="mt-0.5 text-xs text-red-500" role="alert">
              {getErrorMessage(errors.country)}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            City{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="city"
            type="text"
            placeholder="Cairo"
            autoComplete="address-level2"
            {...register("city", { required: "City is required" })}
            className={inputClasses(!!errors.city)}
            aria-invalid={errors.city ? "true" : "false"}
            disabled={isSubmitting}
          />
          {errors.city && (
            <p className="mt-0.5 text-xs text-red-500" role="alert">
              {getErrorMessage(errors.city)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Phone Number{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            autoComplete="tel"
            placeholder="01234567890"
            {...register("phoneNumber", {
              required: "Phone is required",
              pattern: {
                value: /^(\+20|0)?1[0125]\d{8}$/,
                message: "Invalid phone",
              },
            })}
            className={inputClasses(!!errors.phoneNumber)}
            aria-invalid={errors.phoneNumber ? "true" : "false"}
            disabled={isSubmitting}
          />
          {errors.phoneNumber && (
            <p className="mt-0.5 text-xs text-red-500" role="alert">
              {getErrorMessage(errors.phoneNumber)}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="nationalId"
            className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            National ID{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="nationalId"
            type="text"
            placeholder="12345678901234"
            {...register("nationalId", {
              required: "National ID is required",
              pattern: {
                value: /^\d{14}$/,
                message: "Must be 14 digits",
              },
            })}
            className={inputClasses(!!errors.nationalId)}
            aria-invalid={errors.nationalId ? "true" : "false"}
            disabled={isSubmitting}
          />
          {errors.nationalId && (
            <p className="mt-0.5 text-xs text-red-500" role="alert">
              {getErrorMessage(errors.nationalId)}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="username"
          className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Username{" "}
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="mohamed123"
          {...register("username", {
            required: "Username is required",
            minLength: { value: 3, message: "Min 3 characters" },
          })}
          className={inputClasses(!!errors.username)}
          aria-invalid={errors.username ? "true" : "false"}
          disabled={isSubmitting}
        />
        {errors.username && (
          <p className="mt-0.5 text-xs text-red-500" role="alert">
            {getErrorMessage(errors.username)}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Email Address{" "}
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="mohamed@gmail.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email",
            },
          })}
          className={inputClasses(!!errors.email)}
          aria-invalid={errors.email ? "true" : "false"}
          disabled={isSubmitting}
        />
        <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
          Used as login/username
        </p>
        {errors.email && (
          <p className="mt-0.5 text-xs text-red-500" role="alert">
            {getErrorMessage(errors.email)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Password{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <div className="relative">
            <Lock className={passwordIconClasses(!!errors.password)} aria-hidden="true" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Min 8 chars",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                  message: "Req: upper, lower, number, special",
                },
              })}
              className={passwordInputClasses(!!errors.password)}
              aria-invalid={errors.password ? "true" : "false"}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-0.5 text-xs text-red-500" role="alert">
              {getErrorMessage(errors.password)}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Confirm Password{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <div className="relative">
            <Lock className={passwordIconClasses(!!errors.confirmPassword)} aria-hidden="true" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword", {
                required: "Confirm password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={passwordInputClasses(!!errors.confirmPassword)}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-0.5 text-xs text-red-500" role="alert">
              {getErrorMessage(errors.confirmPassword)}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-sm text-white transition-all duration-200 mt-2
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
          ${
            !isValid || isSubmitting
              ? "opacity-50 bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-primary-dark hover:bg-dark cursor-pointer shadow-md"
          }
        `}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};

export default RegisterForm;
