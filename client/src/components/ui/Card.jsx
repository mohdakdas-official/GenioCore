export const Card = ({ children, className = "", hover = false, ...props }) => {
  return (
    <div
      className={`bg-card border border-border-subtle rounded-xl p-5 transition-all duration-200 ease-out ${
        hover
          ? "hover:border-border-hover hover:bg-card-hover hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = "" }) => {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-text-primary tracking-tight">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
