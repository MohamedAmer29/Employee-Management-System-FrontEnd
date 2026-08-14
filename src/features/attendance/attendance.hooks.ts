import { useQuery } from "@tanstack/react-query";
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