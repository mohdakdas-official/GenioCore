import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PageLoader from "../components/common/PageLoader";

const PublicRoute = () => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <PageLoader message="Checking your session..." />;
  }

  if (user) {
    return <Navigate to="/v1/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
