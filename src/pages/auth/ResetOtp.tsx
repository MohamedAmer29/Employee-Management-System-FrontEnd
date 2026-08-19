import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import ResetOtpForm from "@/components/auth/ResetOtpForm";
import SeoHead from "@/components/common/SeoHead";

const ResetOtp = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#E3F2FD] dark:bg-[#0A1C33]">
      <SeoHead title="Verify Reset Code" path="/reset-otp" />
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8"
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default ResetOtp;
