import AuthImage from '../../components/auth/AuthImage';
import OtpForm from '../../components/auth/OtpForm';
import ThemeToggle from '../../components/common/ThemeToggle';

const VerifyEmail = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-light dark:bg-dark-bg">
      <div className="relative w-full max-w-5xl h-[720px] bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <ThemeToggle className="absolute top-3 right-3" />
        <div className="w-full md:w-1/2 h-full hidden md:block">
          <AuthImage className="w-full h-full object-cover" alt="EMS Email Verification" />
        </div>
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-light dark:bg-dark-bg rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">Verify Your Email</h1>
              <p className="text-gray-600 dark:text-gray-300">
                We've sent a 6-digit code to your email address
              </p>
            </div>

            <OtpForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;