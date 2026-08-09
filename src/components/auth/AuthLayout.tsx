import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthImage from './AuthImage';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ThemeToggle from '../common/ThemeToggle';

interface AuthLayoutProps {
  initialMode?: 'login' | 'register';
  imageAlt?: string;
}

const SLIDE_DURATION = 700;

const AuthLayout = ({
  initialMode = 'register',
  imageAlt = 'EMS Authentication',
}: AuthLayoutProps) => {
  const navigate = useNavigate();
  const [displayMode, setDisplayMode] = useState<'login' | 'register'>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoginMode = displayMode === 'login';

  const goTo = (mode: 'login' | 'register') => {
    if (isTransitioning || mode === displayMode) return;
    setIsTransitioning(true);
    setDisplayMode(mode);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      navigate(mode === 'login' ? '/login' : '/register');
    }, SLIDE_DURATION);
  };

  const goToLogin = () => {
    goTo('login');
  };

  const goToRegister = () => {
    goTo('register');
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4 md:p-6 bg-light dark:bg-dark-bg">
      <div
        className="relative w-full max-w-5xl h-full max-h-[95vh] sm:max-h-[90vh] min-h-[580px] sm:min-h-[640px] bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        role="main"
      >
        {/* Theme Toggle */}
        <ThemeToggle className="absolute top-3 right-3" />

        {/* Sliding Image Panel Overlay (Hidden on mobile stack, 50% width on desktop) */}
        <div
          className={`
            hidden md:block absolute top-0 bottom-0 left-0 w-1/2 z-20 h-full
            transition-transform duration-700 ease-in-out
            ${isLoginMode ? 'translate-x-0' : 'translate-x-full'}
          `}
          style={{ transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' }}
        >
          <AuthImage
            className="w-full h-full object-cover rounded-none"
            alt={imageAlt}
          />
        </div>

        {/* Mobile Header Image Banner (Visible only on mobile/small screens) */}
        <div className="md:hidden w-full h-32 bg-gradient-to-r from-dark via-primary-dark to-primary flex items-center justify-center p-4">
          <div className="text-center text-white">
            <h2 className="text-xl font-extrabold tracking-wider">EMS</h2>
            <p className="text-xs text-white/80">Employee Management System</p>
          </div>
        </div>

        {/* Form Containers */}
        <div className="relative flex-1 w-full h-full flex overflow-hidden">
          {/* Register Form Section */}
          <div
            className={`
              w-full md:w-1/2 h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-y-auto z-10
              transition-all duration-500 ease-in-out
              ${isLoginMode ? 'hidden md:flex md:opacity-0 md:pointer-events-none' : 'flex opacity-100'}
            `}
          >
            <div className="max-w-md mx-auto w-full my-auto">
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark dark:text-white mb-1">Create Account</h1>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  Join EMS to manage your workforce efficiently
                </p>
              </div>

              <RegisterForm />
            </div>

            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={goToLogin}
                  disabled={isTransitioning}
                  className="text-primary font-semibold hover:text-primary-dark transition-colors cursor-pointer focus:outline-none focus:underline disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Login
                </button>
              </p>
            </div>
          </div>

          {/* Login Form Section */}
          <div
            className={`
              w-full md:w-1/2 h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-y-auto z-10
              transition-all duration-500 ease-in-out
              ${!isLoginMode ? 'hidden md:flex md:opacity-0 md:pointer-events-none' : 'flex opacity-100'}
            `}
          >
            <div className="max-w-md mx-auto w-full my-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white mb-2">Welcome Back</h1>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  Sign in to access your EMS dashboard
                </p>
              </div>

              <LoginForm />
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={goToRegister}
                  disabled={isTransitioning}
                  className="text-primary font-semibold hover:text-primary-dark transition-colors cursor-pointer focus:outline-none focus:underline disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;