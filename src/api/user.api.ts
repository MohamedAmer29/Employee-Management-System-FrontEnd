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

export interface PerformanceDistributionItem {
  rating: number;
  count: number;
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
    performanceDistribution: PerformanceDistributionItem[];
  };
  notifications: {
    total: number;
    unread: number;
  };
  recentActivities: RecentActivity[];
}

export interface ManagerRecentActivity {
  auditLog_id: string;
  auditLog_action: string;
  auditLog_entity: string;
  auditLog_description: string;
  auditLog_created_at: string;
  user_firstName: string;
  user_lastName: string;
}

export interface ManagerDashboard {
  department: {
    id: number;
    name: string;
  };
  employees: {
    total: number;
    active: number;
  };
  attendance: {
    presentToday: number;
    absentToday: number;
    lateToday: number;
    onLeaveToday: number;
    attendanceRate: number;
    monthlyRate: number;
  };
  attendanceTrend: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    attendanceRate: number;
  }>;
  leave: {
    pending: number;
    approved: number;
    rejected: number;
  };
  pendingLeaves: unknown[];
  performance: {
    averageRating: number;
    totalReviews: number;
    reviewsThisMonth: number;
    performanceDistribution: PerformanceDistributionItem[];
    latestReview: {
      rating: number;
      feedback: string;
      reviewDate: string;
    } | null;
  };
  payroll: {
    totalEmployees: number;
    totalBaseSalary: number;
    totalDeductions: number;
    totalBonuses: number;
    totalNetSalary: number;
    pendingPayroll: number;
    approvedPayroll: number;
    paidPayroll: number;
  };
  unreadNotifications: number;
  recentActivities: ManagerRecentActivity[];
}

