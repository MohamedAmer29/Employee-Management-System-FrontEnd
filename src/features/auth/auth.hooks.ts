import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { toast } from "react-toastify";
import {
  setVerificationEmail,
  clearVerificationData,
} from "../../utils/cookies";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast.success("Registration successful! Please verify your email.");
      if (data.data?.username || data.data?.email) {
        const email = data.data.username || data.data.email;
        setVerificationEmail(email);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });
};

export const useVerifyEmail = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      toast.success("Email verified successfully!");
      clearVerificationData();
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Verification failed");
    },
  });
};

export const useResendVerificationOtp = () => {
  return useMutation({
    mutationFn: authApi.resendVerificationOtp,
    onSuccess: () => {
      toast.success("Verification code resent!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resend code");
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      toast.success("Login successful!");
      clearVerificationData();
      navigate("/home");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.success("Logged out successfully!");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Logout failed");
      navigate("/login");
    },
  });
};
