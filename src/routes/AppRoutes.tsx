import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ResetOtp from "../pages/auth/ResetOtp";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import AuditLogs from "../pages/AuditLogs";
import AuditLogDetails from "../pages/AuditLogDetails";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import Employees from "../pages/Employees";
import EmployeeDetails from "../pages/EmployeeDetails";
import ManagerEmployees from "../pages/manager/ManagerEmployees";
import ManagerEmployeeDetails from "../pages/manager/ManagerEmployeeDetails";
import ManagerAttendance from "../pages/manager/ManagerAttendance";
import ManagerAttendanceEmployee from "../pages/manager/ManagerAttendanceEmployee";
import ManagerLeave from "../pages/manager/ManagerLeave";
import ManagerLeaveDetails from "../pages/manager/ManagerLeaveDetails";
import ManagerPerformance from "../pages/manager/ManagerPerformance";
import ManagerTasks from "../pages/manager/ManagerTasks";
import ManagerTaskDetails from "../pages/manager/ManagerTaskDetails";
import Departments from "../pages/Departments";
import DepartmentDetails from "../pages/DepartmentDetails";
import Attendance from "../pages/Attendance";
import MyAttendance from "../pages/employee/MyAttendance";
import MyLeave from "../pages/employee/MyLeave";
import EmployeeTasks from "../pages/employee/EmployeeTasks";
import EmployeeTaskDetails from "../pages/employee/EmployeeTaskDetails";
import AttendanceDetails from "../pages/AttendanceDetails";
import TodayAttendance from "../pages/TodayAttendance";
import MonthlyAttendance from "../pages/MonthlyAttendance";
import AbsentAttendance from "../pages/AbsentAttendance";
import Leave from "../pages/Leave";
import LeaveDetails from "../pages/LeaveDetails";
import Performance from "../pages/Performance";
import AdminPayroll from "../pages/admin/AdminPayroll";
import AdminPayrollDetails from "../pages/admin/AdminPayrollDetails";
import AdminPayrollEmployee from "../pages/admin/AdminPayrollEmployee";
import AdminPayrollManager from "../pages/admin/AdminPayrollManager";
import AdminPayrollMonthly from "../pages/admin/AdminPayrollMonthly";
import DashboardLayout from "../layouts/DashboardLayout";
import FullPageLoader from "../components/common/FullPageLoader";
import type { RootState } from "../store/store";

// Lazy-loaded routes to reduce the initial bundle size
const UsersPage = lazy(() => import("../pages/Users"));
const UserDetails = lazy(() => import("../pages/UserDetails"));
const ManagersPage = lazy(() => import("../pages/Managers"));
const ManagerDetails = lazy(() => import("../pages/ManagerDetails"));
const AdminsPage = lazy(() => import("../pages/Admins"));
const AdminDetails = lazy(() => import("../pages/AdminDetails"));

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector(
    (state: { auth: { isAuthenticated: boolean; loading: boolean } }) =>
      state.auth,
  );

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const PublicRoute = () => {
  const { isAuthenticated, loading } = useSelector(
    (state: { auth: { isAuthenticated: boolean; loading: boolean } }) =>
      state.auth,
  );

  if (loading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

const AttendanceRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Employee") {
    return <MyAttendance />;
  }

  if (role === "Manager") {
    return <ManagerAttendance />;
  }

  return <Attendance />;
};

const AttendanceDetailsRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Manager") {
    return <ManagerAttendanceEmployee />;
  }

  return <AttendanceDetails />;
};

const EmployeesRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Manager") {
    return <ManagerEmployees />;
  }

  return <Employees />;
};

const EmployeeDetailsRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Manager") {
    return <ManagerEmployeeDetails />;
  }

  return <EmployeeDetails />;
};

const LeaveRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Employee") {
    return <MyLeave />;
  }

  if (role === "Manager") {
    return <ManagerLeave />;
  }

  return <Leave />;
};

const LeaveDetailsRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Manager") {
    return <ManagerLeaveDetails />;
  }

  return <LeaveDetails />;
};

const PerformanceRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Manager") {
    return <ManagerPerformance />;
  }

  return <Performance />;
};

const TasksRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Employee") {
    return <EmployeeTasks />;
  }

  if (role === "Admin" || role === "Manager") {
    return <ManagerTasks />;
  }

  return <Navigate to="/home" replace />;
};

const TaskDetailsRoute = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "Employee") {
    return <EmployeeTaskDetails />;
  }

  if (role === "Admin" || role === "Manager") {
    return <ManagerTaskDetails />;
  }

  return <Navigate to="/home" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-otp" element={<ResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/audit-logs/:id" element={<AuditLogDetails />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/employees" element={<EmployeesRoute />} />
          <Route path="/employees/:id" element={<EmployeeDetailsRoute />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:id" element={<DepartmentDetails />} />
          <Route
            path="/managers"
            element={
              <Suspense fallback={<FullPageLoader />}>
                <ManagersPage />
              </Suspense>
            }
          />
          <Route
            path="/managers/:id"
            element={
              <Suspense fallback={<FullPageLoader />}>
                <ManagerDetails />
              </Suspense>
            }
          />
          <Route
            path="/admins"
            element={
              <Suspense fallback={<FullPageLoader />}>
                <AdminsPage />
              </Suspense>
            }
          />
          <Route
            path="/admins/:id"
            element={
              <Suspense fallback={<FullPageLoader />}>
                <AdminDetails />
              </Suspense>
            }
          />
          <Route path="/attendance" element={<AttendanceRoute />} />
          <Route path="/attendance/today" element={<TodayAttendance />} />
          <Route path="/attendance/monthly" element={<MonthlyAttendance />} />
          <Route path="/attendance/absent" element={<AbsentAttendance />} />
          <Route path="/attendance/:employeeId" element={<AttendanceDetailsRoute />} />
          <Route
            path="/users"
            element={
              <Suspense fallback={<FullPageLoader />}>
                <UsersPage />
              </Suspense>
            }
          />
          <Route
            path="/users/:id"
            element={
              <Suspense fallback={<FullPageLoader />}>
                <UserDetails />
              </Suspense>
            }
          />
          <Route path="/leave" element={<LeaveRoute />} />
          <Route path="/leave/:employeeId" element={<LeaveDetailsRoute />} />
          <Route path="/performance" element={<PerformanceRoute />} />
          <Route path="/tasks" element={<TasksRoute />} />
          <Route path="/tasks/:id" element={<TaskDetailsRoute />} />
          <Route path="/payroll" element={<AdminPayroll />} />
          <Route path="/payroll/monthly" element={<AdminPayrollMonthly />} />
          <Route path="/payroll/:id" element={<AdminPayrollDetails />} />
          <Route path="/payroll/employee/:employeeId" element={<AdminPayrollEmployee />} />
          <Route path="/payroll/manager/:managerId" element={<AdminPayrollManager />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