export interface EmployeeDashboard {
  employee: {
    name: string;
    position: string;
    department: string;
    hireDate: string;
  };
  attendance: {
    today: {
      checkIn: string | null;
      checkOut: string | null;
      status: string;
    };
    monthlyRate: number;
    presentToday: number;
    absentToday: number;
    attendanceRate: number;
  };
  attendanceTrend: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    attendanceRate: number;
  }>;
  leave: {
    pending: number;
    approved: number;
    rejected: number;
  };
  performance: {
    averageRating: number;
    totalReviews: number;
    reviewsThisMonth: number;
    performanceDistribution: PerformanceDistributionItem[];
    latestReview: {
      rating: number;
      feedback: string;
      reviewDate: string;
    } | null;
  };
  payroll: {
    currentMonth: PayrollRecord | null;
    history: Array<{
      id: string;
      month: number;
      year: number;
      baseSalary: number;
      workingDays: number;
      attendedDays: number;
      absentDays: number;
      leaveDays: number;
      attendanceDeduction: number;
      totalDeductions: number;
      bonuses: number;
      netSalary: number;
      status: PayrollStatus;
    }>;
  };
  notifications: {
    unread: number;
    latest: AppNotification[];
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

export interface UpdateUserByIdRequest extends UpdateUserRequest {
  nationalId?: string;
  role?: UserRole;
}

export interface ChangePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  username: string;
  password: string;
  role: UserRole;
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

export interface UserEmployee {
  id: number;
  isActive: boolean;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  role: string;
  createdAt: string;
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
  emailVerifiedAt: string | null;
  profilePicture?: string | null;
  employee?: UserEmployee | null;
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
  employees?: Array<{
    id: number;
    isActive: boolean;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    role: string;
    profilePicture: string | null;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type AttendancePeriod = "today" | "week" | "month" | "year";

export interface ManagerEmployeeParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface ManagerEmployeesResponse {
  data: EmployeeDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateManagerEmployeeRequest {
  email: string;
  position: string;
}

export interface UpdateManagerEmployeeRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  position?: string;
  isActive?: boolean;
}

export interface AttendanceTrendPoint {
  date: string;
  present: number;
  absent: number;
}

export interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalLeave: number;
  attendanceRate: number;
  daysIncluded: number;
}

export interface AttendanceDaySummary {
  date: string;
  totalEmployees: number;
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  workingDays: number;
  attendanceRate: number;
}

export interface EmployeeAttendanceSummary {
  employeeId: number;
  employeeName: string;
  totalWorkingDays: number;
  present: number;
  absent: number;
  leave: number;
  late: number;
  workingDays: number;
  attendanceRate: number;
}

export interface TodayNotCheckedIn {
  employeeId: number;
  employeeName: string;
  department: string;
}

export interface TodayDepartmentSummary {
  department: string;
  total: number;
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  attendanceRate: number;
}

export interface TodayAttendanceRecord {
  id: string;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export interface AttendanceTodayResponse {
  date: string;
  totalEmployees: number;
  totalExpected: number;
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  onTime: number;
  checkedInToday: number;
  checkedOutToday: number;
  attendanceRate: number;
  workingDays: number;
  notCheckedIn: TodayNotCheckedIn[];
  departments: TodayDepartmentSummary[];
  attendance: TodayAttendanceRecord[];
}

export interface MonthlyAttendanceParams {
  month: number;
  year: number;
  departmentId?: string;
  employeeId?: string;
  search?: string;
}

export interface MonthlyDayAttendance {
  date: string;
  day: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  leaveReason: string | null;
}

export interface MonthlyEmployeeSummary {
  workingDays: number;
  present: number;
  absent: number;
  leave: number;
  late: number;
  attendanceRate: number;
}

export interface MonthlyAttendanceEmployee {
  employeeId: number;
  employeeName: string;
  email: string;
  department: string;
  position: string;
  summary: MonthlyEmployeeSummary;
  attendance: MonthlyDayAttendance[];
}

export interface MonthlyAttendanceResponse {
  month: number;
  year: number;
  totalEmployees: number;
  employees: MonthlyAttendanceEmployee[];
  summary: {
    totalEmployees: number;
    totalWorkingDays: number;
    totalPresent: number;
    totalAbsent: number;
    totalLeave: number;
    totalLate: number;
    overallAttendanceRate: number;
  };
}

export interface AbsentAttendanceParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  employeeId?: string;
}

export interface AbsentAttendanceRecord {
  id: string;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export interface AbsentAttendanceResponse {
  data: AbsentAttendanceRecord[];
  workingDays: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DepartmentAttendanceSummary {
  departmentId: number;
  departmentName: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  attendanceRate: number;
}

export interface AttendanceTrendResponse {
  attendanceTrend: AttendanceTrendPoint[];
  summary: AttendanceSummary;
  departments: DepartmentAttendanceSummary[];
}

export interface AttendanceRecord {
  id: number;
  employee: {
    id: number;
    isActive: boolean;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    role: string;
    profilePicture: string | null;
    createdAt: string;
  };
  date: string;
  checkIn: string;
  checkOut: string;
  isPresent: boolean;
  status?: string | null;
}

export interface MyAttendanceSummary {
  employeeId: number;
  employeeName: string;
  totalWorkingDays: number;
  present: number;
  absent: number;
  leave: number;
  late: number;
  attendanceRate: number;
}

export interface PerformanceReview {
  id: number;
  employee: {
    id: number;
    isActive: boolean;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    role: string;
    profilePicture: string | null;
    createdAt: string;
  };
  reviewerName: string;
  reviewerRole: string;
  feedback: string;
  rating: number;
  reviewDate: string;
}

export interface UpdatePerformanceRequest {
  employeeId: string;
  feedback: string;
  rating: number;
  reviewDate: string;
}

export interface CreatePerformanceRequest {
  employeeId: string;
  feedback: string;
  rating: number;
  reviewDate: string;
}

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "OVERDUE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskEmployee {
  id: number;
  fullName: string;
  email: string;
  position: string;
  role: string;
  isActive: boolean;
  department: { id: number; name: string } | null;
  profilePicture: string | null;
  userId: number;
}

export interface TaskManager {
  id: number;
  fullName: string;
  email: string;
}

export interface TaskDepartment {
  id: number;
  name: string;
}

export interface TaskCreatedBy {
  id: number;
  fullName: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedEmployee: TaskEmployee | null;
  assignedManager: TaskManager | null;
  department: TaskDepartment | null;
  createdBy: TaskCreatedBy;
}

export interface TasksResponse {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  employeeId?: string;
  managerId?: string;
  departmentId?: string;
  createdById?: string;
  dueDate?: string;
  search?: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  employeeId: string;
  managerId: string;
  priority: TaskPriority;
  dueDate: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: number;
  employee: {
    id: number;
    isActive: boolean;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    role: string;
    profilePicture: string | null;
    createdAt: string;
  };
  reason: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
}

export interface CreateLeaveRequest {
  reason: string;
  startDate: string;
  endDate: string;
}

export interface ManagerEmployee {
  id: number;
  isActive: boolean;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  role: string;
  department: { id: number; name: string } | null;
  createdAt: string;
}

export interface Manager {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  profilePicture: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  employee: ManagerEmployee | null;
}

export interface ManagersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departmentId?: string;
}

export interface UpdateManagerRequest {
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  phoneNumber?: string;
  nationalId?: string;
  position?: string;
  departmentId?: string;
}

export interface CreateManagerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  position: string;
  departmentId: string;
}

export interface ManagersResponse {
  data: Manager[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  username: string;
  profilePicture: string | null;
  role: string;
  tokenVersion: number;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  employee: {
    id: number;
    isActive: boolean;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    role: string;
    department: { id: number; name: string } | null;
    createdAt: string;
  } | null;
}

export interface AdminsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departmentId?: string;
}

export interface AdminsResponse {
  data: Admin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  phoneNumber?: string;
  nationalId?: string;
  position?: string;
}

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  departmentId: string;
}

