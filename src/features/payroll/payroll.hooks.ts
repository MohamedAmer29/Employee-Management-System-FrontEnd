import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { userApi } from "../../api/user.api";
import type {
  PayrollParams,
  CalculateSalaryRequest,
  PayrollDeductionRequest,
  PayrollBonusRequest,
} from "../../api/user.api";

const invalidatePayroll = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["payroll"], exact: false });
};

export const usePayrollList = (params?: PayrollParams) => {
  return useQuery({
    queryKey: ["payroll", "list", params],
    queryFn: () =>
      userApi.getPayroll(params).then((response) => response.data),
    refetchOnMount: "always",
  });
};

export const usePayrollRecord = (payrollId: string, enabled = true) => {
  return useQuery({
    queryKey: ["payroll", "record", payrollId],
    queryFn: () =>
      userApi.getPayrollRecord(payrollId).then((response) => response.data),
    enabled,
    refetchOnMount: "always",
  });
};

export const usePayrollEmployee = (
  employeeId: string,
  params?: PayrollParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["payroll", "employee", employeeId, params],
    queryFn: () =>
      userApi
        .getPayrollEmployee(employeeId, params)
        .then((response) => response.data),
    enabled,
    refetchOnMount: "always",
  });
};

export const usePayrollManager = (
  managerId: string,
  params?: PayrollParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["payroll", "manager", managerId, params],
    queryFn: () =>
      userApi
        .getPayrollManager(managerId, params)
        .then((response) => response.data),
    enabled,
    refetchOnMount: "always",
  });
};

export const usePayrollMonthly = (params?: PayrollParams) => {
  return useQuery({
    queryKey: ["payroll", "monthly", params],
    queryFn: () =>
      userApi.getPayrollMonthly(params).then((response) => response.data),
    refetchOnMount: "always",
  });
};

export const useCalculateEmployeeSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      data,
    }: {
      employeeId: string;
      data: CalculateSalaryRequest;
    }) => userApi.calculateEmployeeSalary(employeeId, data),
    onSuccess: () => {
      invalidatePayroll(queryClient);
      toast.success("Employee salary calculated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to calculate salary");
    },
  });
};

export const useCalculateManagerSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      managerId,
      data,
    }: {
      managerId: string;
      data: CalculateSalaryRequest;
    }) => userApi.calculateManagerSalary(managerId, data),
    onSuccess: () => {
      invalidatePayroll(queryClient);
      toast.success("Manager salary calculated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to calculate salary");
    },
  });
};

export const useAddDeduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payrollId,
      data,
    }: {
      payrollId: string;
      data: PayrollDeductionRequest;
    }) => userApi.addDeduction(payrollId, data),
    onSuccess: () => {
      invalidatePayroll(queryClient);
      toast.success("Deduction added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add deduction");
    },
  });
};

export const useAddBonus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payrollId,
      data,
    }: {
      payrollId: string;
      data: PayrollBonusRequest;
    }) => userApi.addBonus(payrollId, data),
    onSuccess: () => {
      invalidatePayroll(queryClient);
      toast.success("Bonus added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add bonus");
    },
  });
};

export const useApprovePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payrollId: string) => userApi.approvePayroll(payrollId),
    onSuccess: () => {
      invalidatePayroll(queryClient);
      toast.success("Payroll approved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve payroll");
    },
  });
};

export const useMarkPayrollPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payrollId: string) => userApi.markPayrollPaid(payrollId),
    onSuccess: () => {
      invalidatePayroll(queryClient);
      toast.success("Payroll marked as paid!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark payroll as paid");
    },
  });
};
