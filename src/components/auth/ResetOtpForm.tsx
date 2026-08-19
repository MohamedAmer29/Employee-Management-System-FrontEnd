import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useVerifyResetOtp } from "../../features/auth/auth.hooks";
import { authApi } from "../../api/auth.api";
import { getResetPasswordEmail } from "../../utils/cookies";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";

const ResetOtpForm = () => {
  const navigate = useNavigate();
  const email = getResetPasswordEmail();
  const [countdown, setCountdown] = useState(300);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const isOtpValid = /^\d{6}$/.test(otp);
  const canResend = countdown <= 0;

  const { mutate: verifyResetOtp, isPending: isVerifying } = useVerifyResetOtp();

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown > 0]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = useCallback(() => {
    if (!email || !canResend) return;
    setIsResending(true);
    authApi
      .forgotPassword({ email })
      .then(() => {
        setCountdown(300);
        setIsResending(false);
      })
      .catch(() => {
        setIsResending(false);
      });
  }, [email, canResend]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Enter a valid 6-digit code");
      return;
    }
    setOtpError(null);
    if (email) {
      verifyResetOtp({ email, otp });
    }
  };

  if (!email) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
          Enter the 6-digit reset code sent to your email.
        </p>
        <p className="text-primary font-medium text-lg break-all">{email}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Reset Code <span className="text-red-500" aria-hidden="true">*</span>
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
                  w-11 h-12 sm:w-12 sm:h-14 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface
                  text-center text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:opacity-70 disabled:cursor-not-allowed
                "
              />
            )}
            containerStyle="justify-center"
            inputStyle={{ width: "100%" }}
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
            ? "bg-primary/50 text-white/80 cursor-not-allowed"
            : "bg-primary-dark hover:bg-dark cursor-pointer"}
        `}
        aria-busy={isVerifying}
      >
        {isVerifying ? "Verifying..." : "Verify Code"}
      </button>

      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resend code available in: <span className="font-mono font-medium text-primary">{formatTime(countdown)}</span>
          </span>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !canResend}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${!canResend || isResending
                ? "text-gray-400 cursor-not-allowed"
                : "text-primary hover:text-primary-dark underline cursor-pointer"}
            `}
          >
            {isResending ? "Sending..." : "Resend Reset Code"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ResetOtpForm;
