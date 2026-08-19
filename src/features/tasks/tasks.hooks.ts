import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { userApi } from "../../api/user.api";
import type {
  TaskParams,
  Task,
  TasksResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from "../../api/user.api";

export const useTasks = (params?: TaskParams) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => userApi.getTasks(params).then((response) => response.data),
    refetchOnMount: "always",
  });
};

export const useMyTasks = () => {
  return useQuery({
    queryKey: ["tasks", "my"],
    queryFn: () => userApi.getMyTasks().then((response) => response.data),
    refetchOnMount: "always",
  });
};

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () =>
      userApi.getTaskById(taskId).then((response) => response.data),
    enabled: !!taskId,
    refetchOnMount: "always",
  });
};

const invalidateTaskQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({
    queryKey: ["dashboard"],
    refetchType: "all",
  });
};

const updateTaskInListCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: string,
  updater: (task: Task) => Task,
) => {
  queryClient.setQueriesData<TasksResponse>(
    { queryKey: ["tasks"], exact: false },
    (old) => {
      if (!old || !Array.isArray(old.data)) return old;
      return {
        ...old,
        data: old.data.map((t) => (t.id === taskId ? updater(t) : t)),
      };
    },
  );
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => userApi.createTask(data),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      toast.success("Task created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: UpdateTaskRequest;
    }) => userApi.updateTask(taskId, data),
    onSuccess: (response, variables) => {
      const updatedTask = response.data;
      const { taskId } = variables;

      queryClient.setQueryData<Task>(["tasks", taskId], updatedTask);

      updateTaskInListCache(queryClient, taskId, () => updatedTask);

      invalidateTaskQueries(queryClient);

      toast.success("Task updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task");
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => userApi.deleteTask(taskId),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      toast.success("Task deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
    }) => userApi.updateTaskStatus(taskId, status),
    onSuccess: (response, variables) => {
      const updatedTask = response.data;
      const { taskId } = variables;

      queryClient.setQueryData<Task>(["tasks", taskId], updatedTask);

      queryClient.setQueriesData<TasksResponse>(
        { queryKey: ["tasks"], exact: false },
        (old) => {
          if (!old || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((t) => (t.id === taskId ? updatedTask : t)),
          };
        },
      );

      invalidateTaskQueries(queryClient);

      toast.success("Task status updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task status");
    },
  });
};
