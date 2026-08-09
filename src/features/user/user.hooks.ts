import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { userApi } from "../../api/user.api";
import { setUser } from "../../store/slices/authSlice";
import type { RootState } from "../../store/store";
import { toast } from "react-toastify";

export const useCurrentUser = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: () =>
      userApi
        .getCurrentUser(accessToken ?? "")
        .then((response) => response.data),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setUser(query.data));
    }
  }, [query.data, dispatch]);

  return query;
};

export const useUpdateUser = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: (data) => {
      dispatch(setUser(data.data));
      queryClient.setQueryData(["currentUser"], data.data);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};
