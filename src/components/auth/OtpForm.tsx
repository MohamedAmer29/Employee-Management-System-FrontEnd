import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useVerifyEmail, useResendVerificationOtp } from '../../features/auth/auth.hooks';
import {
  getVerificationEmail,
  getResendAttempts,
  getResendCountdown,
  incrementResendAttempts,
  setResendAttempts,
  setResendCountdown,
} from '../../utils/cookies';
import { useNavigate } from 'react-router-dom';
import OtpInput from 'react-otp-input';

const OtpForm = () => {
  const navigate = useNavigate();
  const email = getVerificationEmail();
  const [countdown, setCountdown] = useState(() => getResendCountdown());
  const [attempts, setAttempts] = useState(() => getResendAttempts());
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const isOtpValid = /^\d{6}$/.test(otp);

  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();
  const { mutate: resendOtp, isPending: isResendingApi } = useResendVerificationOtp();

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          setResendCountdown(0);
          return 0;
        }
        const nextValue = prev - 1;
        setResendCountdown(nextValue);
        return nextValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (attempts >= 3) {
      setCanResend(false);
    }
  }, [attempts]);

  useEffect(() => {
    setResendAttempts(attempts);
  }, [attempts]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = useCallback(() => {
    if (!email || attempts >= 3 || !canResend) return;

    setIsResending(true);
    resendOtp({ email }, {
      onSuccess: () => {
        incrementResendAttempts();
        setAttempts((prev) => prev + 1);
        setCountdown(900);
        setResendCountdown(900);
        setCanResend(false);
        setIsResending(false);
      },
      onError: () => {
        setIsResending(false);
      },
    });
  }, [email, attempts, canResend, resendOtp]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setOtpError('Enter a valid 6-digit code');
      return;
    }

    setOtpError(null);

    if (email) {
      verifyEmail({ email, otp });
    }
  };

  if (!email) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="text-center mb-6">
        <p className="text-gray-600 text-sm mb-2">
          Enter the 6-digit verification code sent to your email.
        </p>
        <p className="text-primary font-medium text-lg break-all">{email}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Verification Code <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="flex justify-center">
          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (otpError) setOtpError(null);
            }}
            numInputs={6}
            inputType="text"
            shouldAutoFocus
            renderSeparator={<span className="w-2 sm:w-3" />}
            renderInput={(props) => (
              <input
                {...props}
                disabled={isVerifying}
                className="
                  w-11 h-12 sm:w-12 sm:h-14 rounded-lg border border-gray-300 bg-white
                  text-center text-lg sm:text-2xl font-semibold
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:opacity-70 disabled:cursor-not-allowed
                "
              />
            )}
            containerStyle="justify-center"
            inputStyle={{ width: '100%' }}
            skipDefaultStyles
          />
        </div>
        {otpError && (
          <p id="otp-error" className="mt-1 text-sm text-red-500 text-center" role="alert">
            {otpError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isVerifying || !email || !isOtpValid}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isVerifying || !email || !isOtpValid
            ? 'bg-primary/50 text-white/80 cursor-not-allowed'
            : 'bg-primary-dark hover:bg-dark'}
        `}
        aria-busy={isVerifying}
      >
        {isVerifying ? 'Verifying...' : 'Verify Email'}
      </button>

      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resend code available in: <span className="font-mono font-medium text-primary">{formatTime(countdown)}</span>
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Resend attempts: <span className="font-medium">{attempts} / 3</span>
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isResendingApi || !canResend || attempts >= 3}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${(!canResend || attempts >= 3 || isResending || isResendingApi)
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-primary hover:text-primary-dark underline'}
            `}
            aria-busy={isResending || isResendingApi}
            aria-disabled={!canResend || attempts >= 3}
          >
            {isResending || isResendingApi ? 'Sending...' : 'Resend Verification Code'}
          </button>
          {attempts >= 3 && (
            <p className="mt-2 text-sm text-gray-500">
              Maximum resend attempts reached. Please contact support.
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default OtpForm;
