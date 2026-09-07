import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PageLoader from "../components/common/PageLoader";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="Verifying access..." />;
  }

  if (!user) {
    return <Navigate to="/v1/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
