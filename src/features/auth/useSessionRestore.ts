import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { authApi } from "../../api/auth.api";
import { setAuth, clearUser, setLoading } from "../../store/slices/authSlice";
import { getAuthToken } from "../../utils/authToken";
import { hasRefreshCookie } from "../../utils/cookies";
import { getTimeUntilExpiryMs } from "../../utils/jwt";
import { SESSION_WARNING_THRESHOLD_MS } from "./session.constants";

export const useSessionRestore = () => {
  const dispatch = useDispatch();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const restore = async () => {
      dispatch(setLoading(true));

      const storedToken = getAuthToken();

      // The stored access token still has more than 5 minutes left - restore
      // it without calling /auth/refresh-token.
      if (storedToken) {
        const remainingMs = getTimeUntilExpiryMs(storedToken);
        if (
          remainingMs !== null &&
          remainingMs > SESSION_WARNING_THRESHOLD_MS
        ) {
          dispatch(setAuth({ accessToken: storedToken }));
          dispatch(setLoading(false));
          return;
        }
      }

      // No usable access token. Only call /auth/refresh-token when the backend
      // actually holds a refresh_token cookie (marked by refresh_token_present);
      // otherwise there is no session and we go straight to the login page
      // without firing a pointless request.
      if (!hasRefreshCookie()) {
        dispatch(clearUser());
        dispatch(setLoading(false));
        return;
      }

      try {
        const response = await authApi.refreshToken();
        const accessToken = response.data?.accessToken;
        if (accessToken) {
          dispatch(setAuth({ accessToken }));
        } else {
          dispatch(clearUser());
        }
      } catch {
        // The refresh cookie is expired or revoked. Ask the backend to clear
        // the cookies so the next login is not rejected with "already
        // authenticated" and the 401 stops repeating on every reload.
        authApi.logout().catch(() => undefined);
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
      }
    };

    void restore();
  }, [dispatch]);
};
