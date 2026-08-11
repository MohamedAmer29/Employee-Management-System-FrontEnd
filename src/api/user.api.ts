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
  profilePicture: string | null;
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

export interface ChangePasswordRequest {
  password: string;
  confirmPassword: string;
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

export interface AuditLogDetailResponse {
  success: boolean;
  message: string;
  data: AuditLog;
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
  employee?: unknown | null;
  manager?: unknown | null;
}

export interface AppNotification {
  id: string;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsParams {
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: AppNotification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationDetailResponse {
  success: boolean;
  message: string;
  data: AppNotification;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: { unread: number };
}

export interface Employee {
  id: number;
  isActive: boolean;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  role: string;
  profilePicture: string | null;
  department: { id: number; name: string } | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
  } | null;
  createdAt: string;
}

export interface EmployeeDetail extends Omit<Employee, "user"> {
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
    emailVerifiedAt: string | null;
  } | null;
}

export interface UpdateEmployeeRequest {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  role: "Admin" | "Manager" | "Employee";
  departmentId?: string;
  userId?: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  employees?: Array<{ id: number }>;
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  getCurrentUser: (token: string) =>
    api.post<CurrentUser>("/auth/current-user", { token }),
  getAdminDashboard: () => api.get<AdminDashboard>("/dashboard/admin"),
  updateUser: (data: UpdateUserRequest) =>
    api.patch<CurrentUser>("/users/me", data),
  changePassword: (data: ChangePasswordRequest) =>
    api.patch<CurrentUser>("/users/me/password", data),
  deactivateAccount: () => api.patch<CurrentUser>("/users/me/deactivate"),
  getNotifications: (params?: NotificationsParams) =>
    api.get<NotificationsResponse>("/notifications", { params }),
  getUnreadNotifications: (params?: NotificationsParams) =>
    api.get<NotificationsResponse>("/notifications/unread", { params }),
  getNotificationById: (id: string) =>
    api.get<NotificationDetailResponse>(`/notifications/${id}`),
  getUnreadNotificationCount: () =>
    api.get<UnreadCountResponse>("/notifications/unread-count"),
  markNotificationAsRead: (id: string) =>
    api.patch<NotificationDetailResponse>(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () =>
    api.patch<NotificationsResponse>("/notifications/read-all"),
  deleteNotification: (id: string) =>
    api.delete<NotificationsResponse>(`/notifications/${id}`),
  getAuditLogs: (params?: AuditLogsParams) =>
    api.get<AuditLogsResponse>("/audit-logs", { params }),
  getAuditLogById: (id: string) =>
    api.get<AuditLogDetailResponse>(`/audit-logs/${id}`),
  getUsers: () => api.get<User[]>("/users"),
  getDepartments: () => api.get<Department[]>("/department"),
  getEmployees: () => api.get<Employee[]>("/employees"),
  createEmployee: (data: UpdateEmployeeRequest) =>
    api.post<EmployeeDetail>("/employees", data),
  getEmployeeById: (id: string) => api.get<EmployeeDetail>(`/employees/${id}`),
  updateEmployee: (id: string, data: Partial<UpdateEmployeeRequest>) =>
    api.put<EmployeeDetail>(`/employees/${id}`, data),
  deleteEmployee: (id: string) => api.delete<EmployeeDetail>(`/employees/${id}`),
  assignDepartment: (id: string, departmentId: string) =>
    api.post<EmployeeDetail>(`/employees/${id}/assign-department`, {
      departmentId,
    }),
  assignUser: (id: string, userId: string) =>
    api.post<EmployeeDetail>(`/employees/${id}/assign-user`, { userId }),
  uploadEmployeeProfilePicture: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<EmployeeDetail>(
      `/employees/${id}/upload-profile-picture`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
  uploadMyProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<EmployeeDetail>(
      "/employees/me/profile-picture",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
