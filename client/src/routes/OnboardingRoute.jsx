import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const OnboardingRoute = () => {
  const { user } = useAuth();

  if (user.isOnboarded) {
    return <Navigate to="/v1/dashboard" replace />;
  }

  return <Outlet />;
};

export default OnboardingRoute;
