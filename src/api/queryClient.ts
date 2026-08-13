import { QueryClient, QueryCache } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const ACCESS_TOKEN_KEY = ["accessToken"];
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(message, { toastId: `query-error:${message}` });
    },
  }),
});