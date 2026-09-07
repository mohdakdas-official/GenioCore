import { useContext } from "react"; // standard React hook
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const DashboardRoute = () => {
  const { user, isAuthLoading } = useContext(AuthContext);

  // Guard against initial auth fetch/loading state
  if (isAuthLoading) {
    return PageLoader({ message: "Checking your session..." });
  }

  // Redirect if user is not authenticated at all
  if (!user) {
    return <Navigate to="/v1/auth/login" replace />;
  }

  // Redirect to onboarding if not completed
  if (!user.isOnboarded) {
    return <Navigate to="/v1/users/onboarding" replace />;
  }

  return <Outlet />;
};

export default DashboardRoute;
