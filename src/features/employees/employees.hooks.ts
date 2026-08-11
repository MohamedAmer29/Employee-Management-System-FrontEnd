import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import { toast } from "react-toastify";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () =>
      userApi.getEmployees().then((response) => response.data),
  });
};

export const useEmployee = (id: string | undefined) => {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () =>
      userApi.getEmployeeById(id as string).then((response) => response.data),
    enabled: Boolean(id),
  });
};

export const useDepartments = (enabled = true) => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () =>
      userApi.getDepartments().then((response) => response.data),
    enabled,
  });
};

export const useUsers = (enabled = true) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getUsers().then((response) => response.data),
    enabled,
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });
};

export const useAssignDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, departmentId }: { id: string; departmentId: string }) =>
      userApi.assignDepartment(id, departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department assigned successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign department");
    },
  });
};

export const useAssignUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      userApi.assignUser(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User account assigned successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign user account");
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof userApi.createEmployee>[0]) =>
      userApi.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof userApi.updateEmployee>[1] }) =>
      userApi.updateEmployee(id, data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["employees", variables.id], response.data);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update employee");
    },
  });
};

export const useUploadEmployeeProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      userApi.uploadEmployeeProfilePicture(id, file),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["employees", variables.id], response.data);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Profile picture updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile picture");
    },
  });
};
