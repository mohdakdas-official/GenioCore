import { forwardRef } from "react";

export const Input = forwardRef(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-medium text-text-primary tracking-tight">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-9 px-3 text-xs bg-surface border rounded-lg text-text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors duration-150 disabled:opacity-50 disabled:bg-surface-hover ${
            error
              ? "border-error focus:ring-error focus:border-error"
              : "border-border-subtle"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11px] text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export const Textarea = forwardRef(
  ({ label, error, helperText, className = "", rows = 3, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-medium text-text-primary tracking-tight">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full p-3 text-xs bg-surface border rounded-lg text-text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors duration-150 disabled:opacity-50 ${
            error ? "border-error focus:ring-error" : "border-border-subtle"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11px] text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
