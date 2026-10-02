import { Loader2 } from "lucide-react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  icon: Icon,
  iconPosition = "left",
  ...props
}) => {
  // src/components/ui/Button.jsx me baseStyles ko update karo:
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer";
  const sizeStyles = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-xs tracking-wide gap-2",
    lg: "h-11 px-5 text-sm gap-2.5",
    icon: "h-8 w-8 p-0",
  };

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm font-semibold",
    secondary:
      "bg-surface text-text-primary border border-border-subtle hover:bg-surface-hover hover:border-border-hover",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
    outline:
      "border border-border text-text-secondary hover:text-text-primary hover:border-border-hover hover:bg-surface",
    danger:
      "bg-error/10 text-error border border-error/20 hover:bg-error/20 active:bg-error/30",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon className="w-4 h-4 shrink-0" />
          )}
          {children}
          {Icon && iconPosition === "right" && (
            <Icon className="w-4 h-4 shrink-0" />
          )}
        </>
      )}
    </button>
  );
};
