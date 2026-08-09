import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../features/auth/auth.hooks';
import type { LoginData } from '../../api/auth.api';

const inputClasses = (hasError: boolean) => `
  w-full pl-11 pr-4 py-3 rounded-xl border text-sm
  bg-gray-50 dark:bg-dark
  text-gray-900 dark:text-gray-100
  placeholder-gray-400 dark:placeholder-gray-500
  shadow-sm
  transition-all duration-200
  hover:border-gray-400 dark:hover:border-gray-500
  focus:outline-none focus:bg-white dark:focus:bg-dark focus:ring-2
  ${hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
    : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/25'}
`;

const iconClasses = (hasError: boolean) => `
  absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none
  ${hasError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
`;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginData>({
    mode: 'onChange',
  });

  const { mutate: loginUser } = useLogin();

  const onSubmit: SubmitHandler<LoginData> = (data) => {
    loginUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
          Email <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <Mail className={iconClasses(!!errors.username)} aria-hidden="true" />
          <input
            id="username"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('username', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
            className={inputClasses(!!errors.username)}
            aria-invalid={errors.username ? 'true' : 'false'}
            aria-describedby={errors.username ? 'username-error' : undefined}
            disabled={isSubmitting}
          />
        </div>
        {errors.username && (
          <p id="username-error" className="mt-1.5 text-sm text-red-500" role="alert">
            {errors.username.message as string}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
          Password <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <Lock className={iconClasses(!!errors.password)} aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            className={`${inputClasses(!!errors.password)} pr-11`}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" aria-hidden="true" /> : <Eye className="w-[18px] h-[18px]" aria-hidden="true" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="mt-1.5 text-sm text-red-500" role="alert">
            {errors.password.message as string}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="h-4 w-4 accent-primary rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Remember me</span>
        </label>
        <a
          href="#"
          className="text-sm text-primary hover:text-primary-dark underline"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className={`
          w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isSubmitting || !isValid
            ? 'bg-primary/50 text-white/80 cursor-not-allowed'
            : 'bg-primary-dark hover:bg-dark shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer'}
        `}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
