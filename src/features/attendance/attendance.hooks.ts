import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { userApi } from "../../api/user.api";
import type {
  AttendancePeriod,
  MonthlyAttendanceParams,
  AbsentAttendanceParams,
} from "../../api/user.api";

export const useAttendanceTrend = (period: AttendancePeriod) => {
  return useQuery({
    queryKey: ["attendance-trend", period],
    queryFn: () =>
      userApi.getAdminAttendanceTrend(period).then((response) => response.data),
  });
};

export const useAttendance = () => {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: () => userApi.getAttendance().then((response) => response.data),
  });
};

export const useMyAttendance = () => {
  return useQuery({
    queryKey: ["my-attendance"],
    queryFn: () =>
      userApi.getMyAttendance().then((response) => response.data),
  });
};

export const useMyAttendanceSummary = () => {
  return useQuery({
    queryKey: ["my-attendance-summary"],
    queryFn: () =>
      userApi.getMyAttendanceSummary().then((response) => response.data),
  });
};

const invalidateMyAttendance = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
  queryClient.invalidateQueries({ queryKey: ["my-attendance-summary"] });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.checkIn(),
    onSuccess: () => {
      invalidateMyAttendance(queryClient);
      toast.success("Checked in successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check in");
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.checkOut(),
    onSuccess: () => {
      invalidateMyAttendance(queryClient);
      toast.success("Checked out successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check out");
    },
  });
};

export const useAttendanceSummary = (date: string) => {
  return useQuery({
    queryKey: ["attendance-summary", date],
    queryFn: () =>
      userApi
        .getAdminAttendanceSummary(date)
        .then((response) => response.data),
    enabled: Boolean(date),
  });
};

export const useEmployeeAttendanceSummary = (
  employeeId: string | undefined,
) => {
  return useQuery({
    queryKey: ["attendance-employee-summary", employeeId],
    queryFn: () =>
      userApi
        .getAdminEmployeeAttendanceSummary(employeeId as string)
        .then((response) => response.data),
    enabled: Boolean(employeeId),
  });
};

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ["attendance-today"],
    queryFn: () =>
      userApi.getAdminAttendanceToday().then((response) => response.data),
  });
};

export const useMonthlyAttendance = (params: MonthlyAttendanceParams) => {
  return useQuery({
    queryKey: [
      "attendance-monthly",
      params.month,
      params.year,
      params.departmentId,
      params.employeeId,
      params.search,
    ],
    queryFn: () =>
      userApi
        .getAdminMonthlyAttendance(params)
        .then((response) => response.data),
  });
};

export const useAbsentAttendance = (params: AbsentAttendanceParams) => {
  return useQuery({
    queryKey: ["attendance-absent", params],
    queryFn: () =>
      userApi
        .getAdminAbsentAttendance(params)
        .then((response) => response.data),
  });
};

export const useAttendanceByEmployee = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["attendance", "employee", employeeId],
    queryFn: () =>
      userApi
        .getAttendanceByEmployeeId(employeeId as string)
        .then((response) => response.data),
    enabled: Boolean(employeeId),
  });
};