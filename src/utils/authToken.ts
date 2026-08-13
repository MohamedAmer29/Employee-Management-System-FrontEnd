import {
  queryClient,
  ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_TTL_MS,
} from "../api/queryClient";

// Back the token with TanStack Query instead of localStorage so it's not
// durably persisted, with a 15-minute TTL enforced via cache defaults.
queryClient.setQueryDefaults(ACCESS_TOKEN_KEY, {
  staleTime: ACCESS_TOKEN_TTL_MS,
  gcTime: ACCESS_TOKEN_TTL_MS,
});

export const setAuthToken = (token: string | null) => {
  if (!token) {
    queryClient.removeQueries({ queryKey: ACCESS_TOKEN_KEY });
    return;
  }
  queryClient.setQueryData(ACCESS_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null =>
  (queryClient.getQueryData(ACCESS_TOKEN_KEY) as string | null) ?? null;

export const clearAuthToken = () => setAuthToken(null);
