import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import FullPageLoader from "../components/common/FullPageLoader";
import DashboardLayout from "../layouts/DashboardLayout";
import type { RootState } from "../store/store";

// ─── Lazy-loaded page components ────────────────────────────────
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ResetOtp = lazy(() => import("../pages/auth/ResetOtp"));
const Home = lazy(() => import("../pages/Home"));
const Profile = lazy(() => import("../pages/Profile"));
const AuditLogs = lazy(() => import("../pages/AuditLogs"));
const AuditLogDetails = lazy(() => import("../pages/AuditLogDetails"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Settings = lazy(() => import("../pages/Settings"));
const Employees = lazy(() => import("../pages/Employees"));
const EmployeeDetails = lazy(() => import("../pages/EmployeeDetails"));
const ManagerEmployees = lazy(() => import("../pages/manager/ManagerEmployees"));
const ManagerEmployeeDetails = lazy(() => import("../pages/manager/ManagerEmployeeDetails"));
const ManagerAttendance = lazy(() => import("../pages/manager/ManagerAttendance"));
const ManagerAttendanceEmployee = lazy(() => import("../pages/manager/ManagerAttendanceEmployee"));
const ManagerLeave = lazy(() => import("../pages/manager/ManagerLeave"));
const ManagerLeaveDetails = lazy(() => import("../pages/manager/ManagerLeaveDetails"));
const ManagerPerformance = lazy(() => import("../pages/manager/ManagerPerformance"));
const ManagerTasks = lazy(() => import("../pages/manager/ManagerTasks"));
const ManagerTaskDetails = lazy(() => import("../pages/manager/ManagerTaskDetails"));
const ManagerPayroll = lazy(() => import("../pages/manager/ManagerPayroll"));
const ManagerPayrollEmployee = lazy(() => import("../pages/manager/ManagerPayrollEmployee"));
const Departments = lazy(() => import("../pages/Departments"));
const DepartmentDetails = lazy(() => import("../pages/DepartmentDetails"));
const Attendance = lazy(() => import("../pages/Attendance"));
const MyAttendance = lazy(() => import("../pages/employee/MyAttendance"));
const MyLeave = lazy(() => import("../pages/employee/MyLeave"));
const EmployeeTasks = lazy(() => import("../pages/employee/EmployeeTasks"));
const EmployeeTaskDetails = lazy(() => import("../pages/employee/EmployeeTaskDetails"));
const AttendanceDetails = lazy(() => import("../pages/AttendanceDetails"));
const TodayAttendance = lazy(() => import("../pages/TodayAttendance"));
const MonthlyAttendance = lazy(() => import("../pages/MonthlyAttendance"));
const AbsentAttendance = lazy(() => import("../pages/AbsentAttendance"));
const Leave = lazy(() => import("../pages/Leave"));
const LeaveDetails = lazy(() => import("../pages/LeaveDetails"));
const Performance = lazy(() => import("../pages/Performance"));
const AdminPayroll = lazy(() => import("../pages/admin/AdminPayroll"));
const AdminPayrollDetails = lazy(() => import("../pages/admin/AdminPayrollDetails"));
const AdminPayrollEmployee = lazy(() => import("../pages/admin/AdminPayrollEmployee"));
const AdminPayrollManager = lazy(() => import("../pages/admin/AdminPayrollManager"));
const AdminPayrollMonthly = lazy(() => import("../pages/admin/AdminPayrollMonthly"));
const EmployeePayroll = lazy(() => import("../pages/employee/EmployeePayroll"));
const EmployeePayrollDetails = lazy(() => import("../pages/employee/EmployeePayrollDetails"));
const UsersPage = lazy(() => import("../pages/Users"));
const UserDetails = lazy(() => import("../pages/UserDetails"));
const ManagersPage = lazy(() => import("../pages/Managers"));
const ManagerDetails = lazy(() => import("../pages/ManagerDetails"));
const AdminsPage = lazy(() => import("../pages/Admins"));
const AdminDetails = lazy(() => import("../pages/AdminDetails"));

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<FullPageLoader />}>{children}</Suspense>
);

// ─── Route Guards ──────────────────────────────────────────────
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector(
    (state: { auth: { isAuthenticated: boolean; loading: boolean } }) =>
      state.auth,
  );

  if (loading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const { isAuthenticated, loading } = useSelector(
    (state: { auth: { isAuthenticated: boolean; loading: boolean } }) =>
      state.auth,
  );

  if (loading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <Outlet />;
};

// ─── Role-based Route Wrappers (kept small, not lazy) ──────────
const AttendanceRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Employee") return <MyAttendance />;
  if (role === "Manager") return <ManagerAttendance />;
  return <Attendance />;
};

const AttendanceDetailsRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Manager") return <ManagerAttendanceEmployee />;
  return <AttendanceDetails />;
};

const EmployeesRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Manager") return <ManagerEmployees />;
  return <Employees />;
};

const EmployeeDetailsRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Manager") return <ManagerEmployeeDetails />;
  return <EmployeeDetails />;
};

const LeaveRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Employee") return <MyLeave />;
  if (role === "Manager") return <ManagerLeave />;
  return <Leave />;
};

const LeaveDetailsRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Manager") return <ManagerLeaveDetails />;
  return <LeaveDetails />;
};

const PerformanceRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Manager") return <ManagerPerformance />;
  return <Performance />;
};

const TasksRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Employee") return <EmployeeTasks />;
  if (role === "Admin" || role === "Manager") return <ManagerTasks />;
  return <Navigate to="/home" replace />;
};

const TaskDetailsRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  if (role === "Employee") return <EmployeeTaskDetails />;
  if (role === "Admin" || role === "Manager") return <ManagerTaskDetails />;
  return <Navigate to="/home" replace />;
};

// ─── App Routes ────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Lazy><Login /></Lazy>} />
        <Route path="/register" element={<Lazy><Register /></Lazy>} />
        <Route path="/verify-email" element={<Lazy><VerifyEmail /></Lazy>} />
        <Route path="/forgot-password" element={<Lazy><ForgotPassword /></Lazy>} />
        <Route path="/reset-otp" element={<Lazy><ResetOtp /></Lazy>} />
        <Route path="/reset-password" element={<Lazy><ResetPassword /></Lazy>} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Lazy><Home /></Lazy>} />
          <Route path="/profile" element={<Lazy><Profile /></Lazy>} />
          <Route path="/audit-logs" element={<Lazy><AuditLogs /></Lazy>} />
          <Route path="/audit-logs/:id" element={<Lazy><AuditLogDetails /></Lazy>} />
          <Route path="/notifications" element={<Lazy><Notifications /></Lazy>} />
          <Route path="/settings" element={<Lazy><Settings /></Lazy>} />
          <Route path="/employees" element={<Lazy><EmployeesRoute /></Lazy>} />
          <Route path="/employees/:id" element={<Lazy><EmployeeDetailsRoute /></Lazy>} />
          <Route path="/departments" element={<Lazy><Departments /></Lazy>} />
          <Route path="/departments/:id" element={<Lazy><DepartmentDetails /></Lazy>} />
          <Route path="/managers" element={<Lazy><ManagersPage /></Lazy>} />
          <Route path="/managers/:id" element={<Lazy><ManagerDetails /></Lazy>} />
          <Route path="/admins" element={<Lazy><AdminsPage /></Lazy>} />
          <Route path="/admins/:id" element={<Lazy><AdminDetails /></Lazy>} />
          <Route path="/attendance" element={<Lazy><AttendanceRoute /></Lazy>} />
          <Route path="/attendance/today" element={<Lazy><TodayAttendance /></Lazy>} />
          <Route path="/attendance/monthly" element={<Lazy><MonthlyAttendance /></Lazy>} />
          <Route path="/attendance/absent" element={<Lazy><AbsentAttendance /></Lazy>} />
          <Route path="/attendance/:employeeId" element={<Lazy><AttendanceDetailsRoute /></Lazy>} />
          <Route path="/users" element={<Lazy><UsersPage /></Lazy>} />
          <Route path="/users/:id" element={<Lazy><UserDetails /></Lazy>} />
          <Route path="/leave" element={<Lazy><LeaveRoute /></Lazy>} />
          <Route path="/leave/:employeeId" element={<Lazy><LeaveDetailsRoute /></Lazy>} />
          <Route path="/performance" element={<Lazy><PerformanceRoute /></Lazy>} />
          <Route path="/tasks" element={<Lazy><TasksRoute /></Lazy>} />
          <Route path="/tasks/:id" element={<Lazy><TaskDetailsRoute /></Lazy>} />
          <Route path="/manager-payroll" element={<Lazy><ManagerPayroll /></Lazy>} />
          <Route path="/manager-payroll/employee/:employeeId" element={<Lazy><ManagerPayrollEmployee /></Lazy>} />
          <Route path="/payroll" element={<Lazy><AdminPayroll /></Lazy>} />
          <Route path="/payroll/monthly" element={<Lazy><AdminPayrollMonthly /></Lazy>} />
          <Route path="/payroll/:id" element={<Lazy><AdminPayrollDetails /></Lazy>} />
          <Route path="/payroll/employee/:employeeId" element={<Lazy><AdminPayrollEmployee /></Lazy>} />
          <Route path="/payroll/manager/:managerId" element={<Lazy><AdminPayrollManager /></Lazy>} />
          <Route path="/my-payroll" element={<Lazy><EmployeePayroll /></Lazy>} />
          <Route path="/my-payroll/:id" element={<Lazy><EmployeePayrollDetails /></Lazy>} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
