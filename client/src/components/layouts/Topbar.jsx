import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import useAuth from "../../hooks/useAuth";

const Topbar = () => {
  const { user, handleLogoutUser } = useAuth();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);

      await handleLogoutUser();

      setIsLogoutDialogOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <button
        type="button"
        className="rounded-lg p-2 text-text-muted md:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-text-primary">
            {user?.fullname || "User"}
          </p>

          <p className="text-xs text-text-muted">{user?.email || ""}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary overflow-hidden">
          <img
            src={user?.avatar}
            alt="DP"
            className="h-full w-full object-cover"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLogoutDialogOpen(true);
          }}
          disabled={isLogoutLoading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={16} />

          <span className="hidden lg:inline">
            {isLogoutLoading ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Sign out?"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoggingOut}
        onClose={() => {
          if (!isLoggingOut) {
            setIsLogoutDialogOpen(false);
          }
        }}
        onConfirm={handleLogout}
      />
    </header>
  );
};

export default Topbar;