export type PayrollStatus = "DRAFT" | "CALCULATED" | "APPROVED" | "PAID";

export interface PayrollEmployee {
  id: number;
  fullName: string;
  email: string;
  position: string;
  role: string;
  isActive: boolean;
  department: { id: number; name: string };
  profilePicture: string | null;
  userId: number;
}

export interface PayrollManager {
  id: number;
  fullName: string;
  email: string;
  position: string;
  role: string;
  isActive: boolean;
  department: { id: number; name: string };
  profilePicture: string | null;
  userId: number;
}

export interface PayrollRecord {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  workingDays: number;
  attendedDays: number;
  absentDays: number;
  leaveDays: number;
  dailySalary: number;
  attendanceDeduction: number;
  totalDeductions: number;
  totalBonuses: number;
  netSalary: number;
  status: PayrollStatus;
  employee: PayrollEmployee | null;
  manager: PayrollManager | null;
  deductions: PayrollEntry[];
  bonuses: PayrollEntry[];
  createdBy: { id: number; fullName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollListResponse {
  data: PayrollRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PayrollParams {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  status?: PayrollStatus;
  employeeId?: string;
  managerId?: string;
  search?: string;
}

export interface ManagerPayrollSummary {
  totalEmployees: number;
  totalBaseSalary: number;
  totalDeductions: number;
  totalBonuses: number;
  totalNetSalary: number;
  pendingPayroll: number;
  approvedPayroll: number;
  paidPayroll: number;
}

export interface ManagerPayrollParams {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  status?: PayrollStatus;
  employeeId?: string;
  managerId?: string;
  search?: string;
}

export interface CalculateSalaryRequest {
  month: number;
  year: number;
  baseSalary: number;
  workingDays: number;
}

export type DeductionType =
  | "ABSENCE"
  | "LATE"
  | "UNPAID_LEAVE"
  | "DISCIPLINARY"
  | "OTHER";
export type BonusType =
  | "PERFORMANCE"
  | "OVERTIME"
  | "HOLIDAY"
  | "REFERRAL"
  | "OTHER";

export interface PayrollDeductionRequest {
  amount: number;
  type: DeductionType;
  reason: string;
}

export interface PayrollBonusRequest {
  amount: number;
  type: BonusType;
  reason: string;
}

export interface PayrollEntry {
  id: number;
  amount: number;
  type: string;
  reason: string;
  createdAt: string;
}

export interface HealthCheckResponse {
  success: boolean;
  data: {
    database: "up" | "down";
    redis: "up" | "down";
    degraded: boolean;
  };
  details: {
    redis: {
      latencyMs: number;
    };
  };
  timestamp: string;
}

export interface EmployeeCurrentPayroll {
  exists: boolean;
  year: number;
  month: number;
}

export interface EmployeePayrollParams {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  status?: PayrollStatus;
  employeeId?: string;
  managerId?: string;
  search?: string;
}

export const userApi = {
  getCurrentUser: (token: string) =>
    api.post<CurrentUser>("/auth/current-user", { token }),
  getAdminDashboard: () => api.get<AdminDashboard>("/dashboard/admin"),
  getManagerDashboard: () => api.get<ManagerDashboard>("/dashboard/manager"),
  getEmployeeDashboard: () => api.get<EmployeeDashboard>("/dashboard/employee"),
  getAdminAttendanceTrend: (period: AttendancePeriod) =>
    api.get<AttendanceTrendResponse>("/dashboard/admin/attendance", {
      params: { period },
    }),
  getAdminAttendanceSummary: (date: string) =>
    api.get<AttendanceDaySummary>("/admin/attendance/summary", {
      params: { date },
    }),
  getAdminEmployeeAttendanceSummary: (employeeId: string) =>
    api.get<EmployeeAttendanceSummary>(
      `/admin/attendance/employee/${employeeId}/summary`,
    ),
  getAdminAttendanceToday: () =>
    api.get<AttendanceTodayResponse>("/admin/attendance/today"),
  getAdminMonthlyAttendance: (params: MonthlyAttendanceParams) =>
    api.get<MonthlyAttendanceResponse>("/admin/attendance/monthly", {
      params,
    }),
  getAdminAbsentAttendance: (params?: AbsentAttendanceParams) =>
    api.get<AbsentAttendanceResponse>("/admin/attendance/absent", {
      params,
    }),
  getAttendance: () => api.get<AttendanceRecord[]>("/attendance"),
  getMyAttendance: () =>
    api.get<AttendanceRecord[]>("/attendance/my-attendance"),
  getMyAttendanceSummary: () =>
    api.get<MyAttendanceSummary>("/attendance/my-attendance/summary"),
  checkIn: () => api.post<AttendanceRecord>("/attendance/check-in"),
  checkOut: () => api.post<AttendanceRecord>("/attendance/check-out"),
  getAttendanceByEmployeeId: (employeeId: string) =>
    api.get<AttendanceRecord[]>(`/attendance/${employeeId}`),
  getLeaveRequests: () => api.get<LeaveRequest[]>("/leave"),
  getLeaveByEmployeeId: (employeeId: string) =>
    api.get<LeaveRequest[]>(`/leave/${employeeId}`),
  createLeaveRequest: (data: CreateLeaveRequest) =>
    api.post<LeaveRequest>("/leave", data),
  approveLeave: (leaveId: string) =>
    api.patch<LeaveRequest>(`/leave/${leaveId}/approve`),
  rejectLeave: (leaveId: string) =>
    api.patch<LeaveRequest>(`/leave/${leaveId}/reject`),
  getPerformanceReviews: () => api.get<PerformanceReview[]>("/performance"),
  createPerformanceReview: (data: CreatePerformanceRequest) =>
    api.post<PerformanceReview>("/performance", data),
  updatePerformanceReview: (
    performanceId: string,
    data: UpdatePerformanceRequest,
  ) => api.patch<PerformanceReview>(`/performance/${performanceId}`, data),
  deletePerformanceReview: (performanceId: string) =>
    api.delete<PerformanceReview>(`/performance/${performanceId}`),
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
  getAdminManagers: (params?: ManagersParams) =>
    api.get<ManagersResponse>("/admin/managers", { params }),
  getAdminAdmins: (params?: AdminsParams) =>
    api.get<AdminsResponse>("/admin/admins", { params }),
  getAdminAdminById: (id: string | number) =>
    api.get<Admin>(`/admin/admins/${id}`),
  createAdminAdmin: (data: CreateAdminRequest) =>
    api.post<Admin>("/admin/admins", data),
  updateAdminAdmin: (id: string | number, data: UpdateAdminRequest) =>
    api.patch<Admin>(`/admin/admins/${id}`, data),
  activateAdmin: (id: string | number) =>
    api.patch<Admin>(`/admin/admins/${id}/activate`),
  deactivateAdmin: (id: string | number) =>
    api.patch<Admin>(`/admin/admins/${id}/deactivate`),
  getAdminManagerById: (id: string | number) =>
    api.get<Manager>(`/admin/managers/${id}`),
  updateAdminManager: (id: string | number, data: UpdateManagerRequest) =>
    api.patch<Manager>(`/admin/managers/${id}`, data),
  deleteAdminManager: (id: string | number) =>
    api.delete<{ message: string }>(`/admin/managers/${id}`),
  assignManagerToDepartment: (id: string | number, departmentId: string) =>
    api.patch<Manager>(`/admin/managers/${id}/department`, { departmentId }),
  activateManager: (id: string | number) =>
    api.patch<Manager>(`/admin/managers/${id}/activate`),
  deactivateManager: (id: string | number) =>
    api.patch<Manager>(`/admin/managers/${id}/deactivate`),
  createAdminManager: (data: CreateManagerRequest) =>
    api.post<Manager>("/admin/managers", data),
  getUsers: () => api.get<User[]>("/users"),
  createUser: (data: CreateUserRequest) => api.post<User>("/users", data),
  getUserById: (id: string | number) => api.get<User>(`/users/${id}`),
  updateUserById: (id: string | number, data: UpdateUserByIdRequest) =>
    api.patch<User>(`/users/${id}`, data),
  resetUserPassword: (id: string | number, data: ChangePasswordRequest) =>
    api.patch<User>(`/users/${id}/password`, data),
  deleteUser: (id: string | number) => api.delete<User>(`/users/${id}`),
  activateUser: (id: string | number) =>
    api.patch<User>(`/users/${id}/activate`),
  deactivateUser: (id: string | number) =>
    api.patch<User>(`/users/${id}/deactivate`),
  adminLogoutUser: (id: string | number) =>
    api.post(`/admin/users/${id}/logout`),
  makeAdminUser: (id: string | number) =>
    api.post(`/admin/users/${id}/make-admin`),
  getDepartments: () => api.get<Department[]>("/department"),
  createDepartment: (name: string) =>
    api.post<Department>("/department", { name }),
  updateDepartment: (id: string, name: string) =>
    api.put<Department>(`/department/${id}`, { name }),
  deleteDepartment: (id: string) => api.delete<Department>(`/department/${id}`),
  assignEmployeesToDepartment: (id: string, employeeIds: string[]) =>
    api.post<Department>(`/department/${id}/assign-employees`, {
      employeeIds,
    }),
  getEmployees: () => api.get<Employee[]>("/employees"),
  getManagerEmployees: (params?: ManagerEmployeeParams) =>
    api.get<ManagerEmployeesResponse>("/manager/employees", { params }),
  getManagerEmployeeById: (id: string | number) =>
    api.get<EmployeeDetail>(`/manager/employees/${id}`),
  createManagerEmployee: (data: CreateManagerEmployeeRequest) =>
    api.post<EmployeeDetail>("/manager/employees", data),
  updateManagerEmployee: (
    id: string | number,
    data: UpdateManagerEmployeeRequest,
  ) => api.patch<EmployeeDetail>(`/manager/employees/${id}`, data),
  deleteManagerEmployee: (id: string | number) =>
    api.delete<{ message: string }>(`/manager/employees/${id}`),
  updateManagerEmployeeStatus: (id: string | number, isActive: boolean) =>
    api.patch<EmployeeDetail>(`/manager/employees/${id}/status`, { isActive }),
  getManagerAttendance: () =>
    api.get<AttendanceRecord[]>("/manager/attendance"),
  getManagerEmployeeAttendance: (employeeId: string | number) =>
    api.get<AttendanceRecord[]>(`/manager/attendance/${employeeId}`),
  getManagerLeaveRequests: () => api.get<LeaveRequest[]>("/manager/leaves"),
  getManagerLeaveById: (leaveId: string | number) =>
    api.get<LeaveRequest>(`/manager/leaves/${leaveId}`),
  approveManagerLeave: (leaveId: string) =>
    api.patch<LeaveRequest>(`/manager/leaves/${leaveId}/approve`),
  rejectManagerLeave: (leaveId: string) =>
    api.patch<LeaveRequest>(`/manager/leaves/${leaveId}/reject`),
  getManagerPerformanceReviews: () =>
    api.get<PerformanceReview[]>("/manager/performance"),
  createManagerPerformanceReview: (data: CreatePerformanceRequest) =>
    api.post<PerformanceReview>("/manager/performance", data),
  getManagerPerformanceByEmployeeId: (employeeId: string | number) =>
    api.get<PerformanceReview[]>(`/manager/performance/${employeeId}`),
  createEmployee: (data: UpdateEmployeeRequest) =>
    api.post<EmployeeDetail>("/employees", data),
  getEmployeeById: (id: string) => api.get<EmployeeDetail>(`/employees/${id}`),
  updateEmployee: (id: string, data: Partial<UpdateEmployeeRequest>) =>
    api.put<EmployeeDetail>(`/employees/${id}`, data),
  deleteEmployee: (id: string) =>
    api.delete<EmployeeDetail>(`/employees/${id}`),
  makeManager: (id: string) =>
    api.patch<EmployeeDetail>(`/admin/employees/${id}/make-manager`),
  assignDepartment: (id: string, departmentId: string) =>
    api.post<EmployeeDetail>(`/employees/${id}/assign-department`, {
      departmentId,
    }),
  assignUser: (id: string, userId: string) =>
    api.post<EmployeeDetail>(`/employees/${id}/assign-user`, { userId }),
  uploadUserProfilePicture: (id: string | number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<CurrentUser>(`/users/${id}/profile-picture`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
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
    return api.post<EmployeeDetail>("/employees/me/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getTasks: (params?: TaskParams) =>
    api.get<TasksResponse>("/tasks", { params }),
  getTaskById: (taskId: string) => api.get<Task>(`/tasks/${taskId}`),
  createTask: (data: CreateTaskRequest) => api.post<Task>("/tasks", data),
  getMyTasks: () => api.get<Task[]>("/tasks/my"),
  updateTask: (taskId: string, data: UpdateTaskRequest) =>
    api.patch<Task>(`/tasks/${taskId}`, data),
  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    api.patch<Task>(`/tasks/${taskId}/status`, { status }),
  deleteTask: (taskId: string) =>
    api.delete<{ message: string }>(`/tasks/${taskId}`),

  // Payroll
  getPayroll: (params?: PayrollParams) =>
    api.get<PayrollListResponse>("/admin/payroll", { params }),
  getPayrollRecord: (payrollId: string) =>
    api.get<PayrollRecord>(`/admin/payroll/${payrollId}`),
  getPayrollEmployee: (employeeId: string, params?: PayrollParams) =>
    api.get<PayrollRecord[]>(`/admin/payroll/employee/${employeeId}`, {
      params,
    }),
  getPayrollManager: (managerId: string, params?: PayrollParams) =>
    api.get<PayrollRecord[]>(`/admin/payroll/manager/${managerId}`, { params }),
  getPayrollMonthly: (params?: PayrollParams) =>
    api.get<PayrollListResponse>("/admin/payroll/monthly", { params }),
  calculateEmployeeSalary: (employeeId: string, data: CalculateSalaryRequest) =>
    api.post<PayrollRecord>(
      `/admin/payroll/employee/${employeeId}/calculate`,
      data,
    ),
  calculateManagerSalary: (managerId: string, data: CalculateSalaryRequest) =>
    api.post<PayrollRecord>(
      `/admin/payroll/manager/${managerId}/calculate`,
      data,
    ),
  addDeduction: (payrollId: string, data: PayrollDeductionRequest) =>
    api.post<PayrollRecord>(`/admin/payroll/${payrollId}/deductions`, data),
  addBonus: (payrollId: string, data: PayrollBonusRequest) =>
    api.post<PayrollRecord>(`/admin/payroll/${payrollId}/bonuses`, data),
  approvePayroll: (payrollId: string) =>
    api.patch<PayrollRecord>(`/admin/payroll/${payrollId}/approve`),
  markPayrollPaid: (payrollId: string) =>
    api.patch<PayrollRecord>(`/admin/payroll/${payrollId}/mark-paid`),

  // Manager Payroll
  getManagerPayrollSummary: (params?: ManagerPayrollParams) =>
    api.get<ManagerPayrollSummary>("/manager/payroll/summary", { params }),
  getManagerPayroll: (params?: ManagerPayrollParams) =>
    api.get<PayrollListResponse>("/manager/payroll", { params }),
  getManagerPayrollEmployee: (employeeId: string, params?: ManagerPayrollParams) =>
    api.get<PayrollRecord[]>(`/manager/payroll/${employeeId}`, { params }),
  getManagerPayrollEmployeeMonthly: (employeeId: string, params?: ManagerPayrollParams) =>
    api.get<PayrollRecord[]>(`/manager/payroll/${employeeId}/monthly`, { params }),

  // Employee Payroll
  getEmployeePayroll: (params?: EmployeePayrollParams) =>
    api.get<PayrollListResponse>("/employee/payroll", { params }),
  getEmployeePayrollRecord: (payrollId: string) =>
    api.get<PayrollRecord>(`/employee/payroll/${payrollId}`),
  getEmployeePayrollHistory: (params?: EmployeePayrollParams) =>
    api.get<PayrollListResponse>("/employee/payroll/history", { params }),
  getEmployeeCurrentPayroll: () =>
    api.get<EmployeeCurrentPayroll>("/employee/payroll/current"),

  // Health Check
  getHealthCheck: () =>
    api.get<HealthCheckResponse>("/health"),
};
