import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useState } from "react";

const DashboardPage = () => {
  const { handleLogoutUser, user } = useAuth();
  const navigate = useNavigate();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const handlelogout = async () => {
    setIsLogoutLoading(true);
    try {
      const response = await handleLogoutUser();

      navigate("/", {
        state: {
          message: response.message,
        },
      });
    } catch (error) {
      error?.response?.data?.message ||
        error?.message ||
        "Unable to logout. please check your internet or refresh browser and try again.";
    } finally {
      setIsLogoutLoading(false);
    }
  };
  return (
    <>
      <div className="w-full h-screen p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to={"/"}>
              <ChevronLeft />
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              Dashboard
            </h2>
          </div>
          <div className="flex items-center justify-between gap-4">
            {/* User Greeting */}
            <div className="min-w-0">
              <p className="text-xs text-text-muted">Welcome back</p>

              <p className="truncate text-sm font-semibold text-text-primary sm:text-base">
                {user?.fullname || "User"} 👋
              </p>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handlelogout}
              disabled={isLogoutLoading}
              className="
      inline-flex shrink-0 cursor-pointer items-center justify-center gap-2
      rounded-lg bg-primary px-4 py-2
      text-sm font-semibold text-primary-foreground
      shadow-brand transition-colors
      hover:bg-primary-hover
      active:bg-primary-active
      disabled:cursor-not-allowed disabled:opacity-60
    "
            >
              {isLogoutLoading ? (
                <>
                  <span
                    className="
            h-4 w-4 animate-spin rounded-full
            border-2 border-primary-foreground/30
            border-t-primary-foreground
          "
                  />
                  <span className="hidden sm:inline">Logging out...</span>
                </>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
