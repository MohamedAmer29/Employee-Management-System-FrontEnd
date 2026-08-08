import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authApi } from "../../api/auth.api";
import { setAuth, clearUser } from "../../store/slices/authSlice";
import type { RootState } from "../../store/store";
import { getTimeUntilExpiryMs } from "../../utils/jwt";
import SessionExpiryToast from "./SessionExpiryToast";
import {
  SESSION_WARNING_THRESHOLD_MS,
  SESSION_CHECK_INTERVAL_MS,
} from "./session.constants";

export const useSessionMonitor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const warningToastId = useRef<string | number | null>(null);
  const expiredRef = useRef(false);

  const refreshMutation = useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      const newToken = data.data?.accessToken;
      if (!newToken) {
        toast.error("Unable to extend your session. Please log in again.");
        return;
      }
      dispatch(setAuth({ accessToken: newToken }));
      toast.success("Session extended");
    },
    onError: () => {
      toast.error("Unable to extend your session. Please log in again.");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.error("Your session has expired. Please log in again.");
    },
    onError: () => {
      toast.error("Your session has expired. Please log in again.");
    },
    onSettled: () => {
      dispatch(clearUser());
      navigate("/login", { replace: true });
    },
  });

  const dismissWarning = useCallback(() => {
    if (warningToastId.current !== null) {
      toast.dismiss(warningToastId.current);
      warningToastId.current = null;
    }
  }, []);

  const extendSession = useCallback(() => {
    if (refreshMutation.isPending) return;
    dismissWarning();
    refreshMutation.mutate();
  }, [dismissWarning, refreshMutation]);

  const expireSession = useCallback(() => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    dismissWarning();
    logoutMutation.mutate();
  }, [dismissWarning, logoutMutation]);

  const checkSession = useCallback(() => {
    if (!accessToken) return;

    const remainingMs = getTimeUntilExpiryMs(accessToken);
    if (remainingMs === null) return;

    if (remainingMs <= 0) {
      expireSession();
      return;
    }

    if (remainingMs < SESSION_WARNING_THRESHOLD_MS) {
      if (warningToastId.current === null) {
        warningToastId.current = toast.info(
          <SessionExpiryToast onExtend={extendSession} />,
          {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            position: "top-right",
            onClose: () => {
              warningToastId.current = null;
            },
          },
        );
      }
    }
  }, [accessToken, expireSession, extendSession]);

  // Reset warning/expired guards whenever a new token arrives (login or extend).
  useEffect(() => {
    expiredRef.current = false;
    dismissWarning();
  }, [accessToken, dismissWarning]);

  useEffect(() => {
    checkSession();

    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") checkSession();
    };
    const onFocus = () => checkSession();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [checkSession]);
};
