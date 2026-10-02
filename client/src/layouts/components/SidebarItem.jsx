import { NavLink } from "react-router-dom";

export const SidebarItem = ({
  to,
  icon: Icon,
  label,
  badge,
  isCollapsed = false,
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 outline-none ${
          isActive
            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        } ${isCollapsed ? "justify-center" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
              isActive
                ? "text-primary-foreground"
                : "text-muted group-hover:text-text-primary"
            } ${isCollapsed ? "flex justify-center" : "flex justify-start"}`}
          />
          {!isCollapsed && (
            <span className="truncate text-[14px]">{label}</span>
          )}
          {!isCollapsed && badge && (
            <span
              className={`ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded ${
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-surface border border-border-subtle text-muted"
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};
