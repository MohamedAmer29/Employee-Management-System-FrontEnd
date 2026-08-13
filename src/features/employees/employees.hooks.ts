import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { userApi } from "../../api/user.api";
import { toast } from "react-toastify";
import { setUser } from "../../store/slices/authSlice";
import type { RootState } from "../../store/store";

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

export const useDepartment = (id: string | undefined) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: async () => {
      const response = await userApi.getDepartments();
      const department = response.data.find((dept) => String(dept.id) === id);
      if (!department) throw new Error("Department not found");
      return department;
    },
    enabled: Boolean(id),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => userApi.createDepartment(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create department");
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department"] });
      toast.success("Department deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete department");
    },
  });
};

export const useAssignEmployeesToDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employeeIds }: { id: string; employeeIds: string[] }) =>
      userApi.assignEmployeesToDepartment(id, employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department"] });
      toast.success("Employees assigned to department successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign employees to department");
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      userApi.updateDepartment(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department"] });
      toast.success("Department updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update department");
    },
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
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      userApi.uploadEmployeeProfilePicture(id, file),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["employees", variables.id], response.data);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      const uploadedUserId = response.data?.user?.id;
      if (
        currentUser &&
        uploadedUserId != null &&
        String(currentUser.id) === String(uploadedUserId)
      ) {
        dispatch(
          setUser({
            ...currentUser,
            profilePicture: response.data.profilePicture,
          }),
        );
      }
      toast.success("Profile picture updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile picture");
    },
  });
};
