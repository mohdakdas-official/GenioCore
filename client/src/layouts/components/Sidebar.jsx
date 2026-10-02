import {
  Activity,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileCheck2,
  FolderGit2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";

import { useContext, useState } from "react";

import { useNavigate } from "react-router-dom";

import { SidebarItem } from "./SidebarItem";

import { Avatar } from "../../components/ui/Avatar";

import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

import { AuthContext } from "../../context/AuthContext";

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [logoutError, setLogoutError] = useState("");

  const mainNav = [
    {
      to: "/v1/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/v1/projects",
      icon: FolderGit2,
      label: "Projects",
    },
    {
      to: "/v1/reviews",
      icon: FileCheck2,
      label: "Reviews",
    },
  ];

  const insightsNav = [
    {
      to: "/v1/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
    {
      to: "/v1/activity",
      icon: Activity,
      label: "Activity",
    },
  ];

  const systemNav = [
    {
      to: "/v1/notifications",
      icon: Bell,
      label: "Notifications",
    },
    {
      to: "/v1/settings",
      icon: Settings,
      label: "Settings",
    },
    {
      to: "/v1/help",
      icon: HelpCircle,
      label: "Help & Support",
    },
  ];

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  const openLogoutDialog = () => {
    setLogoutError("");
    setIsLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    if (isLoggingOut) {
      return;
    }

    setLogoutError("");
    setIsLogoutDialogOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      setLogoutError("");

      if (!logout) {
        throw new Error("Logout is unavailable.");
      }

      await logout();

      setIsLogoutDialogOpen(false);

      navigate("/v1/auth/login", {
        replace: true,
      });
    } catch (error) {
      setLogoutError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sign out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.fullname?.trim() || user?.username || "Account";

  const email = user?.email ?? "";

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          role="button"
          tabIndex={-1}
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-border-subtle bg-surface transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-20" : "w-72"}`}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Code2 className="h-4 w-4 text-primary" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight tracking-tight text-text-primary">
                  NeuAspire
                </span>

                <span className="font-mono text-[10px] leading-tight text-muted">
                  AI Code Engine
                </span>
              </div>
            )}
          </div>

          {/* Collapse */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-text-primary lg:flex"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="scrollbar-none flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {/* MAIN */}
          <SidebarSection title="Main" isCollapsed={isCollapsed}>
            {mainNav.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                isCollapsed={isCollapsed}
                onClick={closeMobile}
              />
            ))}
          </SidebarSection>

          {/* INSIGHTS */}
          <SidebarSection title="Insights" isCollapsed={isCollapsed}>
            {insightsNav.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                isCollapsed={isCollapsed}
                onClick={closeMobile}
              />
            ))}
          </SidebarSection>

          {/* SYSTEM */}
          <SidebarSection title="System" isCollapsed={isCollapsed}>
            {systemNav.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                isCollapsed={isCollapsed}
                onClick={closeMobile}
              />
            ))}
          </SidebarSection>

          {/*
            No plan/usage widget here.

            We do not currently have a real:
            - subscription plan
            - billing state
            - monthly credit allowance
            - usage quota

            So nothing is displayed until
            those capabilities exist.
          */}
        </div>

        {/* User footer */}
        <div className="border-t border-border-subtle bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                navigate("/v1/settings");

                closeMobile();
              }}
              className={`${isCollapsed ? "justify-center" : "justify-start"} flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left transition-colors hover:bg-surface-hover`}
              title="Open settings"
            >
              <Avatar
                src={user?.avatar}
                name={displayName}
                email={email}
                size="sm"
              />

              {!isCollapsed && (
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-medium text-text-primary">
                    {displayName}
                  </span>

                  {email && (
                    <span className="truncate text-[10px] text-muted">
                      {email}
                    </span>
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && (
              <button
                type="button"
                onClick={openLogoutDialog}
                disabled={isLoggingOut}
                title="Log out"
                aria-label="Log out"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <ConfirmDialog
          isOpen={isLogoutDialogOpen}
          title="Sign out?"
          description={
            logoutError || "Are you sure you want to sign out of your account?"
          }
          confirmText={isLoggingOut ? "Signing Out..." : "Sign Out"}
          cancelText="Cancel"
          variant="danger"
          isLoading={isLoggingOut}
          onClose={closeLogoutDialog}
          onConfirm={handleLogout}
        />
      </aside>
    </>
  );
};

const SidebarSection = ({ title, isCollapsed, children }) => {
  return (
    <div>
      {!isCollapsed && (
        <h4 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
          {title}
        </h4>
      )}

      <div className="space-y-1">{children}</div>
    </div>
  );
};
