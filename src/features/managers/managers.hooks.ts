import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { userApi } from "../../api/user.api";
import type { ManagersParams, UpdateManagerRequest, CreateManagerRequest } from "../../api/user.api";

export const useManagers = (params?: ManagersParams) => {
  return useQuery({
    queryKey: ["managers", params],
    queryFn: () =>
      userApi.getAdminManagers(params).then((response) => response.data),
  });
};

export const useManager = (id: string | undefined) => {
  return useQuery({
    queryKey: ["managers", id],
    queryFn: () =>
      userApi.getAdminManagerById(id as string).then((response) => response.data),
    enabled: Boolean(id),
  });
};

export const useUpdateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateManagerRequest;
    }) => userApi.updateAdminManager(id, data).then((response) => response.data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["managers", String(variables.id)], response);
      queryClient.invalidateQueries({
        queryKey: ["managers"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Manager updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update manager");
    },
  });
};

export const useDeleteManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      userApi.deleteAdminManager(id).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["managers"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Manager deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete manager");
    },
  });
};

export const useAssignManagerToDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      departmentId,
    }: {
      id: string | number;
      departmentId: string;
    }) => userApi.assignManagerToDepartment(id, departmentId),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["managers", String(variables.id)], response.data);
      queryClient.invalidateQueries({
        queryKey: ["managers"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Manager assigned to department successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign manager to department");
    },
  });
};

export const useCreateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManagerRequest) =>
      userApi.createAdminManager(data).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["managers"],
        refetchType: "all",
      });
      toast.success("Manager created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create manager");
    },
  });
};
