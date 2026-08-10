import { useState } from "react";
import { useForm, type SubmitHandler, type FieldError } from "react-hook-form";
import {
  UserRound,
  MapPin,
  Building,
  Phone,
  Save,
  Loader2,
  RefreshCw,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  LogOut,
  UserCog,
  CheckCheck,
  X,
} from "lucide-react";
import { useCurrentUser, useUpdateUser } from "@/features/user/user.hooks";
import {
  useChangePassword,
  useLogoutAll,
  useDeactivateAccount,
} from "@/features/settings/settings.hooks";
import type { UpdateUserRequest } from "@/api/user.api";

interface ChangePasswordForm {
  password: string;
  confirmPassword: string;
}

const profileFields = [
  {
    name: "firstName",
    label: "First Name",
    icon: UserRound,
    placeholder: "Mohamed",
    autoComplete: "given-name",
    type: "text",
  },
  {
    name: "lastName",
    label: "Last Name",
    icon: UserRound,
    placeholder: "Amer",
    autoComplete: "family-name",
    type: "text",
  },
  {
    name: "country",
    label: "Country",
    icon: MapPin,
    placeholder: "Egypt",
    autoComplete: "country",
    type: "text",
  },
  {
    name: "city",
    label: "City",
    icon: Building,
    placeholder: "Cairo",
    autoComplete: "address-level2",
    type: "text",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    icon: Phone,
    placeholder: "01234567890",
    autoComplete: "tel",
    type: "tel",
  },
] as const;

const getErrorMessage = (error: FieldError | undefined): string =>
  error?.message ?? "Invalid input";

const inputClasses = (hasError: boolean) => `
  w-full pl-11 pr-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
  transition-all duration-200
  ${hasError ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
`;

const Settings = () => {
  const { data: user, isLoading, isError, refetch } = useCurrentUser();
  const updateUser = useUpdateUser();
  const changePassword = useChangePassword();
  const logoutAll = useLogoutAll();
  const deactivateAccount = useDeactivateAccount();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateUserRequest>({
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      country: user?.country ?? "",
      city: user?.city ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
  });

  const passwordForm = useForm<ChangePasswordForm>({
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = passwordForm.watch("password");

  const onSubmit: SubmitHandler<UpdateUserRequest> = async (data) => {
    try {
      await updateUser.mutateAsync(data);
      reset(data);
    } catch {
      // Error is handled by the mutation toast
    }
  };

  const validateConfirmPassword = (
    value: string | undefined,
  ): boolean | string => {
    if (value !== password) {
      return "Passwords do not match";
    }
    return true;
  };

  const onSubmitPassword: SubmitHandler<ChangePasswordForm> = (data) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        passwordForm.reset();
        setShowPasswordForm(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Loading settings"
      >
        <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          We couldn't load your settings.
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

  const isAdmin = (user.role ?? "Employee") === "Admin";

  const sectionClass =
    "rounded-3xl bg-gradient-to-br from-white via-white to-gray-50 dark:from-dark-surface dark:via-dark-surface dark:to-white/5 border border-gray-200 dark:border-gray-800 p-8 shadow-lg transition-shadow duration-300";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl opacity-50" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Manage your profile, password, and account security
          </p>
        </div>
      </div>

      {/* Profile information */}
      <section className={sectionClass} aria-label="Profile information">
        <div className="flex items-center gap-4 mb-8">
          <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-lg shadow-primary/10">
            <UserCog className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Profile Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your personal details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {profileFields.map((field) => {
              const FieldIcon = field.icon;
              const error = errors[field.name] as FieldError | undefined;
              return (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    {field.label}{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <FieldIcon
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                        error ? "text-red-500" : "text-gray-400 dark:text-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                    <input
                      id={field.name}
                      type={field.type ?? "text"}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      {...register(field.name as keyof UpdateUserRequest, {
                        required: `${field.label} is required`,
                        ...(field.name === "phoneNumber"
                          ? {
                              pattern: {
                                value: /^(\+20|0)?1[0125]\d{8}$/,
                                message: "Invalid phone number",
                              },
                            }
                          : {}),
                      })}
                      className={inputClasses(!!error)}
                      aria-invalid={error ? "true" : "false"}
                      disabled={isSubmitting}
                    />
                  </div>
                  {error && (
                    <p className="mt-0.5 text-xs text-red-500" role="alert">
                      {getErrorMessage(error)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Change password */}
      <section className={sectionClass} aria-label="Change password">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-lg shadow-primary/10">
              <KeyRound className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your password to keep your account secure
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {showPasswordForm ? (
              <>
                <X className="w-4 h-4" aria-hidden="true" />
                Cancel
              </>
            ) : (
              <>
                <CheckCheck className="w-4 h-4" aria-hidden="true" />
                Change Password
              </>
            )}
          </button>
        </div>

        {showPasswordForm && (
          <form
            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
            className="space-y-6"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  New Password{" "}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                      passwordForm.formState.errors.password
                        ? "text-red-500"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...passwordForm.register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Minimum 6 characters",
                      },
                    })}
                    className={inputClasses(
                      !!passwordForm.formState.errors.password,
                    )}
                    aria-invalid={
                      passwordForm.formState.errors.password ? "true" : "false"
                    }
                    disabled={passwordForm.formState.isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="mt-0.5 text-xs text-red-500" role="alert">
                    {getErrorMessage(passwordForm.formState.errors.password)}
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
                  <Lock
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                      passwordForm.formState.errors.confirmPassword
                        ? "text-red-500"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...passwordForm.register("confirmPassword", {
                      required: "Confirm your password",
                      validate: validateConfirmPassword,
                    })}
                    className={inputClasses(
                      !!passwordForm.formState.errors.confirmPassword,
                    )}
                    aria-invalid={
                      passwordForm.formState.errors.confirmPassword
                        ? "true"
                        : "false"
                    }
                    disabled={passwordForm.formState.isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-0.5 text-xs text-red-500" role="alert">
                    {getErrorMessage(
                      passwordForm.formState.errors.confirmPassword,
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  !passwordForm.formState.isValid ||
                  passwordForm.formState.isSubmitting
                }
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {passwordForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" aria-hidden="true" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Admin: account security */}
      {isAdmin && (
        <section
          className="rounded-3xl bg-gradient-to-br from-red-50/60 via-white to-gray-50 dark:from-red-950/20 dark:via-dark-surface dark:to-white/5 border border-red-200/60 dark:border-red-900/40 p-8 shadow-lg transition-shadow duration-300"
          aria-label="Account security"
        >
          <div className="flex items-center gap-4 mb-2">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10">
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Account Security
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin-only actions that affect your account across devices
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => logoutAll.mutate()}
              disabled={logoutAll.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {logoutAll.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="w-4 h-4" aria-hidden="true" />
              )}
              {logoutAll.isPending
                ? "Logging out..."
                : "Log out from all devices"}
            </button>

            <button
              type="button"
              onClick={() => deactivateAccount.mutate()}
              disabled={deactivateAccount.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {deactivateAccount.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              )}
              {deactivateAccount.isPending
                ? "Deactivating..."
                : "Deactivate account"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Settings;
