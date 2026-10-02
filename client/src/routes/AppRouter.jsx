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
import LandingPage from "../pages/landing/LandingPage";
import { ChevronLeft } from "lucide-react";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AppLayout from "../layouts/AppLayout";
import ProjectsPage from "../pages/projects/ProjectsPage";
import ProjectDetailsPage from "../pages/projects/ProjectDetailsPage";
import ReviewsPage from "../pages/reviews/ReviewsPage";
import ReviewProcessingPage from "../pages/reviews/ReviewProcessingPage";
import ReviewReportPage from "../pages/reviews/ReviewReportPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import ActivityPage from "../pages/activity/ActivityPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import HelpPage from "../pages/help/HelpPage";

const AppRouter = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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

            <Route element={<ProtectedRoute />}>
              <Route path="users" element={<OnboardingRoute />}>
                <Route path="onboarding" element={<OnboardingPage />} />
              </Route>

              <Route element={<DashboardRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="dashboard" element={<DashboardPage />} />

                  <Route path="projects" element={<ProjectsPage />} />
                  <Route
                    path="projects/:projectId"
                    element={<ProjectDetailsPage />}
                  />

                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route
                    path="projects/:projectId/reviews/:reviewId/processing"
                    element={<ReviewProcessingPage />}
                  />
                  <Route
                    path="projects/:projectId/reviews/:reviewId"
                    element={<ReviewReportPage />}
                  />

                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="activity" element={<ActivityPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="appearance" element={<AppearancePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="help" element={<HelpPage />} />
                </Route>
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
