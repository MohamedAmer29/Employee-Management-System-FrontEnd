import { useForm, type SubmitHandler } from 'react-hook-form';
import { useLogin } from '../../features/auth/auth.hooks';
import type { LoginData } from '../../api/auth.api';

const LoginForm = () => {
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
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500" aria-hidden="true">*</span>
        </label>
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
          className={`
            w-full px-4 py-2.5 rounded-lg border bg-white
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200
            ${errors.username ? 'border-red-500' : 'border-gray-300'}
          `}
          aria-invalid={errors.username ? 'true' : 'false'}
          aria-describedby={errors.username ? 'username-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.username && (
          <p id="username-error" className="mt-1 text-sm text-red-500" role="alert">
            {errors.username.message as string}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
          className={`
            w-full px-4 py-2.5 rounded-lg border bg-white
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200
            ${errors.password ? 'border-red-500' : 'border-gray-300'}
          `}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-500" role="alert">
            {errors.password.message as string}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
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
          w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isSubmitting || !isValid
            ? 'bg-primary/50 text-white/80 cursor-not-allowed'
            : 'bg-primary-dark hover:bg-dark'}
        `}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
