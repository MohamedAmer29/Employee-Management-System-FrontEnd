import { ShieldCheck } from "lucide-react";
import ResetOtpForm from "@/components/auth/ResetOtpForm";

const ResetOtp = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#E3F2FD] dark:bg-[#0A1C33]">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 text-primary mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify Reset Code
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Check your email for the verification code
            </p>
          </div>

          <ResetOtpForm />
        </div>
      </div>
    </div>
  );
};

export default ResetOtp;
