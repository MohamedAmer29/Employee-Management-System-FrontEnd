import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { userApi } from "../../api/user.api";
import { toast } from "react-toastify";
import {
  setVerificationEmail,
  clearVerificationData,
} from "../../utils/cookies";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth, setUser, clearUser } from "../../store/slices/authSlice";

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
