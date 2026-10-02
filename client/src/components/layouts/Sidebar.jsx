import {
  LayoutDashboard,
  FolderKanban,
  ScanSearch,
  Settings,
  Sparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    to: "/v1/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    to: "/v1/projects",
    icon: FolderKanban,
  },
  {
    label: "Reviews",
    to: "/v1/reviews",
    icon: ScanSearch,
  },
  {
    label: "Settings",
    to: "/v1/settings",
    icon: Settings,
  },
];

const Sidebar = () => {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles size={18} />
        </div>

        <div>
          <p className="text-sm font-bold text-text-primary">GenioCore</p>

          <p className="text-xs text-text-muted">AI Code Review</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-background hover:text-text-primary",
                ].join(" ")
              }
            >
              <Icon size={18} />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium text-text-secondary">GenioCore</p>
          <p className="text-[10px] text-text-muted">An Entellens product</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
