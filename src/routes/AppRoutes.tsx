import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import AuditLogs from "../pages/AuditLogs";
import DashboardLayout from "../layouts/DashboardLayout";
import FullPageLoader from "../components/common/FullPageLoader";

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
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
