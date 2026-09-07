import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "../pages/auth/login/LoginPage";
import SignupPage from "../pages/auth/register/SignupPage";
import ForgotPasswordPage from "../pages/auth/forgotpassword/ForgotPasswordPage";
import VerifyEmailPage from "../pages/auth/register/VerifyEmailPage";
import ResetPasswordPage from "../pages/auth/forgotpassword/ResetPasswordPage";
import AppearancePage from "../pages/AppearancePage";
import ProtectedRoute from "./ProtectedRoute";
import OnboardingRoute from "./OnboardingRoute";
import PublicRoute from "./PublicRoute";
import DashboardRoute from "./DashboardRoute";
import OnboardingPage from "../pages/onboarding/OnboardingPage";
import HomePage from "../pages/landing/HomePage";
import { ChevronLeft } from "lucide-react";
import DashboardPage from "../pages/dashboard/DashboardPage";

const AppRouter = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/v1">
            <Route path="auth">
              <Route element={<PublicRoute />}>
                <Route path="login" element={<LoginPage />} />

                <Route path="signup" element={<SignupPage />} />
                <Route
                  path="forgot-password"
                  element={<ForgotPasswordPage />}
                />

                <Route path="verify-email" element={<VerifyEmailPage />} />

                <Route path="reset-password" element={<ResetPasswordPage />} />
              </Route>
            </Route>
            <Route path="appearance" element={<AppearancePage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="users" element={<OnboardingRoute />}>
                <Route path="onboarding" element={<OnboardingPage />} />
              </Route>

              <Route element={<DashboardRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
              </Route>
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <div className="w-full h-screen flex items-center justify-center text-9xl font-bold ">
                404 Not Found
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRouter;
