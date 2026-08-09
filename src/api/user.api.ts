import api from "./axios";
import type { UserRole } from "@/config/navigation";

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  username: string;
  role: UserRole;
  tokenVersion: number;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  employee: unknown | null;
  [key: string]: unknown;
}

export interface RecentActivity {
  id: string;
  action: string;
  entity: string;
  description: string;
  user: string;
}

export interface DepartmentEmployee {
  departmentId: number;
  departmentName: string;
  employeeCount: number;
}

export interface AdminDashboard {
  employees: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  departments: {
    total: number;
    employeesPerDepartment: DepartmentEmployee[];
  };
  employeesPerDepartment: DepartmentEmployee[];
  attendance: {
    presentToday: number;
    absentToday: number;
    checkedInToday: number;
    checkedOutToday: number;
    attendanceRate: number;
  };
  leave: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    pendingRequests: unknown[];
  };
  performance: {
    averageRating: number;
    totalReviews: number;
    reviewsThisMonth: number;
    performanceDistribution: unknown[];
  };
  notifications: {
    total: number;
    unread: number;
  };
  recentActivities: RecentActivity[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  phoneNumber?: string;
}

export interface AuditLog {
  id: string;
  userId: number;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  oldValues: unknown | null;
  newValues: unknown | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    country: string;
    city: string;
    phoneNumber: string;
    nationalId: string;
    username: string;
    role: string;
    tokenVersion: number;
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerifiedAt: string;
  };
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogsResponse {
  success: boolean;
  message: string;
  data: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  username: string;
  role: string;
  tokenVersion: number;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt: string;
}

export const userApi = {
  getCurrentUser: (token: string) =>
    api.post<CurrentUser>("/auth/current-user", { token }),
  getAdminDashboard: () => api.get<AdminDashboard>("/dashboard/admin"),
  updateUser: (data: UpdateUserRequest) =>
    api.patch<CurrentUser>("/users/me", data),
  getAuditLogs: (params?: AuditLogsParams) =>
    api.get<AuditLogsResponse>("/audit-logs", { params }),
  getUsers: () => api.get<User[]>("/users"),
};
