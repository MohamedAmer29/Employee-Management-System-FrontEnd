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

export interface AdminDashboard {
  employees: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  departments: {
    total: number;
    employeesPerDepartment: Array<{ name?: string; count?: number }>;
  };
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
    performanceDistribution: Array<{ label?: string; value?: number }>;
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

export const userApi = {
  getCurrentUser: (token: string) =>
    api.post<CurrentUser>("/auth/current-user", { token }),
  getAdminDashboard: () => api.get<AdminDashboard>("/dashboard/admin"),
  updateUser: (data: UpdateUserRequest) =>
    api.patch<CurrentUser>("/users/me", data),
};
