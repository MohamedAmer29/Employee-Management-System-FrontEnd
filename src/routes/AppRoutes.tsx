import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
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
import Departments from "../pages/Departments";
import DepartmentDetails from "../pages/DepartmentDetails";
import Attendance from "../pages/Attendance";
import MyAttendance from "../pages/employee/MyAttendance";
import MyLeave from "../pages/employee/MyLeave";
import AttendanceDetails from "../pages/AttendanceDetails";
import TodayAttendance from "../pages/TodayAttendance";
import MonthlyAttendance from "../pages/MonthlyAttendance";
import AbsentAttendance from "../pages/AbsentAttendance";
import Leave from "../pages/Leave";
import LeaveDetails from "../pages/LeaveDetails";
import Performance from "../pages/Performance";
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

  return <Attendance />;
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

  return <Leave />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
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
          <Route path="/attendance/:employeeId" element={<AttendanceDetails />} />
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
          <Route path="/leave/:employeeId" element={<LeaveDetails />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
