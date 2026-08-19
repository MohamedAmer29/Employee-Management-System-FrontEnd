import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { userApi } from "../../api/user.api";
import { toast } from "react-toastify";
import {
  setVerificationEmail,
  clearVerificationData,
  setResetPasswordEmail,
  removeResetPasswordEmail,
} from "../../utils/cookies";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuth, setUser, clearUser, setResetToken, clearResetToken } from "../../store/slices/authSlice";

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
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data;
      dispatch(setAuth({ accessToken, user }));
      toast.success("Email verified successfully! You are now signed in.");
      clearVerificationData();

      userApi
        .getCurrentUser(accessToken)
        .then((res) => {
          queryClient.setQueryData(["currentUser"], res.data);
          dispatch(setUser(res.data));
        })
        .catch(() => undefined);

      navigate("/home", { replace: true });
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
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const accessToken = data.data?.accessToken;
      if (!accessToken) {
        toast.error("Login response missing access token");
        return;
      }
      dispatch(setAuth({ accessToken }));
      toast.success("Login successful!");
      clearVerificationData();

      userApi
        .getCurrentUser(accessToken)
        .then((response) => {
          queryClient.setQueryData(["currentUser"], response.data);
          dispatch(setUser(response.data));
        })
        .catch(() => undefined);

      navigate("/home", { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    dispatch(clearUser());
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.success("Logged out successfully!");
      handleLogout();
    },
    onError: (error) => {
      toast.error(error.message || "Logout failed");
      handleLogout();
    },
  });
};

export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_data, variables) => {
      setResetPasswordEmail(variables.email);
      toast.success("Reset code sent to your email!");
      navigate("/reset-otp");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send reset code");
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const resetToken = useSelector(
    (state: { auth: { resetToken: string | null } }) => state.auth.resetToken,
  );

  return useMutation({
    mutationFn: (data: { password: string; confirmPassword: string }) =>
      authApi.resetPassword(data, resetToken ?? ""),
    onSuccess: () => {
      dispatch(clearResetToken());
      removeResetPasswordEmail();
      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
};

export const useVerifyResetOtp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authApi.verifyResetOtp,
    onSuccess: (response) => {
      const { resetToken } = response.data;
      dispatch(setResetToken(resetToken));
      toast.success("Code verified! Set your new password.");
      navigate("/reset-password");
    },
    onError: (error) => {
      toast.error(error.message || "Invalid or expired code");
    },
  });
};
