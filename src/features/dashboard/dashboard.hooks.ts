import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { userApi } from "../../api/user.api";
import type { RootState } from "../../store/store";

export const useAdminDashboard = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: () =>
      userApi.getAdminDashboard().then((response) => response.data),
    enabled: !!accessToken,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};
