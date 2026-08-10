import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userApi } from "../../api/user.api";
import { authApi } from "../../api/auth.api";
import { clearUser } from "../../store/slices/authSlice";

const useClearSession = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return () => {
    dispatch(clearUser());
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    navigate("/login", { replace: true });
  };
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
};

export const useLogoutAll = () => {
  const clearSession = useClearSession();

  return useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: (data) => {
      toast.success(data.data?.message || "Logged out from all devices");
      clearSession();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log out from all devices");
    },
  });
};

export const useDeactivateAccount = () => {
  const clearSession = useClearSession();

  return useMutation({
    mutationFn: userApi.deactivateAccount,
    onSuccess: () => {
      toast.success("Account deactivated");
      clearSession();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate account");
    },
  });
};
