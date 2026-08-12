import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import { toast } from "react-toastify";

export const useLeaveRequests = () => {
  return useQuery({
    queryKey: ["leave"],
    queryFn: () => userApi.getLeaveRequests().then((response) => response.data),
  });
};

export const useLeaveByEmployee = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["leave", "employee", employeeId],
    queryFn: () =>
      userApi
        .getLeaveByEmployeeId(employeeId as string)
        .then((response) => response.data),
    enabled: Boolean(employeeId),
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveId: string) => userApi.approveLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave"] });
      toast.success("Leave request approved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve leave request");
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveId: string) => userApi.rejectLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave"] });
      toast.success("Leave request rejected successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject leave request");
    },
  });
};