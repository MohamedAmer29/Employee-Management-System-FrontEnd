import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  userApi,
  type CreateUserRequest,
  type ChangePasswordRequest,
  type UpdateUserByIdRequest,
} from "../../api/user.api";

export const useUsers = (enabled = true) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getUsers().then((response) => response.data),
    enabled,
  });
};

export const useUser = (id: string | undefined) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () =>
      userApi.getUserById(id as string).then((response) => response.data),
    enabled: Boolean(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) =>
      userApi.createUser(data).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
        refetchType: "all",
      });
    },
  });
};

export const useUpdateUserById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserByIdRequest;
    }) => userApi.updateUserById(id, data).then((response) => response.data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      if (variables.id) {
        queryClient.setQueryData(
          ["users", String(variables.id)],
          response.data,
        );
      }
    },
  });
};

export const useDeleteUser = () =>
  useMutation({
    mutationFn: (id: string | number) =>
      userApi.deleteUser(id).then((response) => response.data),
  });

export const useResetUserPassword = () =>
  useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ChangePasswordRequest;
    }) => userApi.resetUserPassword(id, data).then((response) => response.data),
  });

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      userApi.activateUser(id).then((response) => response.data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      if (variables.id) {
        queryClient.setQueryData(["users", String(variables.id)], response);
      }
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      userApi.deactivateUser(id).then((response) => response.data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      if (variables.id) {
        queryClient.setQueryData(["users", String(variables.id)], response);
      }
    },
  });
};

export const useAdminLogoutUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      userApi.adminLogoutUser(id).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};