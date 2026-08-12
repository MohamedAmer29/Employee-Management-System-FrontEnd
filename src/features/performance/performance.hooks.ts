import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import type {
  UpdatePerformanceRequest,
  CreatePerformanceRequest,
} from "../../api/user.api";
import { toast } from "react-toastify";

export const usePerformanceReviews = () => {
  return useQuery({
    queryKey: ["performance"],
    queryFn: () =>
      userApi.getPerformanceReviews().then((response) => response.data),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePerformanceRequest) =>
      userApi.createPerformanceReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
        refetchType: "all",
      });
      toast.success("Performance review created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create performance review");
    },
  });
};

export const useUpdatePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      performanceId,
      data,
    }: {
      performanceId: string;
      data: UpdatePerformanceRequest;
    }) => userApi.updatePerformanceReview(performanceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
        refetchType: "all",
      });
      toast.success("Performance review updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update performance review");
    },
  });
};

export const useDeletePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (performanceId: string) =>
      userApi.deletePerformanceReview(performanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
        refetchType: "all",
      });
      toast.success("Performance review deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete performance review");
    },
  });
};