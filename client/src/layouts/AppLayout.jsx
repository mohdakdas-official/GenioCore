import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";

const AppLayout = () => {
  const location = useLocation();

  return (
    <AppShell>
      {/* key={location.pathname} route change par smooth 200ms fade trigger karega */}
      <div key={location.pathname} className="animate-fade-in w-full">
        <Outlet />
      </div>
    </AppShell>
  );
};

export default AppLayout;
