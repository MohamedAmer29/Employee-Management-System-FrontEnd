import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import type { AttendancePeriod } from "../../api/user.api";

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