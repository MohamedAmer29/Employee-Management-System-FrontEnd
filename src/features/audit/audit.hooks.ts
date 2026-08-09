import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import type { AuditLogsParams } from "../../api/user.api";

export const useAuditLogs = (params?: AuditLogsParams) => {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () =>
      userApi.getAuditLogs(params).then((response) => response.data),
  });
};

export const useAuditLog = (id: string | undefined) => {
  return useQuery({
    queryKey: ["auditLog", id],
    queryFn: () =>
      userApi.getAuditLogById(id as string).then((response) => response.data),
    enabled: Boolean(id),
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getUsers().then((response) => response.data),
  });
};
