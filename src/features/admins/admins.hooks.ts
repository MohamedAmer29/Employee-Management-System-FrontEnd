import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { userApi } from "../../api/user.api";
import type { AdminsParams, UpdateAdminRequest, CreateAdminRequest } from "../../api/user.api";

const invalidateAdmins = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({
    queryKey: ["admins"],
    refetchType: "all",
  });
};

export const useAdmins = (params?: AdminsParams) => {
  return useQuery({
    queryKey: ["admins", params],
    queryFn: () =>
      userApi.getAdminAdmins(params).then((response) => response.data),
  });
};

export const useAdmin = (id: string | undefined) => {
  return useQuery({
    queryKey: ["admins", id],
    queryFn: () =>
      userApi.getAdminAdminById(id as string).then((response) => response.data),
    enabled: Boolean(id),
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminRequest) =>
      userApi.createAdminAdmin(data).then((response) => response.data),
    onSuccess: () => {
      invalidateAdmins(queryClient);
      toast.success("Admin created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create admin");
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateAdminRequest }) =>
      userApi.updateAdminAdmin(id, data).then((response) => response.data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["admins", String(variables.id)], response);
      invalidateAdmins(queryClient);
      toast.success("Admin updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update admin");
    },
  });
};

export const useActivateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      userApi.activateAdmin(id).then((response) => response.data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["admins", String(variables)], response);
      invalidateAdmins(queryClient);
      toast.success("Admin activated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to activate admin");
    },
  });
};

export const useDeactivateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      userApi.deactivateAdmin(id).then((response) => response.data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["admins", String(variables)], response);
      invalidateAdmins(queryClient);
      toast.success("Admin deactivated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate admin");
    },
  });
};